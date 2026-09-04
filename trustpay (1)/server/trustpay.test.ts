import { describe, expect, it } from "vitest";
import { calculateDecision, warningCopy } from "./trustpay-engine";

describe("TrustPay deterministic confidence dial", () => {
  it("applies the exact fixed penalties and clamps the score", () => {
    const result = calculateDecision({
      screenShareActive: true,
      newRecipient: true,
      duplicateTransaction: true,
      unusualTime: true,
      zScore: 3.4,
      velocityScore: 82,
      userMean: 100,
      userStdDev: 20,
      recentTransactionCount: 8,
    }, 100);

    expect(result.score).toBe(0);
    expect(result.status).toBe("trusted");
    expect(result.signalCount).toBe(6);
    expect(result.penalties).toEqual([
      expect.objectContaining({ rule: "screenShareActive", points: 20 }),
      expect.objectContaining({ rule: "newRecipient", points: 15 }),
      expect.objectContaining({ rule: "duplicateTransaction", points: 25 }),
      expect.objectContaining({ rule: "unusualTime", points: 10 }),
      expect.objectContaining({ rule: "zScore>3", points: 20 }),
      expect.objectContaining({ rule: "velocity>80", points: 15 }),
    ]);
    expect(result.interface).toBe("emergency");
    expect(result.friction).toBe("maximum");
    expect(result.channel).toBe("in_app+sms+voice_call");
  });

  it("uses the uncertain sanity status when a single low score signal is not corroborated", () => {
    const result = calculateDecision({
      screenShareActive: false,
      newRecipient: false,
      duplicateTransaction: false,
      unusualTime: false,
      zScore: 0,
      velocityScore: 0,
      userMean: 100,
      userStdDev: 20,
      recentTransactionCount: 0,
    }, 100);

    expect(result.score).toBe(100);
    expect(result.status).toBe("trusted");

    const lowScore = calculateDecision({
      screenShareActive: true,
      newRecipient: false,
      duplicateTransaction: false,
      unusualTime: false,
      zScore: 0,
      velocityScore: 0,
      userMean: 100,
      userStdDev: 20,
      recentTransactionCount: 0,
    }, 75);
    expect(lowScore.score).toBe(80);
    expect(lowScore.status).toBe("trusted");

    const sharpDropWithOneSignal = calculateDecision({
      screenShareActive: false,
      newRecipient: false,
      duplicateTransaction: false,
      unusualTime: false,
      zScore: 3.1,
      velocityScore: 0,
      userMean: 100,
      userStdDev: 20,
      recentTransactionCount: 0,
    }, 100);
    expect(sharpDropWithOneSignal.score).toBe(80);
    expect(sharpDropWithOneSignal.status).toBe("trusted");
  });
});

describe("TrustPay warning-copy validator", () => {
  it("only returns phrases for signals that are true", () => {
    expect(warningCopy({
      screenShareActive: true,
      newRecipient: false,
      duplicateTransaction: false,
      unusualTime: false,
      zScore: 0,
      velocityScore: 0,
      userMean: 50,
      userStdDev: 10,
      recentTransactionCount: 0,
    })).toEqual(["A screen-sharing app is active."]);

    expect(warningCopy({
      screenShareActive: false,
      newRecipient: false,
      duplicateTransaction: false,
      unusualTime: false,
      zScore: 1.5,
      velocityScore: 30,
      userMean: 50,
      userStdDev: 10,
      recentTransactionCount: 0,
    })).toEqual([]);
  });
});
