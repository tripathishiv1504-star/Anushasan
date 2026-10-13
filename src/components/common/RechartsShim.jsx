import React, { useState, useRef, useEffect } from 'react';

/**
 * Lightweight, zero-dependency SVG chart replacement for Recharts
 * Supports ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Cell
 */

export function ResponsiveContainer({ children, width = '100%', height = 260, className = '' }) {
  return (
    <div
      className={`recharts-responsive-container ${className}`}
      style={{ width, height, position: 'relative', minHeight: typeof height === 'number' ? height : 200 }}
    >
      {React.isValidElement(children) ? React.cloneElement(children, { containerHeight: height }) : children}
    </div>
  );
}

export function CartesianGrid({ stroke = '#E2E8F0', strokeDasharray = '3 3' }) {
  return null; // Rendered directly inside chart SVGs
}

export function XAxis({ dataKey, tickFormatter }) {
  return null;
}

export function YAxis({ domain, tickFormatter }) {
  return null;
}

export function Tooltip({ content, cursor }) {
  return null;
}

export function ReferenceLine({ y, stroke = '#D97706', strokeDasharray = '4 4', label }) {
  return null;
}

export function Cell({ fill }) {
  return null;
}

export function Bar({ dataKey, fill = '#0F766E', radius, children }) {
  return null;
}

export function Line({ type, dataKey, stroke = '#0F766E', strokeWidth = 2.5, dot = true, activeDot = true }) {
  return null;
}

/**
 * LineChart Component
 */
