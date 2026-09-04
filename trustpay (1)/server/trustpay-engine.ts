export type Penalty = { rule: string; points: number; detail: string };

export type RiskSignals = {
  screenShareActive: boolean;
  newRecipient: boolean;
  duplicateTransaction: boolean;
  unusualTime: boolean;
  zScore: number;
  velocityScore: number;
  userMean: number;
  userStdDev: number;
  recentTransactionCount: number;
};

export type Decision = {
  score: number;
  penalties: Penalty[];
  status: "trusted" | "uncertain";
  signalCount: number;
  sanityReason: string;
  interface: "normal" | "normal_with_extra" | "simplified" | "emergency" | "review_pending";
  friction: "low" | "medium" | "high" | "very_high" | "maximum";
  channel: "in_app" | "in_app+sms" | "in_app+sms+email" | "in_app+sms+voice_call";
};

export function calculateDecision(signals: RiskSignals, historicalAverageScore: number): Decision {
  const penalties: Penalty[] = [];
  const add = (rule: string, points: number, detail: string) => penalties.push({ rule, points, detail });
  if (signals.screenShareActive) add("screenShareActive", 20, "Screen-sharing activity detected during the transaction.");
  if (signals.newRecipient) add("newRecipient", 15, "This recipient has not appeared in the user's prior transaction history.");
  if (signals.duplicateTransaction) add("duplicateTransaction", 25, "A matching amount and recipient appeared within the last 10 minutes.");
  if (signals.unusualTime) add("unusualTime", 10, "The transaction time is outside the user's normal historical pattern.");
  if (signals.zScore > 3) add("zScore>3", 20, "The amount is more than three standard deviations above the user's mean.");
  else if (signals.zScore > 2) add("zScore>2", 10, "The amount is more than two standard deviations above the user's mean.");
  if (signals.velocityScore > 80) add("velocity>80", 15, "Transaction velocity is significantly above the historical baseline.");
  else if (signals.velocityScore > 60) add("velocity>60", 8, "Transaction velocity is above the historical baseline.");

  const score = Math.max(0, Math.min(100, 100 - penalties.reduce((sum, penalty) => sum + penalty.points, 0)));
  const signalCount = [
    signals.screenShareActive,
    signals.newRecipient,
    signals.duplicateTransaction,
    signals.unusualTime,
    signals.zScore > 2,
    signals.velocityScore > 60,
  ].filter(Boolean).length;
  const sharpDrop = historicalAverageScore - score > 30;
  const uncertain = (score < 40 && signalCount < 2) || (sharpDrop && signalCount < 2);
  const sanityReason = uncertain
    ? sharpDrop
      ? "The score dropped sharply from the user's historical average, but fewer than two independent signals corroborate the change."
      : "The score is low, but fewer than two independent signals corroborate a hard block."
    : signalCount >= 2
      ? "Multiple independent signals corroborate the computed score."
      : "The score is consistent with the available evidence.";

  let response: Pick<Decision, "interface" | "friction" | "channel">;
  if (uncertain) response = { interface: "review_pending", friction: "medium", channel: "in_app+sms" };
  else if (score >= 80) response = { interface: "normal", friction: "low", channel: "in_app" };
  else if (score >= 60) response = { interface: "normal_with_extra", friction: "medium", channel: "in_app+sms" };
  else if (score >= 40) response = { interface: "simplified", friction: "high", channel: "in_app+sms+email" };
  else if (score >= 20) response = { interface: "emergency", friction: "very_high", channel: "in_app+sms+voice_call" };
  else response = { interface: "emergency", friction: "maximum", channel: "in_app+sms+voice_call" };

  return { score, penalties, status: uncertain ? "uncertain" : "trusted", signalCount, sanityReason, ...response };
}

export function warningCopy(signals: RiskSignals) {
  const warnings: Record<string, string> = {
    screenShareActive: "A screen-sharing app is active.",
    newRecipient: "This is a new recipient for your account.",
    duplicateTransaction: "A matching payment was just attempted.",
    unusualTime: "This transaction is outside your usual activity hours.",
    highAmount: "The amount is unusual compared with your history.",
    highVelocity: "Several transactions are occurring unusually close together.",
  };
  const result: string[] = [];
  if (signals.screenShareActive) result.push(warnings.screenShareActive);
  if (signals.newRecipient) result.push(warnings.newRecipient);
  if (signals.duplicateTransaction) result.push(warnings.duplicateTransaction);
  if (signals.unusualTime) result.push(warnings.unusualTime);
  if (signals.zScore > 2) result.push(warnings.highAmount);
  if (signals.velocityScore > 60) result.push(warnings.highVelocity);
  return result;
}
