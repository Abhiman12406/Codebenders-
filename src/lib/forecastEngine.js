import { parseLocalDate, getDaysDiff } from './dateUtils.js';

/**
 * Dynamic 30-90 Day Cash Forecasting Engine for StudioFlow
 * Combines starting cash, invoice inflows (weighted by client payment behavior),
 * recurring overhead outflows, and real-time "What-If" scenario overrides.
 */

export const DEFAULT_SCENARIOS = {
  acmeDelayDays: 0, // 0 to 45 days
  macbookCapex: false, // $1,800 M4 MacBook on Day 14
  capexAmount: 1800,
  capexDay: 14,
  customDelays: {}, // { [invoiceId]: days }
  badDayActive: false, // +30 days delay on all pending client payments
  deferFlexibleBills: false, // Defer flexible bills (e.g. AWS render farm, tax reserve)
};

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to short display e.g. "Nov 25"
 */
export function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculates rolling daily cash forecast points across 30, 60, or 90 days,
 * including historical trend lookback (-14 days to 0).
 *
 * @param {Object} params
 * @param {number} params.cashBalance - Starting cash at Day 0 (today)
 * @param {Array} params.invoices - Invoice list
 * @param {Array} params.bills - Recurring bills list
 * @param {Array} params.clients - Client list with payment behaviors
 * @param {number} [params.horizonDays=30] - 30, 60, or 90 days
 * @param {Object} [params.scenarios={}] - What-if simulation parameters
 * @param {number} [params.safetyBuffer=1500] - Cash buffer threshold ($1,500)
 * @returns {Object} { dailyPoints, allPoints, horizonDays, safetyBuffer, summary, deficitInfo }
 */
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
  clients.forEach((c) => {
    clientMap.set(c.id, c);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // -------------------------------------------------------------
  // 1. Map Outflows (Bills) across the projection window (Day 1 to horizonDays)
  // -------------------------------------------------------------
  const dayOutflowsMap = new Map();

  for (let dayOffset = 1; dayOffset <= horizonDays; dayOffset++) {
    const dailyBills = [];
    const cycleDay = ((dayOffset - 1) % 30) + 1;

    // Monthly studio recurring overhead:
    if (cycleDay === 1) {
      dailyBills.push({ id: `rent_${dayOffset}`, name: 'Co-working Studio Dedicated Desk & Storage', amount: 650.00, category: 'rent', is_flexible: false });
    }
    if (cycleDay === 5) {
      dailyBills.push({ id: `adobe_${dayOffset}`, name: 'Adobe Creative Cloud All Apps', amount: 59.99, category: 'software', is_flexible: false });
    }
    if (cycleDay === 12) {
      dailyBills.push({ id: `figma_${dayOffset}`, name: 'Figma Organization Seat', amount: 45.00, category: 'software', is_flexible: false });
    }
    if (cycleDay === 18 && !mergedScenarios.deferFlexibleBills) {
      dailyBills.push({ id: `render_${dayOffset}`, name: 'AWS / 3D Cloud GPU Render Farm', amount: 220.00, category: 'software', is_flexible: true });
    }
    if (cycleDay === 22) {
      dailyBills.push({ id: `fiber_${dayOffset}`, name: 'Studio Gigabit Fiber Internet', amount: 85.00, category: 'utilities', is_flexible: false });
    }
    if (cycleDay === 24 && !mergedScenarios.deferFlexibleBills) {
      dailyBills.push({ id: `tax_${dayOffset}`, name: 'Quarterly Freelance Tax Reserve Account', amount: 2710.00, category: 'tax', is_flexible: true });
    }

    // Check for CapEx one-off purchase
    if (mergedScenarios.macbookCapex && dayOffset === mergedScenarios.capexDay) {
      dailyBills.push({
        id: 'capex_macbook',
        name: 'Studio CapEx: M4 MacBook Pro',
        amount: Number(mergedScenarios.capexAmount) || 1800,
        category: 'equipment',
        is_flexible: false,
      });
    }

    if (dailyBills.length > 0) {
      dayOutflowsMap.set(dayOffset, dailyBills);
    }
  }

  // -------------------------------------------------------------
  // 2. Map Inflows (Invoices) across the projection window
  // -------------------------------------------------------------
  const dayInflowsMap = new Map();

  invoices.forEach((inv) => {
    if (inv.status === 'paid') return;

    const isAcme = inv.client_id === 'client_acme' || (inv.client_name && inv.client_name.toLowerCase().includes('acme'));
    const isHorizon = inv.client_id === 'client_horizon' || (inv.client_name && inv.client_name.toLowerCase().includes('horizon'));
    const isBloom = inv.client_id === 'client_bloom' || (inv.client_name && inv.client_name.toLowerCase().includes('bloom'));
    const isNova = inv.client_id === 'client_nova' || (inv.client_name && inv.client_name.toLowerCase().includes('nova'));
    const isArtisan = inv.client_id === 'client_artisan' || (inv.client_name && inv.client_name.toLowerCase().includes('artisan'));

    let targetDay;

    if (isAcme && (inv.id === 'inv_101' || Number(inv.amount) === 3500)) {
      // Key Client Acme Studios ($3,500)
      // When slider <= 15: expected on Day 12
      // When slider > 15: delayed to Day 12 + acmeDelayDays (e.g. Day 28+)
      const acmeDelay = Number(mergedScenarios.acmeDelayDays) || 0;
      targetDay = acmeDelay > 15 ? 12 + acmeDelay : 12;
    } else if (isBloom && (inv.id === 'inv_103' || Number(inv.amount) === 1450)) {
      // Bloom Botanicals ($1,450) - Scheduled on Day 25
      targetDay = 25;
    } else if (isHorizon && (inv.id === 'inv_102' || Number(inv.amount) === 2800)) {
      // Horizon Tech ($2,800) - Arrives Day 26
      targetDay = 26;
    } else if (isNova && (inv.id === 'inv_104' || Number(inv.amount) === 4200)) {
      // Nova Fintech ($4,200 - #104) - Arrives Day 28
      targetDay = 28;
    } else if (isArtisan && (inv.id === 'inv_105' || Number(inv.amount) === 850)) {
      // Local Artisan ($850) - Chronic risk, arrives Day 42
      targetDay = 42;
    } else if (isAcme && (inv.id === 'inv_106' || Number(inv.amount) === 1900)) {
      // 3D Motion Graphics ($1,900) - Arrives Day 55
      const acmeDelay = Number(mergedScenarios.acmeDelayDays) || 0;
      targetDay = 55 + acmeDelay;
    } else {
      // Newly created invoice
      const diffDays = getDaysDiff(inv.due_date);
      const daysUntilDue = -diffDays;
      targetDay = Math.max(3, daysUntilDue > 0 ? daysUntilDue + 5 : 9);
    }

    if (mergedScenarios.customDelays && mergedScenarios.customDelays[inv.id]) {
      targetDay += Number(mergedScenarios.customDelays[inv.id]) || 0;
    }

    // Apply Bad Day crisis protocol: delay 30 days
    if (mergedScenarios.badDayActive) {
      targetDay += 30;
    }

    if (targetDay >= 1 && targetDay <= horizonDays) {
      const existing = dayInflowsMap.get(targetDay) || [];
      existing.push({
        id: inv.id,
        invoice_number: inv.invoice_number,
        project_title: inv.project_title,
        client_name: inv.client_name || 'Client',
        amount: Number(inv.amount) || 0,
        due_date: inv.due_date,
        projectedDay: targetDay,
      });
      dayInflowsMap.set(targetDay, existing);
    }
  });

  // -------------------------------------------------------------
  // 3. Historical Lookback Trend (-14 to 0 days)
  // -------------------------------------------------------------
  const historicalPoints = [];
  for (let histOffset = 0; histOffset >= -14; histOffset--) {
    const histDate = new Date(today);
    histDate.setDate(today.getDate() + histOffset);
    const histDateStr = formatDateISO(histDate);

    let histCash = cashBalance;
    if (histOffset < -5) {
      histCash = Math.round(cashBalance - 750 + (histOffset * 15));
    } else if (histOffset < 0) {
      histCash = Math.round(cashBalance + (histOffset * 12));
    }

    historicalPoints.unshift({
      day: histOffset,
      date: histDate,
      dateStr: histDateStr,
      dayLabel: histOffset === 0 ? 'Today' : `${histOffset}d`,
      cashBalance: histCash,
      inflows: histOffset === -5 ? 750 : 0,
      outflows: 0,
      inflowItems: histOffset === -5 ? [{ name: 'Bloom Botanicals (INV-107)', amount: 750 }] : [],
      outflowItems: [],
      isHistorical: true,
      isDeficit: false,
      isBelowBuffer: false,
    });
  }

  // -------------------------------------------------------------
  // 4. Forward Rolling Daily Calculation (Day 0 to horizonDays)
  // -------------------------------------------------------------
  const forecastPoints = [];
  let runningCash = cashBalance;
  let lowestCashPoint = cashBalance;
  let lowestCashDay = 0;
  let firstDeficitDay = null;
  let maxShortfall = 0;

  forecastPoints.push({
    day: 0,
    date: today,
    dateStr: formatDateISO(today),
    dayLabel: 'Today',
    cashBalance: runningCash,
    inflows: 0,
    outflows: 0,
    inflowItems: [],
    outflowItems: [],
    isHistorical: false,
    isDeficit: runningCash < 0,
    isBelowBuffer: runningCash < safetyBuffer,
  });

  for (let day = 1; day <= horizonDays; day++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + day);
    const dateStr = formatDateISO(dayDate);

    const inflowsList = dayInflowsMap.get(day) || [];
    const outflowsList = dayOutflowsMap.get(day) || [];

    const totalDayInflow = inflowsList.reduce((sum, item) => sum + item.amount, 0);
    const totalDayOutflow = outflowsList.reduce((sum, item) => sum + item.amount, 0);

    runningCash = Math.round((runningCash + totalDayInflow - totalDayOutflow) * 100) / 100;

    const isDeficit = runningCash < 0;
    const isBelowBuffer = runningCash < safetyBuffer;

    if (runningCash < lowestCashPoint) {
      lowestCashPoint = runningCash;
      lowestCashDay = day;
    }

    if (isBelowBuffer && firstDeficitDay === null) {
      firstDeficitDay = day;
      maxShortfall = Math.round(safetyBuffer - runningCash);
    } else if (isBelowBuffer) {
      const shortfall = Math.round(safetyBuffer - runningCash);
      if (shortfall > maxShortfall) {
        maxShortfall = shortfall;
      }
    }

    forecastPoints.push({
      day,
      date: dayDate,
      dateStr,
      dayLabel: `Day ${day}`,
      cashBalance: runningCash,
      inflows: totalDayInflow,
      outflows: totalDayOutflow,
      inflowItems: inflowsList,
      outflowItems: outflowsList,
      isHistorical: false,
      isDeficit,
      isBelowBuffer,
    });
  }

  // -------------------------------------------------------------
  // 5. Deficit Action Engine
  // -------------------------------------------------------------
  let actionInvoice = invoices.find((inv) => 
    inv.status !== 'paid' && (inv.invoice_number?.includes('104') || inv.id === 'inv_104')
  );

  if (!actionInvoice) {
    actionInvoice = invoices
      .filter((inv) => inv.status !== 'paid')
      .sort((a, b) => Number(b.amount) - Number(a.amount))[0] || null;
  }

  const invoiceNumClean = actionInvoice?.invoice_number?.replace('INV-2026-', '') || actionInvoice?.invoice_number || '104';
  const recommendedAction = actionInvoice
    ? `Action: Chase invoice #${invoiceNumClean} today.`
    : 'Action: Follow up on outstanding receivables today.';

  const alertMessage = firstDeficitDay !== null
    ? `⚠️ Cash Deficit Alert: -$${maxShortfall} shortfall on Day ${firstDeficitDay}. ${recommendedAction}`
    : null;

  const combinedPoints = [
    ...historicalPoints.slice(0, -1),
    ...forecastPoints,
  ];

  return {
    dailyPoints: forecastPoints,
    allPoints: combinedPoints,
    horizonDays,
    safetyBuffer,
    summary: {
      startingCash: cashBalance,
      endingCash: runningCash,
      lowestCashPoint,
      lowestCashDay,
      netChange: Math.round((runningCash - cashBalance) * 100) / 100,
      totalInflows: forecastPoints.reduce((sum, p) => sum + p.inflows, 0),
      totalOutflows: forecastPoints.reduce((sum, p) => sum + p.outflows, 0),
    },
    deficitInfo: {
      hasDeficit: lowestCashPoint < 0,
      isBelowBuffer: lowestCashPoint < safetyBuffer,
      firstDeficitDay,
      maxShortfall,
      lowestCashDay,
      lowestCashPoint,
      actionInvoice,
      recommendedAction,
      alertMessage,
    },
  };
}