export function LineChart({
  data = [],
  margin = { top: 20, right: 20, left: 20, bottom: 25 },
  containerHeight = 260,
  children,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return <div style={{ height: containerHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>No trend data available</div>;
  }

  // Find props from children
  let lineStroke = '#0F766E';
  let lineDataKey = 'score';
  let refLineY = null;
  let refLineLabel = '';
  let CustomTooltipContent = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Line) {
      if (child.props.stroke) lineStroke = child.props.stroke;
      if (child.props.dataKey) lineDataKey = child.props.dataKey;
    }
    if (child.type === ReferenceLine) {
      if (child.props.y !== undefined) refLineY = child.props.y;
      if (child.props.label && child.props.label.value) refLineLabel = child.props.label.value;
      else if (typeof child.props.label === 'string') refLineLabel = child.props.label;
    }
    if (child.type === Tooltip) {
      if (child.props.content) CustomTooltipContent = child.props.content;
    }
  });

  const width = containerWidth || 600;
  const height = typeof containerHeight === 'number' ? containerHeight : 260;
  const chartTop = margin.top;
  const chartBottom = height - margin.bottom;
  const chartLeft = margin.left + 25;
  const chartRight = width - margin.right;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  // Max and min score range (0 to 100)
  const minY = 0;
  const maxY = 100;

  const getX = (index) => {
    if (data.length <= 1) return chartLeft + chartWidth / 2;
    return chartLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(minY, Math.min(maxY, Number(val) || 0));
    return chartBottom - ((clamped - minY) / (maxY - minY)) * chartHeight;
  };

  // Build SVG path
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d[lineDataKey]),
    data: d,
    index: i,
  }));

  const pathD = points.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    // Smooth cubic bezier curve
    const prev = points[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Area under curve gradient path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`
    : '';

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', userSelect: 'none' }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineStroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineStroke} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const yPos = getY(val);
          return (
            <g key={val}>
              <line
                x1={chartLeft}
                y1={yPos}
                x2={chartRight}
                y2={yPos}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={chartLeft - 8}
                y={yPos + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94A3B8"
                fontWeight="500"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Reference Line (e.g. 50 passing threshold) */}
        {refLineY !== null && (
          <g>
            <line
              x1={chartLeft}
              y1={getY(refLineY)}
              x2={chartRight}
              y2={getY(refLineY)}
              stroke="#D97706"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {refLineLabel && (
              <text
                x={chartRight - 4}
                y={getY(refLineY) - 5}
                textAnchor="end"
                fontSize="10"
                fontWeight="600"
                fill="#B45309"
              >
                {refLineLabel}
              </text>
            )}
          </g>
        )}

        {/* Area fill */}
        {areaD && <path d={areaD} fill="url(#scoreTrendGradient)" />}

        {/* Curve stroke */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={lineStroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartBottom + 18}
            textAnchor="middle"
            fontSize="11"
            fill={hoverIndex === i ? '#0F766E' : '#64748B'}
            fontWeight={hoverIndex === i ? '700' : '500'}
          >
            {p.data.week || p.data.label || `W${i + 1}`}
          </text>
        ))}

        {/* Interactive Hover Areas & Points */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            style={{ cursor: 'pointer' }}
          >
            {/* Transparent hover capture column */}
            <rect
              x={p.x - 20}
              y={chartTop}
              width="40"
              height={chartHeight}
              fill="transparent"
            />
            {/* Point circle */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 6 : 4}
              fill="#FFFFFF"
              stroke={lineStroke}
              strokeWidth={hoverIndex === i ? 3 : 2}
            />
          </g>
        ))}

        {/* Active hover vertical indicator line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={chartTop}
            x2={activePoint.x}
            y2={chartBottom}
            stroke={lineStroke}
            strokeDasharray="2 2"
            strokeWidth="1"
            opacity="0.6"
          />
        )}
      </svg>

      {/* HTML Tooltip Overlay */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {CustomTooltipContent ? (
            React.isValidElement(CustomTooltipContent) ? (
              React.cloneElement(CustomTooltipContent, {
                active: true,
                payload: [{ payload: activePoint.data, value: activePoint.data[lineDataKey] }],
              })
            ) : typeof CustomTooltipContent === 'function' ? (
              React.createElement(CustomTooltipContent, {
                active: true,
                payload: [{ payload: activePoint.data, value: activePoint.data[lineDataKey] }],
              })
            ) : null
          ) : (
            <div
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              {activePoint.data.label || activePoint.data.week}: {activePoint.data[lineDataKey]} pts
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * BarChart Component
 */
export function BarChart({
  data = [],
  margin = { top: 16, right: 10, left: 0, bottom: 0 },
  containerHeight = 240,
  children,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return <div style={{ height: containerHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>No chart data</div>;
  }

  let barDataKey = 'minutes';
  let refLineY = 30;
  let refLineLabel = '30m Goal';
  let CustomTooltipContent = null;
  let cellColors = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Bar) {
      if (child.props.dataKey) barDataKey = child.props.dataKey;
      if (child.props.children) {
        React.Children.forEach(child.props.children, (c) => {
          if (React.isValidElement(c) && c.type === Cell) {
            cellColors.push(c.props.fill);
          }
        });
      }
    }
    if (child.type === ReferenceLine) {
      if (child.props.y !== undefined) refLineY = child.props.y;
      if (child.props.label && child.props.label.value) refLineLabel = child.props.label.value;
    }
    if (child.type === Tooltip) {
      if (child.props.content) CustomTooltipContent = child.props.content;
    }
  });

  const width = containerWidth || 500;
  const height = typeof containerHeight === 'number' ? containerHeight : 240;
  const chartTop = margin.top;
  const chartBottom = height - 25;
  const chartLeft = 35;
  const chartRight = width - 10;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;

  const maxVal = Math.max(60, ...data.map((d) => Number(d[barDataKey]) || 0));

  const getY = (val) => chartBottom - (val / maxVal) * chartHeight;
  const slotWidth = chartWidth / data.length;
  const barWidth = Math.min(36, slotWidth * 0.6);

  const activeData = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} onMouseLeave={() => setHoverIndex(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Horizontal grid */}
        {[0, 30, Math.round(maxVal / 2), maxVal].map((val, idx) => {
          const y = getY(val);
          return (
            <g key={idx}>
              <line x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
              <text x={chartLeft - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#94A3B8">{val}m</text>
            </g>
          );
        })}

        {/* Reference Line */}
        {refLineY !== null && (
          <g>
            <line x1={chartLeft} y1={getY(refLineY)} x2={chartRight} y2={getY(refLineY)} stroke="#D97706" strokeDasharray="4 4" strokeWidth="1.5" />
            <text x={chartRight - 4} y={getY(refLineY) - 4} textAnchor="end" fontSize="10" fill="#B45309" fontWeight="600">{refLineLabel}</text>
          </g>
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const val = Number(d[barDataKey]) || 0;
          const barH = (val / maxVal) * chartHeight;
          const x = chartLeft + i * slotWidth + (slotWidth - barWidth) / 2;
          const y = chartBottom - barH;
          const color = cellColors[i] || (d.reachedGoal ? '#0F766E' : '#94A3B8');

          return (
            <g key={i} onMouseEnter={() => setHoverIndex(i)} style={{ cursor: 'pointer' }}>
              <rect x={x} y={y} width={barWidth} height={Math.max(2, barH)} rx="4" ry="4" fill={color} />
              <text x={x + barWidth / 2} y={chartBottom + 16} textAnchor="middle" fontSize="11" fill={hoverIndex === i ? '#0F766E' : '#64748B'} fontWeight={hoverIndex === i ? '700' : '500'}>
                {d.day || `D${i + 1}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {activeData && (
        <div
          style={{
            position: 'absolute',
            left: `${((chartLeft + hoverIndex * slotWidth + slotWidth / 2) / width) * 100}%`,
            top: `${(getY(activeData[barDataKey]) / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {CustomTooltipContent ? (
            React.isValidElement(CustomTooltipContent) ? (
              React.cloneElement(CustomTooltipContent, {
                active: true,
                payload: [{ payload: activeData, value: activeData[barDataKey] }],
              })
            ) : typeof CustomTooltipContent === 'function' ? (
              React.createElement(CustomTooltipContent, {
                active: true,
                payload: [{ payload: activeData, value: activeData[barDataKey] }],
              })
            ) : null
          ) : (
            <div style={{ background: '#0F172A', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
              {activeData.label || activeData.day}: {activeData[barDataKey]} mins
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Cell,
};
