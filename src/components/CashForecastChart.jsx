import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  LineChart
} from 'lucide-react';
import { formatShortDate } from '../lib/forecastEngine.js';

export default function CashForecastChart({
  forecastData,
  horizonDays = 30,
  onHorizonChange,
  currency = '$',
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
  const padding = { top: 30, right: 35, bottom: 45, left: 75 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute min/max for Y scale
  const { minY, maxY, yGridTicks } = useMemo(() => {
    if (!allPoints.length) return { minY: 0, maxY: 10000, yGridTicks: [] };

    let min = Math.min(0, ...allPoints.map((p) => p.cashBalance));
    let max = Math.max(safetyBuffer + 2000, ...allPoints.map((p) => p.cashBalance));

    min = Math.floor(min / 1000) * 1000 - (min < 0 ? 500 : 0);
    max = Math.ceil((max * 1.12) / 1000) * 1000;

    const step = (max - min) / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(min + i * step));
    }

    return { minY: min, maxY: max, yGridTicks: ticks };
  }, [allPoints, safetyBuffer]);

  const totalDaysSpan = useMemo(() => {
    if (!allPoints.length) return 44;
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
    <div className="card-spacex p-6 sm:p-8 space-y-6 bg-[#0a0a0a]">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3a3a3f]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
              <LineChart className="w-3.5 h-3.5" />
            </div>
            <h2 className="button-cap text-white text-base">
              ROLLING CASH HORIZON
            </h2>
            <span className="micro-cap text-white border border-[#3a3a3f] px-2.5 py-0.5 rounded-[32px] bg-black">
              LAG ADJUSTED
            </span>
          </div>
          <p className="micro-cap text-[#5a5a5f] mt-1.5">
            14-day trailing actuals projected forward against client historical payment patterns
          </p>
        </div>

        {/* Horizon Toggle Tabs (SpaceX ghost pill group) */}
        <div className="flex items-center border border-[#3a3a3f] bg-black rounded-[32px] p-1 self-start sm:self-auto">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => onHorizonChange && onHorizonChange(days)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[1.17px] rounded-[32px] transition-all ${
                horizonDays === days
                  ? 'bg-white text-black'
                  : 'text-[#5a5a5f] hover:text-white'
              }`}
            >
              {days} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Starting Cash */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4">
          <p className="micro-cap text-[#5a5a5f] font-bold">STARTING BALANCE</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1.5 tabular-nums tracking-[1.2px]">
            {currency}{Number(summary.startingCash || 0).toLocaleString()}
          </p>
          <span className="micro-cap text-[#5a5a5f] block mt-1">
            Day 0 (Today)
          </span>
        </div>

        {/* Ending Cash Projection */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4">
          <p className="micro-cap text-[#5a5a5f] font-bold">
            {horizonDays}D PROJECTED END
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1.5 tabular-nums tracking-[1.2px]">
            {currency}{Number(summary.endingCash || 0).toLocaleString()}
          </p>
          <span className="micro-cap text-[#5a5a5f] block mt-1">
            {summary.netChange >= 0 ? '+' : ''}{currency}{Number(summary.netChange || 0).toLocaleString()} net delta
          </span>
        </div>

        {/* Lowest Cash Dip */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4">
          <p className="micro-cap text-[#5a5a5f] font-bold">LOWEST CASH DIP</p>
          <p className={`text-xl sm:text-2xl font-bold mt-1.5 tabular-nums tracking-[1.2px] ${
            deficitInfo.isBelowBuffer ? 'text-[#ef4444]' : 'text-white'
          }`}>
            {currency}{Number(summary.lowestCashPoint || 0).toLocaleString()}
          </p>
          <span className="micro-cap text-[#5a5a5f] block mt-1">
            Day {summary.lowestCashDay || 0} · {formatShortDate(new Date(Date.now() + (summary.lowestCashDay || 0) * 86400000))}
          </span>
        </div>

        {/* Safety Buffer Indicator */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4">
          <p className="micro-cap text-[#5a5a5f] font-bold">SAFETY BUFFER</p>
          <div className="flex items-center gap-2 mt-1.5">
            {deficitInfo.isBelowBuffer ? (
              <span className="button-cap text-xs text-[#ef4444] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                -${deficitInfo.maxShortfall} DEFICIT
              </span>
            ) : (
              <span className="button-cap text-xs text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                {currency}{safetyBuffer.toLocaleString()} SECURE
              </span>
            )}
          </div>
          <span className="micro-cap text-[#5a5a5f] mt-1 block truncate">
            {deficitInfo.isBelowBuffer ? `Dip on Day ${deficitInfo.firstDeficitDay}` : 'Reserve protected'}
          </span>
        </div>
      </div>

      {/* SVG Forecast Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none bg-black border border-[#3a3a3f] rounded-[4px] p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* SpaceX Monochrome Area Gradient */}
            <linearGradient id="spacexCashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Deficit Zone Pattern */}
            <linearGradient id="spacexDeficitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
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
                  stroke="#3a3a3f"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 12}
                  y={y + 3.5}
                  fill="#5a5a5f"
                  fontSize="9.5"
                  textAnchor="end"
                  fontFamily="'D-DIN', sans-serif"
                  letterSpacing="0.96px"
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
              fill="url(#spacexDeficitGradient)"
            />
          )}

          {/* Safe Cash Buffer Line ($1,500) */}
          <line
            x1={padding.left}
            y1={bufferY}
            x2={width - padding.right}
            y2={bufferY}
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
          />
          {/* Buffer Label Badge */}
          <g transform={`translate(${width - padding.right - 150}, ${bufferY - 10})`}>
            <rect
              width="150"
              height="16"
              rx="2"
              fill="#000000"
              stroke="#3a3a3f"
              strokeWidth="1"
            />
            <text
              x="6"
              y="11"
              fill="#ffffff"
              fontSize="8.5"
              fontFamily="'D-DIN', sans-serif"
              letterSpacing="0.96px"
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
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <text
                x={padding.left + 8}
                y={zeroY - 4}
                fill="#ef4444"
                fontSize="9"
                fontFamily="'D-DIN', sans-serif"
                letterSpacing="0.96px"
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
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 3"
            strokeOpacity="0.6"
          />
          <text
            x={todayX}
            y={padding.top - 8}
            fill="#ffffff"
            fontSize="9.5"
            textAnchor="middle"
            fontFamily="'D-DIN', sans-serif"
            letterSpacing="0.96px"
            fontWeight="700"
          >
            Today (Day 0)
          </text>

          {/* Forecast Area Fill */}
          <path d={areaPath} fill="url(#spacexCashGradient)" />

          {/* Historical Actuals Line (-14d to 0) */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#5a5a5f"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />

          {/* Forward Forecast Curve (0 to horizonDays) in Pure Stark White */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
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
                  fill="#000000"
                  stroke="#ffffff"
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
              const color = isDip ? '#ef4444' : '#ffffff';

              return (
                <circle
                  key={pt.day}
                  cx={x}
                  cy={y}
                  r={isDip ? 5 : 3.5}
                  fill={color}
                  stroke="#000000"
                  strokeWidth="1.5"
                  className="transition-all hover:r-6 cursor-pointer"
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
                    stroke="#3a3a3f"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + chartH + 16}
                    fill={pt.day === 0 ? '#ffffff' : '#5a5a5f'}
                    fontSize="9"
                    fontFamily="'D-DIN', sans-serif"
                    letterSpacing="0.96px"
                    fontWeight={pt.day === 0 ? '700' : '400'}
                    textAnchor="middle"
                  >
                    {pt.day === 0 ? 'TODAY' : `+${pt.day}D`}
                  </text>
                  <text
                    x={x}
                    y={padding.top + chartH + 28}
                    fill="#3a3a3f"
                    fontSize="8"
                    fontFamily="'D-DIN', sans-serif"
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
                strokeOpacity="0.8"
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
            <div className="bg-[#0a0a0a] border border-white rounded-[4px] p-4 min-w-[220px] text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-2 gap-2">
                <span className="button-cap text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  {hoveredPoint.day === 0 ? 'Today' : `Day +${hoveredPoint.day}`} ({formatShortDate(hoveredPoint.date)})
                </span>
                {hoveredPoint.isBelowBuffer && (
                  <span className="px-2 py-0.5 rounded-[32px] text-[10px] font-bold uppercase bg-black text-[#ef4444] border border-[#ef4444]">
                    Deficit
                  </span>
                )}
              </div>

              <div>
                <p className="micro-cap text-[#5a5a5f] font-bold">PROJECTED BALANCE</p>
                <p className={`text-lg font-bold tabular-nums tracking-[1.2px] ${
                  hoveredPoint.cashBalance < safetyBuffer ? 'text-[#ef4444]' : 'text-white'
                }`}>
                  {currency}{Number(hoveredPoint.cashBalance).toLocaleString()}
                </p>
              </div>

              {/* Inflow Events breakdown */}
              {hoveredPoint.inflows > 0 && (
                <div className="border-t border-[#3a3a3f] pt-2 space-y-1">
                  <div className="flex items-center justify-between text-white font-bold text-[11px] uppercase tracking-[0.96px]">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-white" /> Inflow:
                    </span>
                    <span className="tabular-nums">+{currency}{Number(hoveredPoint.inflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.inflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[11px] text-[#f0f0fa] pl-3 truncate tracking-[0.32px]">
                      {item.client_name}: +{currency}{Number(item.amount).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}

              {/* Outflow Events breakdown */}
              {hoveredPoint.outflows > 0 && (
                <div className="border-t border-[#3a3a3f] pt-2 space-y-1">
                  <div className="flex items-center justify-between text-[#f59e0b] font-bold text-[11px] uppercase tracking-[0.96px]">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-[#f59e0b]" /> Outflow:
                    </span>
                    <span className="tabular-nums">-{currency}{Number(hoveredPoint.outflows).toLocaleString()}</span>
                  </div>
                  {hoveredPoint.outflowItems?.map((item, idx) => (
                    <p key={idx} className="text-[11px] text-[#5a5a5f] pl-3 truncate tracking-[0.32px]">
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3a3a3f] micro-cap text-[#5a5a5f]">
        <div className="flex items-center flex-wrap gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#5a5a5f] border-b border-dashed border-[#5a5a5f] inline-block" />
            14d Trailing Actuals
          </span>
          <span className="flex items-center gap-1.5 text-white">
            <span className="w-3 h-0.5 bg-white inline-block" />
            Cash Horizon Trajectory
          </span>
          <span className="flex items-center gap-1.5 text-white">
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
            Invoice Inflows
          </span>
          <span className="flex items-center gap-1.5 text-[#5a5a5f]">
            <span className="w-3 h-0.5 bg-white border-b border-dashed border-white inline-block" />
            Safety Buffer ({currency}{safetyBuffer.toLocaleString()})
          </span>
        </div>

        <div className="text-[11px] text-[#5a5a5f]">
          Hover over curve for daily inspection
        </div>
      </div>
    </div>
  );
}
