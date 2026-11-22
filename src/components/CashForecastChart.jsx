import React, { useState, useMemo, useRef } from 'react';
import { 
  LineChart, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar 
} from 'lucide-react';
import { formatShortDate } from '../lib/dateUtils.js';

export default function CashForecastChart({
  forecastData,
  horizonDays = 30,
  onHorizonChange,
  currency = '$',
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  const {
    historicalPoints = [],
    dailyPoints = [],
    summary = {},
    deficitInfo = {},
    safetyBuffer = 1500,
  } = forecastData || {};

  const allPoints = useMemo(() => {
    return [...historicalPoints, ...dailyPoints];
  }, [historicalPoints, dailyPoints]);

  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { minY, maxY, minDay, maxDay, totalDaysSpan } = useMemo(() => {
    if (!allPoints.length) {
      return { minY: 0, maxY: 10000, minDay: -14, maxDay: 30, totalDaysSpan: 44 };
    }

    const balances = allPoints.map((p) => p.cashBalance);
    const minVal = Math.min(...balances, 0, safetyBuffer);
    const maxVal = Math.max(...balances, safetyBuffer * 1.5, 5000);

    const padY = (maxVal - minVal) * 0.12 || 500;
    const finalMinY = Math.floor((minVal - padY) / 500) * 500;
    const finalMaxY = Math.ceil((maxVal + padY) / 500) * 500;

    const days = allPoints.map((p) => p.day);
    const mnD = Math.min(...days);
    const mxD = Math.max(...days);

    return {
      minY: finalMinY,
      maxY: finalMaxY,
      minDay: mnD,
      maxDay: mxD,
      totalDaysSpan: mxD - mnD || 1,
    };
  }, [allPoints, safetyBuffer]);

  const yGridTicks = useMemo(() => {
    const ticks = [];
    const step = Math.max(1000, Math.round((maxY - minY) / 5 / 500) * 500);
    for (let val = minY; val <= maxY; val += step) {
      ticks.push(val);
    }
    return ticks;
  }, [minY, maxY]);

  const getX = (day) => {
    const fraction = (day - minDay) / totalDaysSpan;
    return padding.left + fraction * chartW;
  };

  const getY = (val) => {
    const range = maxY - minY || 1;
    const fraction = (val - minY) / range;
    return padding.top + chartH - fraction * chartH;
  };

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

    let histStr = '';
    histPts.forEach((p, idx) => {
      const x = getX(p.day);
      const y = getY(p.cashBalance);
      histStr += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

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

  const handleMouseMove = (e) => {
    if (!svgRef.current || !allPoints.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const svgMouseX = (mouseX / rect.width) * width;
    if (svgMouseX < padding.left || svgMouseX > width - padding.right) {
      setHoveredPoint(null);
      return;
    }

    const relativeFraction = (svgMouseX - padding.left) / chartW;
    const targetDay = Math.round(minDay + relativeFraction * totalDaysSpan);

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
    <div className="card-cockpit p-5 sm:p-6 space-y-6">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#675DFC]/15 border border-[#675DFC]/30 flex items-center justify-center text-[#A298DF] shadow-inner">
              <LineChart className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-white text-base tracking-tight">
              Cash Horizon Projection
            </h2>
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] border border-[#2D2D35] px-2.5 py-0.5 rounded-full bg-[#141417]">
              Lag-Adjusted
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            14-day trailing actuals projected forward against client historical payment patterns and committed outflows.
          </p>
        </div>

        {/* Horizon Toggle Tabs */}
        <div className="flex items-center border border-[#2D2D35] bg-[#141417] rounded-full p-1 self-start sm:self-auto shadow-inner">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => onHorizonChange && onHorizonChange(days)}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                horizonDays === days
                  ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Starting Cash */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Starting Balance</p>
          <p className="text-lg sm:text-xl font-bold text-white mt-1 tabular-nums">
            {currency}{Number(summary.startingCash || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            Day 0 (Today)
          </span>
        </div>

        {/* Ending Cash Projection */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
            {horizonDays}d Projected End
          </p>
          <p className="text-lg sm:text-xl font-bold text-white mt-1 tabular-nums">
            {currency}{Number(summary.endingCash || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-[#A1A1AA] block mt-0.5 font-mono">
            {summary.netChange >= 0 ? '+' : ''}{currency}{Number(summary.netChange || 0).toLocaleString()} net delta
          </span>
        </div>

        {/* Lowest Cash Dip */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Lowest Cash Point</p>
          <p className={`text-lg sm:text-xl font-bold mt-1 tabular-nums ${
            deficitInfo.isBelowBuffer ? 'text-rose-400' : 'text-white'
          }`}>
            {currency}{Number(summary.lowestCashPoint || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            Day {summary.lowestCashDay || 0} · {formatShortDate(new Date(Date.now() + (summary.lowestCashDay || 0) * 86400000))}
          </span>
        </div>

        {/* Safety Buffer Indicator */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Safety Buffer</p>
          <div className="flex items-center gap-1.5 mt-1">
            {deficitInfo.isBelowBuffer ? (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                -${deficitInfo.maxShortfall} Shortfall
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {currency}{safetyBuffer.toLocaleString()} Secure
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block truncate">
            {deficitInfo.isBelowBuffer ? `Dip on Day ${deficitInfo.firstDeficitDay}` : 'Reserves protected'}
          </span>
        </div>
      </div>

      {/* SVG Forecast Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none bg-[#121215] border border-[#2A2A30] rounded-2xl p-3 shadow-inner">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Clean Area Fill Gradient */}
            <linearGradient id="cleanAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#675DFC" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#675DFC" stopOpacity="0.0" />
            </linearGradient>

            {/* Deficit Zone Pattern */}
            <linearGradient id="deficitDangerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.30" />
            </linearGradient>
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
                  stroke="#222228"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  fill="#71717a"
                  fontSize="9.5"
                  textAnchor="end"
                  fontFamily="'JetBrains Mono', monospace"
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
              fill="url(#deficitDangerGradient)"
            />
          )}

          {/* Safe Cash Buffer Line */}
          <line
            x1={padding.left}
            y1={bufferY}
            x2={width - padding.right}
            y2={bufferY}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.8"
          />
          {/* Buffer Label Badge */}
          <g transform={`translate(${width - padding.right - 140}, ${bufferY - 10})`}>
            <rect
              width="140"
              height="18"
              rx="4"
              fill="#06221a"
              stroke="#10b981"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            <text
              x="6"
              y="12.5"
              fill="#34d399"
              fontSize="9"
              fontFamily="'Inter', sans-serif"
              fontWeight="600"
            >
              BUFFER: {currency}{safetyBuffer.toLocaleString()}
            </text>
          </g>

          {/* Zero Line ($0) if present */}
          {minY < 0 && (
            <>
              <line
                x1={padding.left}
                y1={zeroY}
                x2={width - padding.right}
                y2={zeroY}
                stroke="#f43f5e"
                strokeWidth="1.5"
              />
              <text
                x={padding.left + 8}
                y={zeroY - 4}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
              >
                Insolvency ($0 baseline)
              </text>
            </>
          )}

          {/* Today Separator Marker */}
          <line
            x1={todayX}
            y1={padding.top}
            x2={todayX}
            y2={padding.top + chartH}
            stroke="#71717a"
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
          <text
            x={todayX}
            y={padding.top - 8}
            fill="#a1a1aa"
            fontSize="10"
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
            fontWeight="600"
          >
            Today (Day 0)
          </text>

          {/* Forecast Area Fill */}
          <path d={areaPath} fill="url(#cleanAreaGradient)" />

          {/* Historical Actuals Line (-14d to 0) */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#71717a"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Forward Forecast Curve (0 to horizonDays) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#8B82FF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Event Dots on Key Days */}
          {dailyPoints.map((pt) => {
            if (pt.day === 0) {
              return (
                <circle
                  key={pt.day}
                  cx={getX(pt.day)}
                  cy={getY(pt.cashBalance)}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#000000"
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
              const color = isDip ? '#f43f5e' : hasInflow ? '#10b981' : '#f59e0b';

              return (
                <circle
                  key={pt.day}
                  cx={x}
                  cy={y}
                  r={isDip ? 4.5 : 3.5}
                  fill={color}
                  stroke="#000000"
                  strokeWidth="1.5"
                  className="transition-all hover:scale-125 cursor-pointer"
                />
              );
            }
            return null;
          })}

          {/* X-Axis Ticks (Dates / Days) */}
          {allPoints.map((pt) => {
            const interval = horizonDays === 90 ? 15 : horizonDays === 60 ? 10 : 5;
            if (pt.day % interval === 0 || pt.day === 0) {
              const x = getX(pt.day);
              return (
                <g key={pt.day}>
                  <line
                    x1={x}
                    y1={padding.top + chartH}
                    x2={x}
                    y2={padding.top + chartH + 4}
                    stroke="#27272a"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + chartH + 15}
                    fill={pt.day === 0 ? '#ffffff' : '#71717a'}
                    fontSize="9"
                    fontFamily="'Inter', sans-serif"
                    fontWeight={pt.day === 0 ? '700' : '500'}
                    textAnchor="middle"
                  >
                    {pt.day === 0 ? 'TODAY' : `+${pt.day}D`}
                  </text>
                  <text
                    x={x}
                    y={padding.top + chartH + 26}
                    fill="#52525b"
                    fontSize="8"
                    fontFamily="'Inter', sans-serif"
                    textAnchor="middle"
                  >
                    {formatShortDate(pt.date).toUpperCase()}
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
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.6"
              />
              <circle
                cx={getX(hoveredPoint.day)}
                cy={getY(hoveredPoint.cashBalance)}
                r="5"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
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
            <div className="bg-[#18181C] border border-[#2E2E36] rounded-xl p-3.5 min-w-[210px] text-xs space-y-2 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#2A2A30] pb-1.5 gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#675DFC]" />
                  {hoveredPoint.day === 0 ? 'Today' : `Day +${hoveredPoint.day}`} ({formatShortDate(hoveredPoint.date)})
                </span>
                {hoveredPoint.isBelowBuffer && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Deficit
                  </span>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Projected Balance</p>
                <p className={`text-base font-bold tabular-nums ${
                  hoveredPoint.cashBalance < safetyBuffer ? 'text-rose-400' : 'text-white'
                }`}>
                  {currency}{Number(hoveredPoint.cashBalance).toLocaleString()}
                </p>
              </div>

              {/* Inflow Events breakdown */}
              {hoveredPoint.inflows > 0 && (
                <div className="border-t border-[#2A2A30] pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-[10px] uppercase">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-emerald-400" /> Inflow:
                    </span>
                    <span className="tabular-nums">+{currency}{Number(hoveredPoint.inflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.inflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[10px] text-[#A1A1AA] pl-2 truncate">
                      {item.client_name}: +{currency}{Number(item.amount).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}

              {/* Outflow Events breakdown */}
              {hoveredPoint.outflows > 0 && (
                <div className="border-t border-[#2A2A30] pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-amber-400 font-bold text-[10px] uppercase">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-amber-400" /> Outflow:
                    </span>
                    <span className="tabular-nums">-{currency}{Number(hoveredPoint.outflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.outflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[10px] text-[#A1A1AA] pl-2 truncate">
                      {item.name}: -{currency}{Number(item.amount).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Guide Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2A2A30] text-xs text-[#A1A1AA]">
        <div className="flex items-center flex-wrap gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-zinc-500 border-b border-dashed border-zinc-500 inline-block" />
            14d Actuals
          </span>
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <span className="w-3.5 h-1 bg-[#8B82FF] rounded-full inline-block" />
            Projected Trajectory
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-3.5 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400 inline-block" />
            Buffer ({currency}{safetyBuffer.toLocaleString()})
          </span>
        </div>

        <div className="text-[11px] text-zinc-500">
          Hover over curve for daily inspection
        </div>
      </div>
    </div>
  );
}
