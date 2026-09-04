import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express, Request, Response } from "express";
import { calculateDecision, warningCopy, type Decision, type Penalty, type RiskSignals } from "./trustpay-engine";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.TRUSTPAY_DB_PATH || path.resolve(__dirname, "../../trustpay.sqlite");
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");

const VELOCITY_WINDOW_HOURS = 6;
const DUPLICATE_WINDOW_MINUTES = 10;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_ENABLED = process.env.GEMINI_ENABLED === "true";

type DeviceContext = {
  screenShareActive?: boolean;
  foregroundApps?: string[];
  interactionEvents?: string[];
};

type TransactionInput = {
  userId: number;
  amount: number;
  recipientId: string;
  deviceContext?: DeviceContext;
};

type StoredTransaction = {
  id: string;
  userId: number;
  amount: number;
  recipientId: string;
  deviceContext: DeviceContext;
  createdAt: number;
  escrowState: string;
  holdUntil: number | null;
  decision: Decision;
  warnings: string[];
  naturalLanguageSummary: string;
  notifications: Array<Record<string, unknown>>;
};

function now() {
  return Date.now();
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      trusted_contact_phone TEXT,
      trusted_contact_email TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      recipient_id TEXT NOT NULL,
      device_context TEXT NOT NULL,
      escrow_state TEXT NOT NULL,
      hold_until INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS risk_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL UNIQUE,
      signals TEXT NOT NULL,
      penalties TEXT NOT NULL,
      score INTEGER NOT NULL,
      status TEXT NOT NULL,
      signal_count INTEGER NOT NULL,
      sanity_reason TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      channel TEXT NOT NULL,
      destination TEXT NOT NULL,
      message TEXT NOT NULL,
      simulated INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`INSERT INTO users (name, email, trusted_contact_phone, trusted_contact_email, created_at) VALUES (?, ?, ?, ?, ?)`);
    const result = insertUser.run("Sarah Chen", "sarah@example.com", "+1 (555) 010-2048", "alex.chen@example.com", now());
    const userId = Number(result.lastInsertRowid);
    const insertTransaction = db.prepare(`INSERT INTO transactions (id, user_id, amount, recipient_id, device_context, escrow_state, hold_until, created_at) VALUES (?, ?, ?, ?, ?, 'executed', NULL, ?)`);
    const seed = [
      ["seed-1", 84.5, "grocer-mart", 9],
      ["seed-2", 42, "metro-transit", 12],
      ["seed-3", 118.75, "utility-co", 15],
      ["seed-4", 65.2, "grocer-mart", 10],
      ["seed-5", 24.99, "streaming-plus", 18],
      ["seed-6", 210, "home-supplies", 14],
      ["seed-7", 38.4, "metro-transit", 8],
      ["seed-8", 92, "pharmacy", 11],
    ] as const;
    seed.forEach(([id, amount, recipient, hour], index) => {
      const timestamp = now() - (seed.length - index) * 3 * 24 * 60 * 60 * 1000;
      const created = new Date(timestamp);
      created.setHours(hour, 15, 0, 0);
      insertTransaction.run(id, userId, amount, recipient, JSON.stringify({ screenShareActive: false, foregroundApps: ["Banking app"], interactionEvents: ["tap", "confirm"] }), created.getTime());
    });
  }
}

initializeDatabase();

function getUser(userId: number) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as {
    id: number;
    name: string;
    email: string | null;
    trusted_contact_phone: string | null;
    trusted_contact_email: string | null;
    created_at: number;
  } | undefined;
}

function getTransactionsForUser(userId: number) {
  return db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Array<{
    id: string;
    user_id: number;
    amount: number;
    recipient_id: string;
    device_context: string;
    escrow_state: string;
    hold_until: number | null;
    created_at: number;
  }>;
}

function getSignals(transactionId: string) {
  return db.prepare("SELECT * FROM risk_signals WHERE transaction_id = ?").get(transactionId) as {
    signals: string;
    penalties: string;
    score: number;
    status: "trusted" | "uncertain";
    signal_count: number;
    sanity_reason: string;
  } | undefined;
}

