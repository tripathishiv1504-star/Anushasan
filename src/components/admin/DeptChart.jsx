import React, { useState, useRef, useEffect } from 'react';
import './DeptChart.css';

/**
 * DeptChart - Multi-mode chart for Department Analytics
 *
 * Modes:
 * - 'comparison': Class-by-class comparison bar chart (Discipline Score & Attendance %)
 * - 'trend': 8-Week historical score progression line chart with passing benchmark
 *
 * @param {'comparison' | 'trend'} type
 * @param {Array<Object>} data
 * @param {string} [title]
 * @param {string} [subtitle]
 * @param {number} [height=260]
 */
export function DeptChart({
  type = 'comparison',
  data = [],
  title,
  subtitle,
  height = 260,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(640);
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
    return (
      <div className="dept-chart-empty" style={{ height }}>
        <p>No departmental data available to render chart.</p>
      </div>
    );
  }

  // Width and coordinate mapping for responsive SVG viewBox
  const width = containerWidth || 640;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 1. COMPARISON MODE: Grouped Bars for Classes
  if (type === 'comparison') {
    const numBars = data.length;
    const groupWidth = chartWidth / numBars;
    const barWidth = Math.min(28, (groupWidth - 20) / 2);

    return (
      <div className="dept-chart-wrapper">
        {title && (
          <div className="dept-chart-header">
            <div>
              <h3 className="dept-chart-title">{title}</h3>
              {subtitle && <p className="dept-chart-subtitle">{subtitle}</p>}
            </div>
            <div className="dept-chart-legend">
              <span className="legend-item">
                <span className="legend-dot dot-score" />
                <span>Avg Score</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot dot-attendance" />
                <span>Attendance %</span>
              </span>
            </div>
          </div>
        )}

        <div ref={containerRef} className="dept-chart-svg-container" style={{ height }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="dept-chart-svg"
          >
            {/* Horizontal Grid Lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = padding.top + chartHeight - (val / 100) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    className="grid-line"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="axis-label"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Threshold Line at 50 */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight - 0.5 * chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight - 0.5 * chartHeight}
              className="threshold-line"
              strokeDasharray="4 3"
            />

            {/* Bars for each class */}
            {data.map((item, i) => {
              const groupCenterX = padding.left + i * groupWidth + groupWidth / 2;
              const scoreHeight = ((item.avg_score || 0) / 100) * chartHeight;
              const attHeight = ((item.avg_attendance || 0) / 100) * chartHeight;

              const scoreX = groupCenterX - barWidth - 2;
              const attX = groupCenterX + 2;

              const scoreY = padding.top + chartHeight - scoreHeight;
              const attY = padding.top + chartHeight - attHeight;

              const isHovered = hoverIndex === i;

              return (
                <g
                  key={item.id || i}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="bar-group"
                >
                  {/* Score Bar */}
                  <rect
                    x={scoreX}
                    y={scoreY}
                    width={barWidth}
                    height={Math.max(4, scoreHeight)}
                    rx={3}
                    className={`bar-rect bar-score ${isHovered ? 'bar-hovered' : ''}`}
                  />

                  {/* Attendance Bar */}
                  <rect
                    x={attX}
                    y={attY}
                    width={barWidth}
                    height={Math.max(4, attHeight)}
                    rx={3}
                    className={`bar-rect bar-attendance ${isHovered ? 'bar-hovered' : ''}`}
                  />

                  {/* X-Axis Class Label */}
                  <text
                    x={groupCenterX}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    className={`axis-label-x ${isHovered ? 'label-active' : ''}`}
                  >
                    {item.short_name || item.join_code || `Class ${i + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Active Tooltip */}
          {hoverIndex !== null && data[hoverIndex] && (
            <div
              className="dept-chart-tooltip"
              style={{
                left: `${((padding.left + hoverIndex * groupWidth + groupWidth / 2) / width) * 100}%`,
                top: '20%',
              }}
            >
              <div className="tooltip-title">{data[hoverIndex].name}</div>
              <div className="tooltip-row">
                <span className="tooltip-bullet dot-score" />
                <span>Avg Discipline Score:</span>
                <strong>{data[hoverIndex].avg_score} pts</strong>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-bullet dot-attendance" />
                <span>Avg Attendance:</span>
                <strong>{data[hoverIndex].avg_attendance}%</strong>
              </div>
              {data[hoverIndex].at_risk_count > 0 && (
                <div className="tooltip-row tooltip-risk">
                  <span>At-Risk Students:</span>
                  <strong>{data[hoverIndex].at_risk_count}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. TREND MODE: 8-Week Score Progression Line Chart
  const minY = 0;
  const maxY = 100;
  const numPoints = data.length;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, numPoints - 1)) * chartWidth;
    const yVal = Math.max(minY, Math.min(maxY, Number(d.score) || 0));
    const y = padding.top + chartHeight - (yVal / 100) * chartHeight;
    return { x, y, data: d, index: i };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
      : '';

  const benchmarkY = padding.top + chartHeight - 0.5 * chartHeight;

  return (
    <div className="dept-chart-wrapper">
      {title && (
        <div className="dept-chart-header">
          <div>
            <h3 className="dept-chart-title">{title}</h3>
            {subtitle && <p className="dept-chart-subtitle">{subtitle}</p>}
          </div>
          <div className="dept-chart-legend">
            <span className="legend-item">
              <span className="legend-dot dot-trend" />
              <span>Dept Avg Score</span>
            </span>
            <span className="legend-item">
              <span className="legend-dash dot-benchmark" />
              <span>Passing Benchmark (50)</span>
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="dept-chart-svg-container" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="dept-chart-svg"
        >
          <defs>
            <linearGradient id="deptTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="grid-line"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="axis-label"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 50 Benchmark Line */}
          <line
            x1={padding.left}
            y1={benchmarkY}
            x2={width - padding.right}
            y2={benchmarkY}
            className="threshold-line"
            strokeDasharray="4 4"
          />
          <text
            x={width - padding.right}
            y={benchmarkY - 6}
            textAnchor="end"
            className="threshold-label"
          >
            Passing Baseline (50)
          </text>

          {/* Filled Area */}
          {areaD && <path d={areaD} fill="url(#deptTrendGradient)" />}

          {/* Main Trend Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              className="trend-path"
              stroke="#0F766E"
              strokeWidth="2.5"
            />
          )}

          {/* Week Labels and Data Points */}
          {points.map((p, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="point-group"
              >
                {/* Transparent capture column */}
                <rect
                  x={p.x - 20}
                  y={padding.top}
                  width={40}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                />

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  className={`trend-circle ${isHovered ? 'circle-active' : ''}`}
                />

                {/* X Axis Week Label */}
                <text
                  x={p.x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`axis-label-x ${isHovered ? 'label-active' : ''}`}
                >
                  {p.data.week || `W${i + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="dept-chart-tooltip"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${(points[hoverIndex].y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="tooltip-title">{points[hoverIndex].data.week} Average</div>
            <div className="tooltip-row">
              <span className="tooltip-bullet dot-trend" />
              <span>Score:</span>
              <strong>{points[hoverIndex].data.score} pts</strong>
            </div>
            <div className="tooltip-hint">
              {points[hoverIndex].data.score >= 50 ? 'On Track' : 'Below Passing Baseline'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeptChart;
