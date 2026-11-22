# 02: 5-Tier Behavioral Escalation Matrix with Omnichannel Email and Custom Prompts

**What to build:** A multi-cadence negotiation engine that generates tailored outreach across 5 psychological escalation tiers and supports formal email communications alongside WhatsApp. Within the AI Recovery Copilot modal, the studio owner can seamlessly switch between 5 distinct behavioral strategies (Friendly Check-in, Direct Status Inquiry, Studio Operational Hold, Settlement Proposal, and Statutory Legal Notice citing the Freelance Isn't Free Act). Switching strategies immediately re-renders the drafted message. An omnichannel tab toggle allows switching between informal WhatsApp chat copy and formal email drafts (including subject lines and formatted body text). The owner can also enter custom notes or instructions (e.g. "client mentioned finance manager is away this week") and trigger real-time regeneration.

**Blocked by:** 01: Debtor Risk Radar and Core Recovery Copilot Dispatch

**Status:** ready-for-agent

- [ ] The copilot modal provides interactive strategy cards allowing the user to select any of the 5 behavioral cadences: Friendly Check-in, Direct Status Inquiry, Studio Operational Hold, Settlement Proposal, and Statutory Legal Notice.
- [ ] Selecting a strategy instantly updates the message preview with tailored copy matching that psychological tier.
- [ ] For accounts overdue by 30+ days, the statutory legal notice formally references statutory interest and contractor protections (such as the Freelance Isn't Free Act).
- [ ] Omnichannel tabs allow toggling between WhatsApp copy and structured Email copy (with an explicit subject line and formatted message body).
- [ ] Single-click copy buttons are provided for the email subject line, email body, and standalone payment portal link.
- [ ] A custom prompt input field enables the user to inject contextual instructions and regenerate the strategy drafts in real time.
- [ ] Automated tests verify the generation and structure of all 5 escalation strategies and validate custom instruction injection.
- [ ] The frontend production bundle compiles cleanly with zero errors.
