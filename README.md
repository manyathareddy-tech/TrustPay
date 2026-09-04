# TrustPay — Payments That Know the Difference

**One tap shouldn't mean the same thing whether you're buying coffee or being scammed on the phone. TrustPay reads the difference in real time.**

---

## The problem

Every digital payment app shows the exact same confirmation screen whether it's your 50th routine payment or your first-ever transfer while a scammer talks you through it on the phone — and that sameness is exactly what fraud exploits.

## What TrustPay does

TrustPay reads three things about every transaction in real time — **risk** (is this recipient new, is a screen-sharing app active), **ability** (is this user struggling right now), and **rhythm** (does this break their normal spending pattern) — and combines them into a single **Confidence Dial** score. That one score controls everything the user sees next: how simple the screen is, how much confirmation is required, and whether flagged transfers get held in a reversible escrow window with a trusted contact notified.

No black-box model making the final call. No accessibility settings buried in a menu. No generic "suspicious activity" warning nobody trusts.

**Note — this is a hackathon prototype.** Trusted-contact notifications (SMS, voice calls) are simulated in the UI and are not actually sent to a real phone. The scoring logic itself is real and runs live on whatever inputs are given to it — only the outbound notification is mocked for this demo.
