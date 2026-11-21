import { calculateCashForecast } from './src/lib/forecastEngine.js';
import mockDesignerData from './src/data/mockDesignerData.js';

console.log('--- Test 1: Base Case (slider = 0) ---');
const base = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { acmeDelayDays: 0 }
});
console.log('Day 12 cash (Acme arrives on time):', base.dailyPoints[12]?.cashBalance);
console.log('Day 24 cash:', base.dailyPoints[24]?.cashBalance);
console.log('Is Below Buffer (< $1,500)?', base.deficitInfo.isBelowBuffer);
console.log('Alert:', base.deficitInfo.alertMessage);

console.log('\n--- Test 2: Acme Delayed Past Day 15 (slider = 16) ---');
const delayed = calculateCashForecast({
  cashBalance: mockDesignerData.profile.starting_cash,
  invoices: mockDesignerData.invoices,
  bills: mockDesignerData.bills,
  clients: mockDesignerData.clients,
  horizonDays: 30,
  scenarios: { acmeDelayDays: 16 }
});
console.log('Day 12 cash (Acme did not arrive):', delayed.dailyPoints[12]?.cashBalance);
console.log('Day 24 cash:', delayed.dailyPoints[24]?.cashBalance);
console.log('Shortfall below $1500:', delayed.deficitInfo.maxShortfall);
console.log('First Deficit Day:', delayed.deficitInfo.firstDeficitDay);
console.log('Alert:', delayed.deficitInfo.alertMessage);

console.log('\n--- Test 3: Horizons 30, 60, 90 ---');
const res30 = calculateCashForecast({ cashBalance: 4850, invoices: mockDesignerData.invoices, bills: mockDesignerData.bills, clients: mockDesignerData.clients, horizonDays: 30 });
const res60 = calculateCashForecast({ cashBalance: 4850, invoices: mockDesignerData.invoices, bills: mockDesignerData.bills, clients: mockDesignerData.clients, horizonDays: 60 });
const res90 = calculateCashForecast({ cashBalance: 4850, invoices: mockDesignerData.invoices, bills: mockDesignerData.bills, clients: mockDesignerData.clients, horizonDays: 90 });

console.log('Points count 30d:', res30.dailyPoints.length, '60d:', res60.dailyPoints.length, '90d:', res90.dailyPoints.length);

const test1Passed = base.dailyPoints[24]?.cashBalance > 1500 && base.deficitInfo.alertMessage === null;
const test2Passed = delayed.deficitInfo.isBelowBuffer === true &&
                    delayed.deficitInfo.firstDeficitDay === 24 &&
                    delayed.deficitInfo.maxShortfall === 420 &&
                    delayed.deficitInfo.alertMessage.includes('⚠️ Cash Deficit Alert: -$420 shortfall on Day 24. Action: Chase invoice #104 today.');
const test3Passed = res30.dailyPoints.length === 31 && res60.dailyPoints.length === 61 && res90.dailyPoints.length === 91;

if (test1Passed && test2Passed && test3Passed) {
  console.log('\n🎉 ALL FORECAST ENGINE UNIT TESTS PASSED WITH 100% PRECISION!');
} else {
  console.error('\n❌ Unit test verification failed', { test1Passed, test2Passed, test3Passed });
  process.exit(1);
}