function computeMeanAndStdDev(values: number[]) {
  if (values.length === 0) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

function computeSignals(input: TransactionInput, historical: ReturnType<typeof getTransactionsForUser>): RiskSignals {
  const cutoff = now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000;
  const velocityCutoff = now() - VELOCITY_WINDOW_HOURS * 60 * 60 * 1000;
  const amounts = historical.map(transaction => transaction.amount);
  const { mean, stdDev } = computeMeanAndStdDev(amounts);
  const zScore = stdDev === 0 ? (input.amount === mean ? 0 : input.amount > mean ? 4 : -4) : (input.amount - mean) / stdDev;
  const recentTransactions = historical.filter(transaction => transaction.created_at >= velocityCutoff);
  const duplicateTransaction = historical.some(transaction => transaction.created_at >= cutoff && transaction.amount === input.amount && transaction.recipient_id === input.recipientId);
  const newRecipient = !historical.some(transaction => transaction.recipient_id === input.recipientId);

  let unusualTime = false;
  if (historical.length >= 3) {
    const hours = historical.map(transaction => new Date(transaction.created_at).getHours());
    const { mean: hourMean, stdDev: hourStdDev } = computeMeanAndStdDev(hours);
    const tolerance = Math.max(2, hourStdDev * 2);
    const currentHour = new Date().getHours();
    unusualTime = Math.abs(currentHour - hourMean) > tolerance;
  }

  const spanHours = historical.length > 1 ? Math.max(24, (historical[0].created_at - historical[historical.length - 1].created_at) / (60 * 60 * 1000)) : 24;
  const expectedRecentCount = Math.max(0.5, (historical.length * VELOCITY_WINDOW_HOURS) / spanHours);
  const velocityScore = Math.min(100, Math.round((recentTransactions.length / expectedRecentCount) * 50));

  return {
    screenShareActive: Boolean(input.deviceContext?.screenShareActive),
    newRecipient,
    duplicateTransaction,
    unusualTime,
    zScore: round(zScore),
    velocityScore,
    userMean: round(mean),
    userStdDev: round(stdDev),
    recentTransactionCount: recentTransactions.length,
  };
}

function deterministicSummary(penalties: Penalty[]) {
  if (penalties.length === 0) return "No elevated risk signals were detected. The transaction can proceed with the normal experience.";
  const reasons = penalties.map(penalty => penalty.detail.replace(/\.$/, "").toLowerCase());
  return `This transaction needs extra care because ${reasons.join("; ")}.`;
}

async function generateGeminiSummary(penalties: Penalty[]) {
  const fallback = deterministicSummary(penalties);
  const key = process.env.GEMINI_API_KEY;
  if (!GEMINI_ENABLED || !key || penalties.length === 0) return fallback;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You write one concise, calm explanation for a banking user. You may only rephrase the supplied itemized penalties. Do not invent signals, do not mention hidden policy, do not change the risk decision, and do not give instructions to bypass safety checks. Return plain text in one or two sentences." }],
        },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ penalties }) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 120 },
      }),
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return fallback;
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function createNotifications(transactionId: string, userId: number, decision: Decision) {
  if (decision.score >= 40) return [];
  const user = getUser(userId);
  if (!user) return [];
  const destination = user.trusted_contact_phone || user.trusted_contact_email || "trusted-contact-not-configured";
  const channel = user.trusted_contact_phone ? "voice_call" : "email";
  const message = `TrustPay safety alert: a transaction for user ${user.name} scored ${decision.score}/100 and is on hold for review.`;
  const createdAt = now();
  db.prepare(`INSERT INTO notifications (transaction_id, user_id, channel, destination, message, simulated, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`).run(transactionId, userId, channel, destination, message, createdAt);
  return [{ transactionId, channel, destination, message, simulated: true, createdAt }];
}

