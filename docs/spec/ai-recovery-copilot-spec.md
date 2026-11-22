# Feature Spec: AI Late-Payment Recovery & Negotiation Copilot

## Problem Statement

As a solo freelance designer or boutique studio owner, client cash flow delays are an existential threat to my business and personal livelihood. When clients fail to pay invoices on time, I am caught in a stressful dilemma:
- If I stay silent, my cash runway drains, forcing me to delay paying my own studio software bills, subcontractors, or personal expenses.
- If I send aggressive, generic collection reminders, I risk insulting long-term clients, damaging commercial goodwill, and forfeiting future referral work.
- Invoices over $5,000 often stall not out of malice, but due to internal client bureaucracy, lost paperwork, missing purchase orders, or cash-flow crunches on their side.
- Manually drafting customized, emotionally calibrated follow-up messages across email and WhatsApp takes hours each week—mental energy that should be spent on billable client design work.
- I lack objective data on which debtors represent a genuine default risk versus those experiencing standard operational delay, leaving me unable to prioritize my collections effort or offer structured settlement solutions (such as early-payment discounts or installment plans) at the optimal moment.

## Solution

The **AI Late-Payment Recovery & Negotiation Copilot** is an intelligent receivables recovery assistant embedded directly within the studio accounts receivable cockpit. 

When an invoice becomes pending, due, or overdue, the copilot automatically:
1. **Evaluates Debtor Delinquency Risk**: Synthesizes the invoice's days past due, financial exposure magnitude, and the client's historical payment lag into an objective 4-tier risk status (Low, Moderate, High, Critical).
2. **Generates Context-Calibrated Negotiation Strategies**: Instantly crafts 5 distinct behavioral escalation drafts tailored to the debtor's exact situation:
   - *Friendly Check-in*: A courteous pre-due or day-zero reminder verifying invoice receipt and removing payment friction.
   - *Direct Status Inquiry*: A polite, professional inquiry confirming processing status and requesting missing accounts payable requirements.
   - *Studio Operational Hold*: An assertive notification that upcoming project deliverables and studio scheduling are paused until the account is current.
   - *Dynamic Settlement & Restructuring*: A collaborative negotiation offer proposing a 2% fast-settlement discount or structured 50/50 installment schedule to unlock immediate cash.
   - *Statutory Legal Notice*: A formal legal demand invoking contract terms, statutory monthly interest accrual, and protections under the *Freelance Isn't Free Act*.
3. **Provides Frictionless Omnichannel Outreach**: Prepares tailored copy for both WhatsApp (direct `wa.me` mobile deep links) and Email (complete with subject lines and body copy), with each message embedding a direct link to the interactive client payment portal.
4. **Ensures Supervised Autonomy (Human-in-the-Loop)**: The studio owner retains 100% control, able to review, tweak, toggle discount terms, or edit custom instructions with real-time regeneration before any message is dispatched.

---

## User Stories

