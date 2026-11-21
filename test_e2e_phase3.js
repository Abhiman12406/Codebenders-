import { calculateCashForecast, DEFAULT_SCENARIOS } from './src/lib/forecastEngine.js';
import mockDesignerData from './src/data/mockDesignerData.js';

console.log('--- Verifying Phase 3 End-to-End ---');

// 1. Horizons
[30, 60, 90].forEach(horizon => {
  const res = calculateCashForecast({
    cashBalance: mockDesignerData.profile.starting_cash,
    invoices: mockDesignerData.invoices,
    bills: mockDesignerData.bills,
    clients: mockDesignerData.clients,
    horizonDays: horizon,
  });
  console.log(`Horizon ${horizon}d: ${res.dailyPoints.length} points, starting=$${res.summary.startingCash}, ending=$${res.summary.endingCash}`);
  if (res.dailyPoints.length !== horizon + 1) {
    throw new Error(`Expected ${horizon + 1} points for ${horizon}d horizon`);
  }
});

// 2. Slider <= 15 days (Safe)
const safeRes = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { acmeDelayDays: 10 },
});
console.log('Slider = 10d: isBelowBuffer =', safeRes.deficitInfo.isBelowBuffer);
if (safeRes.deficitInfo.isBelowBuffer) {
  throw new Error('Expected slider <= 15d to remain safe');
}

// 3. Slider > 15 days (Deficit Alert)
const alertRes = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { acmeDelayDays: 16 },
});
console.log('Slider = 16d: isBelowBuffer =', alertRes.deficitInfo.isBelowBuffer);
console.log('Alert text:', alertRes.deficitInfo.alertMessage);
console.log('Action invoice:', alertRes.deficitInfo.actionInvoice?.invoice_number);

if (!alertRes.deficitInfo.isBelowBuffer) {
  throw new Error('Expected slider > 15d to trigger deficit');
}
if (alertRes.deficitInfo.firstDeficitDay !== 24) {
  throw new Error(`Expected first deficit day 24, got ${alertRes.deficitInfo.firstDeficitDay}`);
}
if (alertRes.deficitInfo.maxShortfall !== 420) {
  throw new Error(`Expected max shortfall 420, got ${alertRes.deficitInfo.maxShortfall}`);
}
if (!alertRes.deficitInfo.alertMessage.includes('⚠️ Cash Deficit Alert: -$420 shortfall on Day 24. Action: Chase invoice #104 today.')) {
  throw new Error(`Alert message mismatch: ${alertRes.deficitInfo.alertMessage}`);
}

// 4. CapEx Toggle ($1,800 MacBook on Day 14)
const capexRes = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { macbookCapex: true },
});
const day14Normal = safeRes.dailyPoints[14].cashBalance;
const day14Capex = capexRes.dailyPoints[14].cashBalance;
console.log(`Day 14 cash normal vs capex: $${day14Normal} vs $${day14Capex} (diff = $${Math.round(day14Normal - day14Capex)})`);

// 5. Bad Day protocol
const badDayRes = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { badDayActive: true },
});
console.log('Bad Day protocol lowest cash:', badDayRes.deficitInfo.lowestCashPoint);
if (!badDayRes.deficitInfo.isBelowBuffer) {
  throw new Error('Expected bad day to trigger deficit');
}

console.log('✅ ALL PHASE 3 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!');