function formatTransaction(transaction: { id: string; user_id: number; amount: number; recipient_id: string; device_context: string; escrow_state: string; hold_until: number | null; created_at: number }) : StoredTransaction {
  const storedSignals = getSignals(transaction.id);
  const decision: Decision = storedSignals ? {
    score: storedSignals.score,
    penalties: safeJsonParse<Penalty[]>(storedSignals.penalties, []),
    status: storedSignals.status,
    signalCount: storedSignals.signal_count,
    sanityReason: storedSignals.sanity_reason,
    ...mapResponse(storedSignals.score, storedSignals.status),
  } : {
    score: 100,
    penalties: [],
    status: "trusted",
    signalCount: 0,
    sanityReason: "No risk evaluation stored.",
    ...mapResponse(100, "trusted"),
  };
  const signals = storedSignals ? safeJsonParse<RiskSignals>(storedSignals.signals, {} as RiskSignals) : ({} as RiskSignals);
  const notificationRows = db.prepare("SELECT * FROM notifications WHERE transaction_id = ? ORDER BY created_at DESC").all(transaction.id) as Array<{ channel: string; destination: string; message: string; simulated: number; created_at: number }>;
  return {
    id: transaction.id,
    userId: transaction.user_id,
    amount: transaction.amount,
    recipientId: transaction.recipient_id,
    deviceContext: safeJsonParse<DeviceContext>(transaction.device_context, {}),
    createdAt: transaction.created_at,
    escrowState: transaction.escrow_state,
    holdUntil: transaction.hold_until,
    decision: { ...decision, signalCount: storedSignals?.signal_count ?? Object.values(signals).filter(Boolean).length },
    warnings: warningCopy(signals),
    naturalLanguageSummary: "",
    notifications: notificationRows.map(row => ({ channel: row.channel, destination: row.destination, message: row.message, simulated: Boolean(row.simulated), createdAt: row.created_at })),
  };
}

function mapResponse(score: number, status: "trusted" | "uncertain") : Pick<Decision, "interface" | "friction" | "channel"> {
  if (status === "uncertain") return { interface: "review_pending", friction: "medium", channel: "in_app+sms" };
  if (score >= 80) return { interface: "normal", friction: "low", channel: "in_app" };
  if (score >= 60) return { interface: "normal_with_extra", friction: "medium", channel: "in_app+sms" };
  if (score >= 40) return { interface: "simplified", friction: "high", channel: "in_app+sms+email" };
  if (score >= 20) return { interface: "emergency", friction: "very_high", channel: "in_app+sms+voice_call" };
  return { interface: "emergency", friction: "maximum", channel: "in_app+sms+voice_call" };
}

function getStoredSummary(transactionId: string) {
  const row = db.prepare("SELECT summary FROM transaction_explanations WHERE transaction_id = ?").get(transactionId) as { summary: string } | undefined;
  return row?.summary || "";
}

function attachExplanationTable() {
  db.exec(`CREATE TABLE IF NOT EXISTS transaction_explanations (transaction_id TEXT PRIMARY KEY, summary TEXT NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY (transaction_id) REFERENCES transactions(id))`);
}
attachExplanationTable();

function getFullTransaction(id: string) {
  const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as ReturnType<typeof getTransactionsForUser>[number] | undefined;
  if (!transaction) return undefined;
  const formatted = formatTransaction(transaction);
  formatted.naturalLanguageSummary = getStoredSummary(id) || deterministicSummary(formatted.decision.penalties);
  return formatted;
}

