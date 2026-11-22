// Settlement options for overdue balances: early-payment discount and 50/50 instalments.

const round2 = (x) => Math.round(x * 100) / 100;

export function applyEarlyDiscount(total, { rate = 0.02, expiresInDays = 7, today = new Date() } = {}) {
  const discountedTotal = round2(total * (1 - rate));
  const savings = round2(total - discountedTotal);
  const expiresOn = new Date(today.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return { discountedTotal, savings, expiresOn };
}

export function splitInstallments(total) {
  const deposit = round2(total / 2);
  const balance = round2(total - deposit);
  return { deposit, balance };
}
