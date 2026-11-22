# 03: Dynamic Settlement Restructuring, Audit Logging and Offline Resilience

**What to build:** An advanced negotiation and operational resilience layer that allows studio owners to unlock stuck receivables through dynamic financial incentives and maintain continuity even without server access. The studio owner can toggle dynamic financial options within the copilot modal—such as offering a 2% fast-settlement discount for immediate clearance or restructuring into a 50/50 milestone payment plan. Toggling these options automatically calculates the discounted total, updates the payment terms, and weaves them directly into the generated draft. When an outreach action is triggered (via WhatsApp or Copy), an interaction record is appended to the debtor's follow-up audit trail. If the backend server is unreachable or running in guest demo mode, an offline fallback calculation engine seamlessly performs all risk scoring and draft generation locally in the browser.

**Blocked by:** 02: 5-Tier Behavioral Escalation Matrix with Omnichannel Email and Custom Prompts

**Status:** ready-for-agent

- [ ] The copilot modal provides an interactive toggle for a 2% early-settlement discount, automatically computing the reduced balance and payment expiration deadline.
- [ ] Toggling dynamic discounting updates the drafted WhatsApp and Email copy in real time with the precise calculated terms and discounted amount.
- [ ] The copilot modal provides an interactive option for a 50/50 installment split, formulating terms for an immediate 50% deposit and 50% upon milestone completion.
- [ ] Dispatching or copying a recovery draft logs an entry into the debtor's communication audit trail with a timestamp, strategy ID, and channel.
- [ ] When the backend API is offline or the application runs in Guest Demo Mode (localStorage), client-side fallback logic generates the full risk analysis and strategies without crashing or error banners.
- [ ] Mathematical calculations for discounts and installments are covered by automated unit/integration checks.
- [ ] The frontend production bundle compiles cleanly with zero warnings or errors.