function createTransaction(input: TransactionInput) {
  const user = getUser(input.userId);
  if (!user) throw new Error("User not found");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Amount must be a positive number");
  if (!input.recipientId?.trim()) throw new Error("recipientId is required");

  const transactionId = `tx_${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = now();
  const historical = getTransactionsForUser(input.userId);
  const signals = computeSignals(input, historical);
  const scoredHistory = db.prepare("SELECT score FROM risk_signals WHERE transaction_id IN (SELECT id FROM transactions WHERE user_id = ?)").all(input.userId) as Array<{ score: number }>;
  const historicalAverageScore = scoredHistory.length ? scoredHistory.reduce((sum, row) => sum + row.score, 0) / scoredHistory.length : 100;
  const decision = calculateDecision(signals, historicalAverageScore);
  const warnings = warningCopy(signals);
  const isExecuted = decision.status === "trusted" && decision.score >= 80;
  const escrowState = isExecuted ? "executed" : "held";
  const holdUntil = isExecuted ? null : createdAt + (decision.score >= 40 ? 2 : 24) * 60 * 60 * 1000;
  const deviceContext = input.deviceContext || {};
  db.exec("BEGIN");
  try {
    db.prepare(`INSERT INTO transactions (id, user_id, amount, recipient_id, device_context, escrow_state, hold_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(transactionId, input.userId, input.amount, input.recipientId.trim(), JSON.stringify(deviceContext), escrowState, holdUntil, createdAt);
    db.prepare(`INSERT INTO risk_signals (transaction_id, signals, penalties, score, status, signal_count, sanity_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(transactionId, JSON.stringify(signals), JSON.stringify(decision.penalties), decision.score, decision.status, decision.signalCount, decision.sanityReason, createdAt);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const notifications = createNotifications(transactionId, input.userId, decision);
  return { transactionId, signals, decision, warnings, holdUntil, escrowState, notifications };
}

function autoCancelExpiredHolds() {
  db.prepare("UPDATE transactions SET escrow_state = 'cancelled', hold_until = NULL WHERE escrow_state = 'held' AND hold_until IS NOT NULL AND hold_until <= ?").run(now());
}
const timeout = setInterval(autoCancelExpiredHolds, 60_000);
timeout.unref();

function jsonError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown> | unknown) {
  return (req: Request, res: Response) => Promise.resolve(handler(req, res)).catch(error => jsonError(res, 400, error instanceof Error ? error.message : "Request failed"));
}

export function registerTrustPayRoutes(app: Express) {
  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "trustpay", timestamp: now() }));

  app.post("/api/users", asyncRoute(async (req, res) => {
    const body = req.body || {};
    const name = String(body.name || "Demo User").trim();
    const email = body.email ? String(body.email).trim() : null;
    const trustedContact = body.trustedContact || {};
    const phone = trustedContact.phone ? String(trustedContact.phone).trim() : null;
    const contactEmail = trustedContact.email ? String(trustedContact.email).trim() : null;
    const result = db.prepare(`INSERT INTO users (name, email, trusted_contact_phone, trusted_contact_email, created_at) VALUES (?, ?, ?, ?, ?)`).run(name, email, phone, contactEmail, now());
    const userId = Number(result.lastInsertRowid);
    const seed = Array.isArray(body.seedTransactions) ? body.seedTransactions : [];
    const insert = db.prepare(`INSERT INTO transactions (id, user_id, amount, recipient_id, device_context, escrow_state, hold_until, created_at) VALUES (?, ?, ?, ?, ?, 'executed', NULL, ?)`);
    for (const [index, item] of seed.entries()) {
      insert.run(`seed_${userId}_${index}_${crypto.randomUUID().slice(0, 5)}`, userId, Number(item.amount), String(item.recipientId), JSON.stringify(item.deviceContext || {}), now() - (seed.length - index) * 24 * 60 * 60 * 1000);
    }
    res.status(201).json({ userId, name, email, trustedContact: { phone, email: contactEmail }, seededTransactions: seed.length });
  }));

  app.post("/api/transactions", asyncRoute(async (req, res) => {
    const result = createTransaction({
      userId: Number(req.body?.userId),
      amount: Number(req.body?.amount),
      recipientId: String(req.body?.recipientId || ""),
      deviceContext: req.body?.deviceContext || {},
    });
    const naturalLanguageSummary = await generateGeminiSummary(result.decision.penalties);
    db.prepare("INSERT OR REPLACE INTO transaction_explanations (transaction_id, summary, created_at) VALUES (?, ?, ?)").run(result.transactionId, naturalLanguageSummary, now());
    const stored = getFullTransaction(result.transactionId);
    res.status(201).json({
      ...stored,
      pipeline: {
        layer1Ledger: "persisted",
        layer2Signals: result.signals,
        layer3Confidence: result.decision,
        layer35Sanity: { score: result.decision.score, status: result.decision.status, signalCount: result.decision.signalCount, reason: result.decision.sanityReason },
        layer4Response: { interface: result.decision.interface, friction: result.decision.friction, channel: result.decision.channel },
        layer5Escrow: { state: result.escrowState, holdUntil: result.holdUntil },
        layer6RenderState: result.decision.interface,
        layer7WarningCopy: result.warnings,
      },
      explanationSource: GEMINI_ENABLED && process.env.GEMINI_API_KEY ? `Google Gemini (${GEMINI_MODEL}) with deterministic fallback` : "Deterministic fallback (set GEMINI_ENABLED=true to opt into Gemini)",
    });
  }));

  app.get("/api/transactions/:id", (req, res) => {
    const transaction = getFullTransaction(req.params.id);
    if (!transaction) return jsonError(res, 404, "Transaction not found");
    return res.json(transaction);
  });

  app.get("/api/transactions/:id/render-state", (req, res) => {
    const transaction = getFullTransaction(req.params.id);
    if (!transaction) return jsonError(res, 404, "Transaction not found");
    return res.json({
      transactionId: transaction.id,
      amount: transaction.amount,
      recipientId: transaction.recipientId,
      escrowState: transaction.escrowState,
      holdUntil: transaction.holdUntil,
      score: transaction.decision.score,
      status: transaction.decision.status,
      interface: transaction.decision.interface,
      friction: transaction.decision.friction,
      channel: transaction.decision.channel,
      warnings: transaction.warnings,
      naturalLanguageSummary: transaction.naturalLanguageSummary,
    });
  });

  app.post("/api/transactions/:id/verify", asyncRoute(async (req, res) => {
    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id) as ReturnType<typeof getTransactionsForUser>[number] | undefined;
    if (!transaction) return jsonError(res, 404, "Transaction not found");
    if (transaction.escrow_state !== "held") return jsonError(res, 409, `Cannot verify a transaction in ${transaction.escrow_state} state`);
    db.prepare("UPDATE transactions SET escrow_state = 'released', hold_until = NULL WHERE id = ?").run(req.params.id);
    return res.json({ message: "Identity verified. Funds released.", transaction: getFullTransaction(req.params.id) });
  }));

  app.post("/api/transactions/:id/cancel", asyncRoute(async (req, res) => {
    const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id) as ReturnType<typeof getTransactionsForUser>[number] | undefined;
    if (!transaction) return jsonError(res, 404, "Transaction not found");
    if (transaction.escrow_state !== "held") return jsonError(res, 409, `Cannot cancel a transaction in ${transaction.escrow_state} state`);
    db.prepare("UPDATE transactions SET escrow_state = 'cancelled', hold_until = NULL WHERE id = ?").run(req.params.id);
    return res.json({ message: "Transaction cancelled. Funds returned.", transaction: getFullTransaction(req.params.id) });
  }));

  app.get("/api/users/:id/history", (req, res) => {
    const userId = Number(req.params.id);
    const user = getUser(userId);
    if (!user) return jsonError(res, 404, "User not found");
    const history = getTransactionsForUser(userId).map(formatTransaction).map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      recipientId: transaction.recipientId,
      createdAt: transaction.createdAt,
      escrowState: transaction.escrowState,
      score: transaction.decision.score,
      status: transaction.decision.status,
      interface: transaction.decision.interface,
    }));
    const scores = history.map(item => item.score);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, trustedContact: { phone: user.trusted_contact_phone, email: user.trusted_contact_email } }, history, runningAverageScore: scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 100 });
  });

  app.get("/api/demo/scenarios", (_req, res) => {
    const demoUser = db.prepare("SELECT id, name FROM users ORDER BY id LIMIT 1").get() as { id: number; name: string } | undefined;
    const userId = demoUser?.id || 1;
    return res.json({
      userId,
      userName: demoUser?.name || "Demo User",
      scenarios: [
        {
          id: "sarah-scam",
          label: "Sarah's remote-support scam",
          description: "Screen-share active, new recipient, unusually large amount, and odd-hour context.",
          tone: "critical",
          payload: { userId, amount: 4200, recipientId: "urgent-support-agent", deviceContext: { screenShareActive: true, foregroundApps: ["AnyDesk", "Banking app"], interactionEvents: ["remote_cursor", "paste_account_number", "rapid_confirm"] } },
        },
        {
          id: "legitimate-purchase",
          label: "Legitimate large purchase",
          description: "A new recipient and high amount without device-compromise signals.",
          tone: "safe",
          payload: { userId, amount: 1850, recipientId: "northstar-furniture", deviceContext: { screenShareActive: false, foregroundApps: ["Banking app", "Merchant checkout"], interactionEvents: ["review_details", "tap", "confirm"] } },
        },
        {
          id: "normal-transfer",
          label: "Normal known-recipient transfer",
          description: "A familiar recipient and amount close to historical behavior.",
          tone: "neutral",
          payload: { userId, amount: 72, recipientId: "grocer-mart", deviceContext: { screenShareActive: false, foregroundApps: ["Banking app"], interactionEvents: ["tap", "confirm"] } },
        },
      ],
    });
  });
}

export { getFullTransaction, createTransaction, computeSignals };
