import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clock3, Copy, Gauge, LockKeyhole, Radio, ShieldCheck, Sparkles, TriangleAlert, XCircle } from "lucide-react";

type Scenario = {
  id: string;
  label: string;
  description: string;
  tone: string;
  payload: {
    userId: number;
    amount: number;
    recipientId: string;
    deviceContext: {
      screenShareActive: boolean;
      foregroundApps: string[];
      interactionEvents: string[];
    };
  };
};

type Decision = {
  score: number;
  status: "trusted" | "uncertain";
  signalCount: number;
  sanityReason: string;
  interface: "normal" | "normal_with_extra" | "simplified" | "emergency" | "review_pending";
  friction: string;
  channel: string;
  penalties: Array<{ rule: string; points: number; detail: string }>;
};

type TransactionResult = {
  id: string;
  transactionId?: string;
  amount: number;
  recipientId: string;
  escrowState: string;
  holdUntil: number | null;
  decision: Decision;
  warnings: string[];
  naturalLanguageSummary: string;
  notifications: Array<{ channel: string; destination: string; message: string; simulated: boolean }>;
  explanationSource?: string;
};

const interfaceLabels: Record<string, string> = {
  normal: "Normal",
  normal_with_extra: "Normal + extra check",
  simplified: "Simplified",
  emergency: "Emergency",
  review_pending: "Review pending",
};

