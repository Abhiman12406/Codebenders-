import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';
import { formatShortDate } from '../lib/forecastEngine.js';

export default function CashForecastChart({
  forecastData,
  horizonDays = 30,
  onHorizonChange,
  currency = '$',
  onSelectActionInvoice,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  const {
    allPoints = [],
    dailyPoints = [],
    safetyBuffer = 1500,
    summary = {},
    deficitInfo = {},
  } = forecastData || {};

  // Dimensions for SVG viewBox
  const width = 960;
  const height = 340;
  const padding = { top: 30, right: 35, bottom: 45, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute min/max for Y scale
  const { minY, maxY, yGridTicks } = useMemo(() => {
    if (!allPoints.length) return { minY: 0, maxY: 10000, yGridTicks: [] };

    let min = Math.min(0, ...allPoints.map((p) => p.cashBalance));
    let max = Math.max(safetyBuffer + 2000, ...allPoints.map((p) => p.cashBalance));

    // Add 15% breathing room
    min = Math.floor(min / 1000) * 1000 - (min < 0 ? 500 : 0);
    max = Math.ceil((max * 1.12) / 1000) * 1000;

    // Generate 5 grid ticks
    const step = (max - min) / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(min + i * step));
    }

    return { minY: min, maxY: max, yGridTicks: ticks };
  }, [allPoints, safetyBuffer]);

  // Coordinate mapping functions
  const totalDaysSpan = useMemo(() => {
    if (!allPoints.length) return 44; // -14 to 30
    const firstDay = allPoints[0].day;
    const lastDay = allPoints[allPoints.length - 1].day;
    return lastDay - firstDay;
  }, [allPoints]);

  const minDay = allPoints.length ? allPoints[0].day : -14;

  const getX = (day) => {
    const fraction = (day - minDay) / (totalDaysSpan || 1);
    return padding.left + fraction * chartW;
  };

  const getY = (val) => {
    const range = maxY - minY || 1;
    const fraction = (val - minY) / range;
    return padding.top + chartH - fraction * chartH;
  };

  // Generate SVG path strings
  const {
    historicalPath,
    forecastPath,
    areaPath,
    bufferY,
    zeroY,
    todayX,
  } = useMemo(() => {
    if (!allPoints.length) {
      return { historicalPath: '', forecastPath: '', areaPath: '', bufferY: 0, zeroY: 0, todayX: 0 };
    }

    const histPts = allPoints.filter((p) => p.day <= 0);
    const forePts = allPoints.filter((p) => p.day >= 0);

    // Build historical line
    let histStr = '';
    histPts.forEach((p, idx) => {
      const x = getX(p.day);
      const y = getY(p.cashBalance);
      histStr += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    // Build forecast curve (smooth quadratic bezier or segmented)
    let foreStr = '';
    forePts.forEach((p, idx) => {
      const x = getX(p.day);
      const y = getY(p.cashBalance);
      if (idx === 0) {
        foreStr += `M ${x} ${y}`;
      } else {
        const prev = forePts[idx - 1];
        const prevX = getX(prev.day);
        const prevY = getY(prev.cashBalance);
        const cX1 = (prevX + x) / 2;
        foreStr += ` C ${cX1} ${prevY}, ${cX1} ${y}, ${x} ${y}`;
      }
    });

    // Build area fill path for forecast
    let areaStr = foreStr;
    if (forePts.length) {
      const lastX = getX(forePts[forePts.length - 1].day);
      const firstX = getX(0);
      const bottomY = getY(Math.max(0, minY));
      areaStr += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }

    return {
      historicalPath: histStr,
      forecastPath: foreStr,
      areaPath: areaStr,
      bufferY: getY(safetyBuffer),
      zeroY: getY(0),
      todayX: getX(0),
    };
  }, [allPoints, minY, maxY, safetyBuffer, chartW, chartH]);

  // Handle interactive hover across chart
  const handleMouseMove = (e) => {
    if (!svgRef.current || !allPoints.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Convert mouseX to day
    const svgMouseX = (mouseX / rect.width) * width;
    if (svgMouseX < padding.left || svgMouseX > width - padding.right) {
      setHoveredPoint(null);
      return;
    }

    const relativeFraction = (svgMouseX - padding.left) / chartW;
    const targetDay = Math.round(minDay + relativeFraction * totalDaysSpan);

    // Find closest point
    let closest = allPoints[0];
    let minDiff = Math.abs(allPoints[0].day - targetDay);

    for (let i = 1; i < allPoints.length; i++) {
      const diff = Math.abs(allPoints[i].day - targetDay);
      if (diff < minDiff) {
        minDiff = diff;
        closest = allPoints[i];
      }
    }

    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative backdrop-blur-sm">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Rolling Cash Forecast
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Client-Lag Adjusted
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            14-day historical trend combined with upcoming invoices vs committed studio overhead
          </p>
        </div>

        {/* Horizon Toggle Pills */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 self-start sm:self-auto">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => onHorizonChange && onHorizonChange(days)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                horizonDays === days
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        {/* Starting Cash */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Starting Balance</p>
          <p className="text-base sm:text-lg font-bold text-white mt-0.5">
            {currency}{Number(summary.startingCash || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            Day 0 (Today)
          </span>
        </div>

        {/* Ending Cash Projection */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {horizonDays}d Projected End
          </p>
          <p className={`text-base sm:text-lg font-bold mt-0.5 ${
            (summary.endingCash || 0) >= (summary.startingCash || 0) ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {currency}{Number(summary.endingCash || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            {summary.netChange >= 0 ? '+' : ''}{currency}{Number(summary.netChange || 0).toLocaleString()} net
          </span>
        </div>

        {/* Lowest Cash Dip */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Lowest Cash Point</p>
          <p className={`text-base sm:text-lg font-bold mt-0.5 ${
            deficitInfo.isBelowBuffer ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {currency}{Number(summary.lowestCashPoint || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            Day {summary.lowestCashDay || 0} ({formatShortDate(new Date(Date.now() + (summary.lowestCashDay || 0) * 86400000))})
          </span>
        </div>

        {/* Safety Buffer Indicator */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Safe Runway Buffer</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {deficitInfo.isBelowBuffer ? (
              <span className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                -${deficitInfo.maxShortfall} Shortfall
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {currency}{safetyBuffer.toLocaleString()} Maintained
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
            {deficitInfo.isBelowBuffer ? `Dip on Day ${deficitInfo.firstDeficitDay}` : 'Protected against shocks'}
          </span>
        </div>
      </div>

      {/* SVG Forecast Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Cash Area Gradient */}
            <linearGradient id="cashAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            {/* Deficit Zone Danger Pattern / Fill */}
            <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.18" />
            </linearGradient>

            {/* Below Buffer Shading */}
            <linearGradient id="bufferDipGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
            </linearGradient>

            {/* Glow Filter for forecast line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-Axis Labels */}
          {yGridTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  strokeOpacity="0.45"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {val >= 0 ? `${currency}${val.toLocaleString()}` : `-${currency}${Math.abs(val).toLocaleString()}`}
                </text>
              </g>
            );
          })}

          {/* Deficit Danger Zone (< $0) if minY < 0 */}
          {minY < 0 && (
            <rect
              x={padding.left}
              y={zeroY}
              width={chartW}
              height={getY(minY) - zeroY}
              fill="url(#deficitGradient)"
            />
          )}

          {/* Buffer Zone (< $1,500) */}
          <rect
            x={padding.left}
            y={bufferY}
            width={chartW}
            height={Math.max(0, zeroY - bufferY)}
            fill="url(#bufferDipGradient)"
          />

          {/* Safe Cash Buffer Line ($1,500) */}
          <line
            x1={padding.left}
            y1={bufferY}
            x2={width - padding.right}
            y2={bufferY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeOpacity="0.85"
          />
          {/* Buffer Label Badge */}
          <g transform={`translate(${width - padding.right - 145}, ${bufferY - 10})`}>
            <rect
              width="145"
              height="18"
              rx="4"
              fill="#1e1b4b"
              stroke="#f59e0b"
              strokeWidth="0.75"
              fillOpacity="0.9"
            />
            <text
              x="6"
              y="12"
              fill="#fbbf24"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              🛡️ Safe Buffer ({currency}{safetyBuffer.toLocaleString()})
            </text>
          </g>

          {/* Zero Insolvency Line ($0) if present */}
          {minY < 0 && (
            <>
              <line
                x1={padding.left}
                y1={zeroY}
                x2={width - padding.right}
                y2={zeroY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
              <text
                x={padding.left + 8}
                y={zeroY - 4}
                fill="#f87171"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                🚨 Insolvency ($0 Baseline)
              </text>
            </>
          )}

          {/* Today Separator Marker */}
          <line
            x1={todayX}
            y1={padding.top}
            x2={todayX}
            y2={padding.top + chartH}
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
          <text
            x={todayX}
            y={padding.top - 8}
            fill="#818cf8"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Today (Day 0)
          </text>

          {/* Forecast Area Fill */}
          <path d={areaPath} fill="url(#cashAreaGradient)" />

          {/* Historical Actuals Line (-14d to 0) */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Forward Forecast Curve (0 to horizonDays) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Event Dots on Key Days (Inflows, Outflows, Deficit dips) */}
          {dailyPoints.map((pt) => {
            if (pt.day === 0) {
              return (
                <circle
                  key={pt.day}
                  cx={getX(pt.day)}
                  cy={getY(pt.cashBalance)}
                  r="4.5"
                  fill="#818cf8"
                  stroke="#1e1b4b"
                  strokeWidth="2"
                />
              );
            }

            const hasInflow = pt.inflows > 0;
            const hasOutflow = pt.outflows > 0;
            const isDip = pt.isBelowBuffer;

            if (hasInflow || hasOutflow || isDip) {
              const x = getX(pt.day);
              const y = getY(pt.cashBalance);
              const color = isDip ? '#ef4444' : hasInflow ? '#10b981' : '#f43f5e';

              return (
                <circle
                  key={pt.day}
                  cx={x}
                  cy={y}
                  r={isDip ? 5 : 4}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all hover:r-6 cursor-pointer"
                />
              );
            }
            return null;
          })}

          {/* X-Axis Ticks (Dates / Days) */}
          {allPoints.map((pt, i) => {
            // Pick ticks every 7-10 days
            const interval = horizonDays === 90 ? 15 : horizonDays === 60 ? 10 : 5;
            if (pt.day % interval === 0 || pt.day === 0) {
              const x = getX(pt.day);
              return (
                <g key={pt.day}>
                  <line
                    x1={x}
                    y1={padding.top + chartH}
                    x2={x}
                    y2={padding.top + chartH + 5}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + chartH + 18}
                    fill={pt.day === 0 ? '#a5b4fc' : '#64748b'}
                    fontSize="9"
                    fontWeight={pt.day === 0 ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {pt.day === 0 ? 'Today' : `D+${pt.day}`}
                  </text>
                  <text
                    x={x}
                    y={padding.top + chartH + 30}
                    fill="#475569"
                    fontSize="8"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {formatShortDate(pt.date)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Hover Pointer Crosshair */}
          {hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={getX(hoveredPoint.day)}
                y1={padding.top}
                x2={getX(hoveredPoint.day)}
                y2={padding.top + chartH}
                stroke="#a5b4fc"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredPoint.day)}
                cy={getY(hoveredPoint.cashBalance)}
                r="6"
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth="3"
              />
            </g>
          )}
        </svg>

        {/* Interactive Floating Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(10, ((getX(hoveredPoint.day) - padding.left) / chartW) * 88 + 4),
                72
              )}%`,
              top: '15px',
            }}
          >
            <div className="bg-slate-900/95 border border-indigo-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md min-w-[210px] text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {hoveredPoint.day === 0 ? 'Today' : `Day ${hoveredPoint.day}`} ({formatShortDate(hoveredPoint.date)})
                </span>
                {hoveredPoint.isBelowBuffer && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Deficit Dip
                  </span>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Projected Balance</p>
                <p className={`text-base font-extrabold ${
                  hoveredPoint.cashBalance < safetyBuffer ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {currency}{Number(hoveredPoint.cashBalance).toLocaleString()}
                </p>
              </div>

              {/* Inflow Events breakdown */}
              {hoveredPoint.inflows > 0 && (
                <div className="border-t border-slate-800/80 pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-emerald-400" /> Expected Inflow:
                    </span>
                    <span>+{currency}{Number(hoveredPoint.inflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.inflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[10px] text-slate-300 pl-4 truncate">
                      • {item.client_name}: +{currency}{Number(item.amount).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}

              {/* Outflow Events breakdown */}
              {hoveredPoint.outflows > 0 && (
                <div className="border-t border-slate-800/80 pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-rose-400 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-rose-400" /> Scheduled Outflow:
                    </span>
                    <span>-{currency}{Number(hoveredPoint.outflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.outflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[10px] text-slate-300 pl-4 truncate">
                      • {item.name}: -{currency}{Number(item.amount).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Guide Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center flex-wrap gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 border-b border-dashed border-slate-400 inline-block"></span>
            Past 14d Actuals
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 inline-block"></span>
            Forecast Trajectory
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Invoice Inflow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Scheduled Outflow
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed border-amber-500 inline-block"></span>
            Safety Buffer (${safetyBuffer.toLocaleString()})
          </span>
        </div>

        <div className="text-[10px] text-slate-500 italic">
          💡 Hover over curve to inspect daily cash breakdowns
        </div>
      </div>
    </div>
  );
}
