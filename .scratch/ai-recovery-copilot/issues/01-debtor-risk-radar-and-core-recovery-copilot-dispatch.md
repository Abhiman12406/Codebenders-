# 01: Debtor Risk Radar and Core Recovery Copilot Dispatch

**What to build:** An operational intelligence slice that diagnoses client delinquency risk directly on the aging dashboard and enables instant, personalized recovery outreach. When viewing the accounts receivable aging radar, the studio owner sees an objective Debtor Delinquency Risk badge (Low, Moderate, High, or Critical) on overdue debtor cards. Clicking the "AI Recovery Copilot" button launches a dedicated cockpit modal displaying the calculated risk diagnostic and a pre-drafted, context-aware payment reminder containing verified invoice amounts, due dates, and a frictionless direct payment portal link. The owner can inspect the message and trigger a pre-filled WhatsApp deep link or copy the text with a single click.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Overdue debtor cards on the accounts receivable aging dashboard display an objective Delinquency Risk badge with clear visual tier styling (Low, Moderate, High, Critical).
- [x] Risk scoring objectively synthesizes days past due, historical client payment lag, and financial exposure magnitude.
- [x] The API endpoint `POST /api/ai/recovery-copilot` returns the debtor's risk analysis, recommended strategy, and drafted copy containing verified invoice numbers, principal amounts, and client portal links.
- [x] Clicking "AI Recovery Copilot" on any debtor card opens the recovery modal populated with the live diagnostic and drafted outreach message.
- [x] Clicking "Send via WhatsApp" opens `https://wa.me/{phone}` with the pre-filled, URL-encoded message text.
- [x] Clicking "Copy" copies the outreach text to the user's clipboard and provides clear visual confirmation.
- [x] Integration tests in the backend test runner verify HTTP 200 responses, schema validity, and error handling for invalid or missing invoices.
- [x] The frontend production bundle compiles cleanly with zero errors.