const formatMoney = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
const formatDate = (timestamp: number | null) => timestamp ? new Date(timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export default function Home() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [userId, setUserId] = useState(1);
  const [activeScenario, setActiveScenario] = useState("sarah-scam");
  const [amount, setAmount] = useState("4200");
  const [recipientId, setRecipientId] = useState("urgent-support-agent");
  const [screenShareActive, setScreenShareActive] = useState(true);
  const [foregroundApps, setForegroundApps] = useState("AnyDesk, Banking app");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/demo/scenarios")
      .then(response => response.json())
      .then(data => {
        setScenarios(data.scenarios || []);
        setUserId(data.userId || 1);
        const first = data.scenarios?.[0];
        if (first) applyScenario(first);
      })
      .catch(() => setError("Could not load demo scenarios. Is the server running?"));
  }, []);

  function applyScenario(scenario: Scenario) {
    setActiveScenario(scenario.id);
    setAmount(String(scenario.payload.amount));
    setRecipientId(scenario.payload.recipientId);
    setScreenShareActive(Boolean(scenario.payload.deviceContext.screenShareActive));
    setForegroundApps(scenario.payload.deviceContext.foregroundApps.join(", "));
    setResult(null);
    setError("");
  }

  async function runTransaction() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: Number(amount),
          recipientId,
          deviceContext: {
            screenShareActive,
            foregroundApps: foregroundApps.split(",").map(item => item.trim()).filter(Boolean),
            interactionEvents: ["review_details", "tap", "confirm"],
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Transaction could not be evaluated");
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Transaction could not be evaluated");
    } finally {
      setLoading(false);
    }
  }

  async function updateEscrow(action: "verify" | "cancel") {
    if (!result) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/transactions/${result.id || result.transactionId}/${action}`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update transaction");
      setResult(data.transaction);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update transaction");
    } finally {
      setActionLoading(false);
    }
  }

  async function copyPayload() {
    if (!result) return;
    await navigator.clipboard?.writeText(JSON.stringify({ transactionId: result.id || result.transactionId, decision: result.decision, escrowState: result.escrowState }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const activeInterface = result?.decision.interface || "normal";
  const isHeld = result?.escrowState === "held";
  const signalCount = result?.decision.signalCount ?? 0;
  const scoreColor = useMemo(() => {
    if (!result) return "neutral";
    if (result.decision.score >= 80) return "safe";
    if (result.decision.score >= 40) return "caution";
    return "critical";
  }, [result]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><ShieldCheck size={21} strokeWidth={2.4} /></div>
          <div><div className="brand-name">TrustPay</div><div className="brand-subtitle">Safety intelligence for every transfer</div></div>
        </div>
        <div className="topbar-status"><span className="pulse-dot" /> Demo environment <span className="status-divider" /> <span className="mono">API /api/transactions</span></div>
      </header>

      <main className="page-frame">
        <section className="hero-row">
          <div>
            <div className="eyebrow"><Radio size={14} /> REAL-TIME TRUST LAYER</div>
            <h1>Decide with <span>evidence.</span></h1>
            <p className="hero-copy">A transparent fraud-prevention layer that turns transaction context into calibrated protection—not a blunt approve or deny.</p>
          </div>
          <div className="hero-metrics">
            <div className="metric"><span className="metric-label">PIPELINE</span><strong>7 layers</strong><span>deterministic core</span></div>
            <div className="metric"><span className="metric-label">NOTIFICATIONS</span><strong>Simulated</strong><span>no external sends</span></div>
            <div className="metric"><span className="metric-label">EXPLANATION</span><strong>Gemini</strong><span>rephrases only</span></div>
          </div>
        </section>

        <div className="workspace">
          <aside className="control-panel panel">
            <div className="panel-heading"><div><div className="panel-kicker">CONTROL ROOM</div><h2>Run a transaction</h2></div><span className="live-chip"><span className="pulse-dot" /> LIVE</span></div>
            <p className="panel-intro">Choose a pre-built story or tune the inputs to see how TrustPay adapts friction and protection.</p>

            <div className="field-group"><label>DEMO SCENARIO</label>
              <div className="scenario-list">{scenarios.map(scenario => (
                <button key={scenario.id} className={`scenario-card ${activeScenario === scenario.id ? "selected" : ""}`} onClick={() => applyScenario(scenario)}>
                  <span className={`scenario-dot ${scenario.tone}`} />
                  <span><strong>{scenario.label}</strong><small>{scenario.description}</small></span>
                  <ArrowRight size={15} className="scenario-arrow" />
                </button>
              ))}</div>
            </div>

            <div className="form-grid">
              <div className="field-group"><label htmlFor="amount">AMOUNT</label><div className="input-wrap prefix"><span>$</span><input id="amount" value={amount} onChange={event => setAmount(event.target.value)} inputMode="decimal" /></div></div>
              <div className="field-group"><label htmlFor="recipient">RECIPIENT ID</label><input id="recipient" value={recipientId} onChange={event => setRecipientId(event.target.value)} /></div>
            </div>
            <div className="field-group"><label htmlFor="apps">FOREGROUND APPS</label><input id="apps" value={foregroundApps} onChange={event => setForegroundApps(event.target.value)} /></div>
            <div className="toggle-row"><div><strong>Screen-sharing active</strong><small>Device context signal</small></div><button aria-label="Toggle screen sharing" className={`toggle ${screenShareActive ? "on" : ""}`} onClick={() => setScreenShareActive(value => !value)}><span /></button></div>
            <button className="primary-button" onClick={runTransaction} disabled={loading}>{loading ? <><span className="spinner" /> Evaluating pipeline…</> : <><Gauge size={17} /> Evaluate transaction <ArrowRight size={16} /></>}</button>
            {error && <div className="error-banner"><TriangleAlert size={16} />{error}</div>}
            <div className="deterministic-note"><LockKeyhole size={14} /><span>Score, sanity check, and friction are <strong>rule-based</strong>. Gemini only writes the explanation.</span></div>
          </aside>

          <section className="decision-panel">
            {!result ? <EmptyState /> : <>
              <div className="decision-header"><div><div className="panel-kicker">LIVE DECISION</div><h2>{result.decision.status === "uncertain" ? "Review before release" : result.escrowState === "executed" ? "Transaction trusted" : "Transaction held for safety"}</h2><p className="decision-id"><span className="mono">{result.id || result.transactionId}</span><button className="icon-button" onClick={copyPayload} title="Copy decision payload">{copied ? <Check size={14} /> : <Copy size={14} />}</button>{copied && <span className="copied">Copied</span>}</p></div><div className={`score-orb ${scoreColor}`}><strong>{result.decision.score}</strong><span>/ 100</span><small>trust score</small></div></div>
              <div className={`decision-banner ${scoreColor}`}><div className="banner-icon">{scoreColor === "safe" ? <CheckCircle2 size={21} /> : <AlertTriangle size={21} />}</div><div><strong>{interfaceLabels[activeInterface]}</strong><span>{result.decision.friction} friction · {result.decision.channel.replaceAll("+", " + ")}</span></div><span className="banner-state">{result.escrowState.toUpperCase()}</span></div>

              <div className="decision-grid">
                <div className="subpanel evidence-panel"><div className="subpanel-title"><span>WHY THIS SCORE</span><span className="signal-count">{signalCount} signals</span></div>
                  {result.decision.penalties.length === 0 ? <div className="no-signals"><Check size={16} /> No penalty rules fired</div> : <div className="penalty-list">{result.decision.penalties.map(penalty => <div className="penalty" key={penalty.rule}><div className="penalty-line"><span className="penalty-rule">{penalty.rule}</span><span className="penalty-points">−{penalty.points}</span></div><p>{penalty.detail}</p></div>)}</div>}
                </div>
                <div className="subpanel summary-panel"><div className="subpanel-title"><span>HUMAN EXPLANATION</span><span className="gemini-tag"><Sparkles size={12} /> Gemini</span></div><blockquote>“{result.naturalLanguageSummary}”</blockquote><small className="source-note">{result.explanationSource || "Gemini or deterministic fallback"}</small></div>
              </div>

              <div className="decision-grid lower"><div className="subpanel"><div className="subpanel-title"><span>DETERMINISTIC WARNINGS</span><span className="layer-badge">LAYER 7</span></div><div className="warning-tags">{result.warnings.length ? result.warnings.map(warning => <span key={warning}><AlertTriangle size={13} /> {warning}</span>) : <span className="muted">No warning copy required.</span>}</div></div><div className="subpanel"><div className="subpanel-title"><span>ESCROW SAFETY NET</span><span className="layer-badge">LAYER 5</span></div><div className="escrow-row"><span className={`state-dot ${result.escrowState}`} /><strong>{result.escrowState}</strong>{isHeld && <span className="hold-until"><Clock3 size={13} /> until {formatDate(result.holdUntil)}</span>}</div>{result.notifications?.length > 0 && <div className="notification-line"><Radio size={13} /> Simulated trusted-contact {result.notifications[0].channel} logged</div>}</div></div>

              {isHeld && <div className="action-row"><button className="secondary-button" onClick={() => updateEscrow("cancel")} disabled={actionLoading}><XCircle size={16} /> Cancel & return funds</button><button className="verify-button" onClick={() => updateEscrow("verify")} disabled={actionLoading}><CheckCircle2 size={16} /> Verify identity & release</button></div>}
            </>}
          </section>
        </div>

        <section className="states-section"><div className="section-heading"><div><div className="panel-kicker">RESPONSE MAPPER</div><h2>Five interface states, one decision model</h2></div><p>Thresholds stay traceable. The interface adapts to the confidence dial.</p></div><div className="state-strip">{(["normal", "normal_with_extra", "simplified", "emergency", "review_pending"] as const).map((state, index) => <div key={state} className={`state-card ${state} ${activeInterface === state ? "active" : ""}`}><div className="state-number">0{index + 1}</div><div className="state-visual"><span className="state-visual-bar" /><span className="state-visual-bar short" /><span className="state-visual-dot" /></div><strong>{interfaceLabels[state]}</strong><small>{state === "normal" ? "≥ 80 · low friction" : state === "normal_with_extra" ? "60–79 · medium" : state === "simplified" ? "40–59 · high" : state === "emergency" ? "< 40 · very high" : "sanity override · medium"}</small>{activeInterface === state && <span className="active-label">CURRENT</span>}</div>)}</div></section>

        <footer><span><ShieldCheck size={15} /> TRUSTPAY / HACKATHON DEMO</span><span>Explainable by design · Built as one Express service + SQLite</span></footer>
      </main>
    </div>
  );
}

function EmptyState() {
  return <div className="empty-state"><div className="empty-orbit"><div className="empty-core"><ShieldCheck size={35} /></div><span className="orbit-dot one" /><span className="orbit-dot two" /><span className="orbit-dot three" /></div><div className="panel-kicker">AWAITING SIGNALS</div><h2>Your decision console is ready</h2><p>Run a scenario to trace the full TrustPay pipeline from ledger event to adaptive safety response.</p><div className="empty-steps"><span><b>01</b> collect context</span><span><b>02</b> score evidence</span><span><b>03</b> map protection</span></div></div>;
}
