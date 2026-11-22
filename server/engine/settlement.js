// Settlement options for overdue balances: early-payment discount and 50/50 instalments.

const round2 = (x) => Math.round(x * 100) / 100;

// Domain constants: 2% early-clearance discount expiring in 7 days
const EARLY_DISCOUNT_RATE = 0.02;
const EXPIRATION_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function applyEarlyDiscount(total, { today = new Date() } = {}) {
  const discountedTotal = round2(total * (1 - EARLY_DISCOUNT_RATE));
  const savings = round2(total - discountedTotal);
  const expiresOn = new Date(today.getTime() + EXPIRATION_WINDOW_DAYS * DAY_MS).toISOString().slice(0, 10);
  return { discountedTotal, savings, expiresOn };
}

export function splitInstallments(total) {
  const deposit = round2(total / 2);
  const balance = round2(total - deposit);
  return { deposit, balance };
}
