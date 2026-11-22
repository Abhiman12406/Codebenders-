export const DEFAULT_SCENARIOS = {
  acmeDelayDays: 0,
  macbookCapex: false,
  capexAmount: 1800,
  capexDay: 14,
  customDelays: {},
  badDayActive: false,
  deferFlexibleBills: false,
};

export function calculateCashForecast({
  cashBalance = 4850,
  invoices = [],
  bills = [],
  clients = [],
  horizonDays = 30,
  scenarios = {},
  safetyBuffer = 1500,
}) {
  const mergedScenarios = { ...DEFAULT_SCENARIOS, ...scenarios };
  const clientMap = new Map();
  clients.forEach((c) => clientMap.set(c.id, c));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOutflowsMap = new Map();

  for (let dayOffset = 1; dayOffset <= horizonDays; dayOffset++) {
    const dailyBills = [];
    const cycleDay = ((dayOffset - 1) % 30) + 1;

    if (cycleDay === 1) {
      dailyBills.push({ id: `rent_${dayOffset}`, name: 'Studio Dedicated Desk & Storage', amount: 650.00, category: 'rent', is_flexible: false });
    }
    if (cycleDay === 5) {
      dailyBills.push({ id: `adobe_${dayOffset}`, name: 'Adobe Creative Cloud', amount: 59.99, category: 'software', is_flexible: false });
    }
    if (cycleDay === 12) {
      dailyBills.push({ id: `figma_${dayOffset}`, name: 'Figma Organization Seat', amount: 45.00, category: 'software', is_flexible: false });
    }
    if (cycleDay === 18 && !mergedScenarios.deferFlexibleBills) {
      dailyBills.push({ id: `render_${dayOffset}`, name: 'Cloud GPU Render Farm', amount: 220.00, category: 'software', is_flexible: true });
    }
    if (cycleDay === 22) {
      dailyBills.push({ id: `fiber_${dayOffset}`, name: 'Gigabit Fiber Internet', amount: 85.00, category: 'utilities', is_flexible: false });
    }
    if (cycleDay === 24 && !mergedScenarios.deferFlexibleBills) {
      dailyBills.push({ id: `tax_${dayOffset}`, name: 'Tax Reserve Allocation', amount: 1200.00, category: 'tax', is_flexible: true });
    }

    // User-created custom bills
    bills
      .filter((b) => !['bill_rent', 'bill_adobe', 'bill_figma', 'bill_render', 'bill_fiber', 'bill_tax'].includes(b.id))
      .forEach((b) => {
        if (Number(b.due_day) === cycleDay) {
          if (!mergedScenarios.deferFlexibleBills || !b.is_flexible) {
            dailyBills.push(b);
          }
        }
      });

    // Capex simulation
    if (mergedScenarios.macbookCapex && dayOffset === Number(mergedScenarios.capexDay || 14)) {
      dailyBills.push({
        id: `capex_${dayOffset}`,
        name: `Studio Hardware Upgrade (M4 MacBook Pro)`,
        amount: Number(mergedScenarios.capexAmount || 1800),
        category: 'capex',
        is_flexible: true,
      });
    }

    dayOutflowsMap.set(dayOffset, dailyBills);
  }

  // 2. Map Inflows (Invoices)
  const dayInflowsMap = new Map();

  invoices
    .filter((inv) => inv.status !== 'paid')
    .forEach((inv) => {
      const client = clientMap.get(inv.client_id);
      const dueDate = new Date(inv.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

      // Behavioral lag adjustment
      let behavioralLag = client?.avg_delay_days || 0;
      if (client?.payment_behavior === 'habitual_late') behavioralLag = Math.max(behavioralLag, 14);
      if (client?.payment_behavior === 'chronic_risk') behavioralLag = Math.max(behavioralLag, 28);
      if (client?.payment_behavior === 'fast') behavioralLag = 0;

      // Scenario overrides
      let scenarioDelay = 0;
      if (mergedScenarios.badDayActive) {
        scenarioDelay += 30;
      }
      if (
        (inv.client_name?.toLowerCase().includes('acme') || inv.client_id === 'client_acme') &&
        mergedScenarios.acmeDelayDays > 0
      ) {
        scenarioDelay += Number(mergedScenarios.acmeDelayDays);
      }
      if (mergedScenarios.customDelays && mergedScenarios.customDelays[inv.id]) {
        scenarioDelay += Number(mergedScenarios.customDelays[inv.id]);
      }

      const expectedArrivalDay = Math.max(1, diffDays + behavioralLag + scenarioDelay);

      if (expectedArrivalDay <= horizonDays) {
        const existing = dayInflowsMap.get(expectedArrivalDay) || [];
        existing.push({
          ...inv,
          behavioralLag,
          scenarioDelay,
        });
        dayInflowsMap.set(expectedArrivalDay, existing);
      }
    });

  // 3. Roll forward daily balance
  let runningCash = Number(cashBalance);
  const dailyPoints = [];
  let minBalance = runningCash;
  let minBalanceDay = 0;
  let firstDeficitDay = null;
  let maxDeficitAmount = 0;

  for (let day = 1; day <= horizonDays; day++) {
    const d = new Date(today);
    d.setDate(d.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];

    const inflows = dayInflowsMap.get(day) || [];
    const outflows = dayOutflowsMap.get(day) || [];

    const totalInflow = inflows.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalOutflow = outflows.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    runningCash = Math.round((runningCash + totalInflow - totalOutflow) * 100) / 100;

    const isBelowBuffer = runningCash < safetyBuffer;
    const isDeficit = runningCash < 0;

    if (runningCash < minBalance) {
      minBalance = runningCash;
      minBalanceDay = day;
    }

    if (isDeficit && firstDeficitDay === null) {
      firstDeficitDay = day;
    }

    if (isDeficit) {
      const deficit = Math.abs(runningCash);
      if (deficit > maxDeficitAmount) {
        maxDeficitAmount = deficit;
      }
    }

    dailyPoints.push({
      day,
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: runningCash,
      inflows,
      outflows,
      totalInflow,
      totalOutflow,
      isBelowBuffer,
      isDeficit,
    });
  }

  // Deficit diagnostics and prescriptive action
  let deficitInfo = null;
  if (firstDeficitDay !== null || minBalance < safetyBuffer) {
    const triggerDay = firstDeficitDay || minBalanceDay;
    const d = new Date(today);
    d.setDate(d.getDate() + triggerDay);
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const shortfall = minBalance < 0 ? Math.abs(minBalance) : safetyBuffer - minBalance;
    const hasDeficit = minBalance < 0;

    deficitInfo = {
      hasDeficit,
      hasBufferWarning: minBalance < safetyBuffer,
      firstDeficitDay: triggerDay,
      dateStr: formattedDate,
      shortfallAmount: Math.round(shortfall),
      minBalance: Math.round(minBalance),
      primaryAction: hasDeficit
        ? `🚨 Cash Deficit on ${formattedDate}: You are projected to hit -$${Math.round(Math.abs(minBalance)).toLocaleString()} due to upcoming rent & subscription bills.`
        : `⚠️ Buffer Warning on ${formattedDate}: Cash dips to $${Math.round(minBalance).toLocaleString()} (below your $${safetyBuffer.toLocaleString()} safety buffer).`,
      recommendedSteps: [
        {
          tier: 1,
          title: 'Offer 5% Fast-Cash WhatsApp Discount',
          desc: 'Offer an early-settlement incentive to collect immediate liquidity.',
        },
        {
          tier: 2,
          title: 'Request 50% Milestone Split on Anchor Project',
          desc: 'Negotiate half payment upfront to bridge the rent window.',
        },
        {
          tier: 3,
          title: 'Defer Non-Essential Software & Render Subscriptions',
          desc: 'Pause flexible SaaS seats until client settlements clear.',
        },
      ],
    };
  }

  return {
    dailyPoints,
    horizonDays,
    safetyBuffer,
    startingCash: cashBalance,
    endingCash: runningCash,
    minBalance,
    minBalanceDay,
    deficitInfo,
  };
}