1. As a solo studio owner, I want to see an objective Debtor Delinquency Risk badge on each overdue debtor card, so that I can immediately identify which accounts require urgent attention versus routine check-ins.
2. As a solo studio owner, I want the copilot to evaluate a debtor's historical payment lag alongside their current days past due, so that a client who normally pays 5 days late is not prematurely categorized as a high default risk.
3. As a solo studio owner, I want to open the AI Recovery Copilot directly from the accounts receivable aging dashboard, so that I do not have to leave my operational cockpit to manage collections.
4. As a solo studio owner, I want the copilot to automatically generate a friendly pre-due courtesy check-in, so that I can ensure the client has received the invoice and approved the payment schedule before the deadline arrives.
5. As a solo studio owner, I want the copilot to draft a direct inquiry message for invoices 1–7 days late, so that I can courteously ask if any accounts payable details or vendor setup forms are missing.
6. As a solo studio owner, I want the copilot to draft an assertive operational hold notification for invoices 8–21 days late, so that the client understands active deliverables and future scheduling are conditionally paused.
7. As a solo studio owner, I want the copilot to generate a dynamic 2% fast-settlement discount offer for chronic or stalled receivables, so that cash-strapped clients are incentivized to settle immediately.
8. As a solo studio owner, I want to toggle a 50/50 milestone installment restructuring proposal, so that clients experiencing temporary cash shortages can pay half immediately rather than withholding the entire sum.
9. As a solo studio owner, I want the copilot to calculate the exact discounted invoice amount in real time when dynamic discounting is toggled, so that I do not have to do manual arithmetic.
10. As a solo studio owner, I want the copilot to generate a formal statutory notice citing the *Freelance Isn't Free Act* for severely delinquent accounts (30+ days overdue), so that I can establish a formal legal paper trail with legal weight.
11. As a solo studio owner, I want the copilot to automatically embed a direct link to the client payment portal inside every generated message, so that the client can settle the invoice with zero checkout friction.
12. As a solo studio owner, I want the copilot to provide optimized message copy for WhatsApp, so that I can leverage higher mobile open rates (90%+) and rapid resolution times.
13. As a solo studio owner, I want the copilot to provide structured email copy (including subject line and formal body), so that I can communicate with corporate clients who mandate formal email accounting records.
14. As a solo studio owner, I want to click a single button to launch WhatsApp with the pre-filled message draft, so that I can inspect and dispatch the message in seconds.
15. As a solo studio owner, I want a single-click copy button for email drafts and payment portal links, so that I can paste them into my email client without formatting errors.
16. As a solo studio owner, I want to input custom context or instructions (such as "client mentioned their finance manager was on vacation"), so that the AI draft naturally accommodates the client's specific circumstances.
17. As a solo studio owner, I want the copilot to work offline and in guest demo mode using local calculation models, so that my studio operations never crash when disconnected from the server.
18. As a solo studio owner, I want the copilot to log my follow-up attempts (timestamp, channel, strategy used), so that I maintain an audit trail of all debtor communication.
19. As a solo studio owner, I want the copilot to strictly use verified numbers from my database, so that no hallucinated totals, wrong dates, or incorrect invoice numbers ever reach my clients.
20. As a solo studio owner, I want to switch between the 5 escalation strategies with a single click and see the draft update immediately, so that I can compare different tones before deciding.
21. As a solo studio owner, I want the copilot to recommend the single most appropriate strategy based on the debtor's profile, so that I don't have to guess which tone is appropriate.
22. As a solo studio owner, I want the copilot to calculate statutory interest accrual (e.g., 1.5% per month) on severely overdue balances, so that clients understand the cost of extended non-payment.
23. As a solo studio owner, I want the copilot to include client-specific project titles and invoice numbers in the copy, so that corporate accounts payable departments can easily reconcile the bill.
24. As a solo studio owner, I want the copilot to ensure that all generated drafts comply with professional ethical debt collection standards, so that my studio brand remains elevated and respectable.

---

## Implementation Decisions

### Architectural Decisions
- **Supervised Autonomy (Human-in-the-Loop)**: The AI Copilot serves strictly as an intelligence and drafting layer. Automated transmission without user review is prohibited to protect commercial relationships.
- **Deterministic Numerical Anchoring**: Financial values (principal amount, due date, invoice ID, client phone, portal URLs, discounted total) are injected deterministically from the database store. The AI engine is never permitted to invent or approximate invoice sums.
- **Dual-Engine Operation (Server + Offline Fallback)**: The primary engine runs via the backend Express API. If the server is offline or running in guest demo mode, an identical client-side fallback calculation executes seamlessly in the browser.
- **Unified Copilot Modal**: Rather than having disjointed modals, the existing WhatsApp modal is elevated into the comprehensive AI Recovery Copilot Modal, offering seamless switching between WhatsApp deep links and email copy.

### Module Contracts & Interfaces

#### 1. Recovery Copilot Engine
The calculation and drafting engine computes debtor risk and strategies based on the following data contract:

```typescript
interface DebtorRiskAnalysis {
  score: number; // 0 to 100
  tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: {
    daysPastDue: number;
    historicalLagDays: number;
    amountExposureRatio: number; // Invoice amount relative to baseline studio volume
  };
  summary: string;
}

interface RecoveryStrategy {
  id: 'friendly' | 'inquiry' | 'hold' | 'settlement' | 'legal';
  title: string;
  badge: string;
  recommendedWhen: string;
  dynamicDiscountAvailable: boolean;
  installmentAvailable: boolean;
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
}

interface RecoveryCopilotPayload {
  invoiceId: string;
  riskAnalysis: DebtorRiskAnalysis;
  recommendedStrategyId: string;
  strategies: Record<string, RecoveryStrategy>;
  paymentPortalUrl: string;
}
```

#### 2. Debtor Risk Scoring Algorithm
The risk score (0–100) is deterministically derived from:
- **Aging Score (Weight: 50%)**:
  - $DPD \le 0$: 0 pts
  - $1 \le DPD \le 7$: 25 pts
  - $8 \le DPD \le 21$: 55 pts
  - $22 \le DPD \le 45$: 80 pts
  - $DPD > 45$: 100 pts
- **Historical Delay Score (Weight: 30%)**:
  - Compares $DPD$ against the client's `avg_delay_days`. If the current delay is within their historical norm, risk penalty is dampening; if the current delay exceeds $2 \times \text{avg\_delay\_days}$, risk penalty spikes to 100.
- **Exposure Magnitude Score (Weight: 20%)**:
  - Scores relative amount weight (e.g. invoices $\ge \$5,000$ carry higher liquidity impact).

#### 3. API Contract
- **Endpoint**: `POST /api/ai/recovery-copilot`
- **Request Body**:
  ```json
  {
    "invoice_id": "inv_123",
    "custom_instructions": "Client mentioned AP delay until next payroll",
    "discount_percent": 2
  }
  ```
- **Response**: HTTP 200 with `RecoveryCopilotPayload`, or HTTP 400/404 on missing or invalid parameters.

---

## Testing Decisions

### What Makes a Good Test
Tests must evaluate external behavior and outcomes rather than internal regex matching or intermediate variable states:
- A valid invoice ID must produce an HTTP 200 response containing all 5 required recovery strategies and a valid numeric risk score between 0 and 100.
- An overdue invoice (>30 days) must produce a risk tier of `HIGH` or `CRITICAL` and recommend an assertive strategy (`settlement` or `legal`).
- A current or pre-due invoice must produce a `LOW` risk tier and recommend `friendly`.
- When dynamic discounting is requested, the returned message text must reflect the mathematically correct reduced balance and expiration window.
- Missing or invalid IDs must return HTTP 400 or 404 with structured error messages.

### Tested Modules & Seam
- **Primary Seam: The HTTP API Seam (`POST /api/ai/recovery-copilot`)**
  - Following the codebase's existing pattern in `server/test-api.js`, all recovery engine logic, risk calculations, strategy formulations, and database bindings are verified through the top-level API endpoint over HTTP.
- **Prior Art**:
  - `server/test-api.js` (existing PASS checks for `/api/invoices`, `/api/forecast`, `/api/triage`, and `/api/ai/parse`).
  - `npm run build` (production Vite compilation testing all UI imports, icons, and bundle integrity).

---

## Out of Scope

- **Autonomous Background Sending**: The system will not automatically send messages without the user clicking the send or copy action.
- **Third-Party Collections Agency Integration**: No data sharing or handoff to commercial collection agencies or debt buyers.
- **Direct ACH / Bank Debit Pulling**: The copilot will not initiate automated debit pulls from client accounts without manual client authorization via the pay portal.
- **Automated Legal Court Filing**: The system generates statutory notices citing relevant laws (e.g., FIFA), but does not automate court docket submissions or litigation filing.
- **Multi-Currency FX Hedging**: Invoices are handled in the studio's designated primary currency without real-time forex arbitrage.

---

## Further Notes

- **Statutory Framework**: In jurisdictions including New York City and New York State, the *Freelance Isn't Free Act* requires payment within 30 days of completion unless otherwise contracted, and allows for statutory double damages for non-payment. Referencing this framework in Tier 5 communications provides critical legal legitimacy.
- **Behavioral Economics Principle**: Providing a 2% early settlement discount creates an immediate financial incentive for corporate accounting teams to bump the freelance invoice to the top of their weekly payment run.
