import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './AttendanceCalendar.css';

/**
 * AttendanceCalendar
 * Month view calendar displaying attendance records with color + text indicators and legend.
 *
 * @param {Array<Object>} records - Array of attendance records
 * @param {Date} [initialDate] - Optional start date (defaults to current date / records date)
 */
export function AttendanceCalendar({ records = [], initialDate = new Date() }) {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => {
    // If records exist, initialize around the most recent record or initialDate
    if (records.length > 0 && records[0].session_date) {
      const d = new Date(records[0].session_date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(initialDate);
  });

  const [selectedRecord, setSelectedRecord] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedRecord(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedRecord(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedRecord(null);
  };

  // Month metadata
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map records by YYYY-MM-DD
  const recordMap = {};
  for (const r of records) {
    if (!r.session_date) continue;
    // Normalize date string (YYYY-MM-DD)
    const dateKey = r.session_date.slice(0, 10);
    if (!recordMap[dateKey]) {
      recordMap[dateKey] = [];
    }
    recordMap[dateKey].push(r);
  }

  // Today key
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar grid cells
  const calendarCells = [];
  // 1. Padding days from previous month
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevDayNum = prevMonthDaysCount - firstDayOfMonth + i + 1;
    calendarCells.push({
      type: 'padding',
      dayNumber: prevDayNum,
      key: `pad-prev-${i}`,
    });
  }

  // 2. Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    const dayRecords = recordMap[dateKey] || [];
    const isToday = dateKey === todayKey;

    calendarCells.push({
      type: 'day',
      dayNumber: d,
      dateKey,
      records: dayRecords,
      isToday,
      key: `day-${dateKey}`,
    });
  }

  return (
    <Card className="attendance-calendar-card">
      <div className="attendance-calendar-header">
        <div className="attendance-calendar-title-wrap">
          <CalendarIcon className="attendance-calendar-icon" size={20} />
          <h3 className="attendance-calendar-title">Monthly Attendance View</h3>
          <span className="attendance-calendar-subtitle">
            {monthName} {year}
          </span>
        </div>

        <div className="attendance-calendar-nav">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            icon={ChevronLeft}
          />
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Next month"
            icon={ChevronRight}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="attendance-calendar-table-wrap" role="region" aria-label="Attendance Calendar">
        <div className="attendance-calendar-grid">
          {/* Day Headers */}
          {dayNames.map((name) => (
            <div key={name} className="attendance-calendar-day-header">
              {name}
            </div>
          ))}

          {/* Day Cells */}
          {calendarCells.map((cell) => {
            if (cell.type === 'padding') {
              return (
                <div key={cell.key} className="attendance-calendar-cell attendance-calendar-cell--pad">
                  <span className="attendance-calendar-date-num">{cell.dayNumber}</span>
                </div>
              );
            }

            const hasRecords = cell.records && cell.records.length > 0;
            const primaryRecord = hasRecords ? cell.records[0] : null;
            const status = primaryRecord ? primaryRecord.status : null;
            const isSelected = selectedRecord && selectedRecord.session_date === cell.dateKey;

            return (
              <div
                key={cell.key}
                className={`attendance-calendar-cell ${
                  cell.isToday ? 'attendance-calendar-cell--today' : ''
                } ${hasRecords ? `attendance-calendar-cell--status-${status}` : ''} ${
                  isSelected ? 'attendance-calendar-cell--selected' : ''
                }`}
                onClick={() => hasRecords && setSelectedRecord(primaryRecord)}
                role={hasRecords ? 'button' : undefined}
                tabIndex={hasRecords ? 0 : undefined}
                aria-label={
                  hasRecords
                    ? `${cell.dateKey}: ${status} in ${primaryRecord.class_name || primaryRecord.subject || 'Session'}`
                    : `${cell.dateKey}`
                }
              >
                <div className="attendance-calendar-cell-top">
                  <span className="attendance-calendar-date-num">{cell.dayNumber}</span>
                  {cell.isToday && <span className="attendance-calendar-today-pill">Today</span>}
                </div>

                <div className="attendance-calendar-cell-content">
                  {hasRecords ? (
                    <div className="attendance-calendar-status-badge">
                      {status === 'present' && (
                        <span className="attendance-pill attendance-pill--present">
                          <CheckCircle2 size={11} /> Present
                        </span>
                      )}
                      {status === 'late' && (
                        <span className="attendance-pill attendance-pill--late">
                          <Clock size={11} /> Late
                        </span>
                      )}
                      {status === 'absent' && (
                        <span className="attendance-pill attendance-pill--absent">
                          <XCircle size={11} /> Absent
                        </span>
                      )}
                      {cell.records.length > 1 && (
                        <span className="attendance-calendar-multi-tag">
                          +{cell.records.length - 1} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="attendance-calendar-empty-dot" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Session Inspector Banner */}
      {selectedRecord && (
        <div className="attendance-selected-inspector animate-fade-in">
          <div className="attendance-selected-info">
            <Info size={16} className="attendance-selected-info-icon" />
            <div>
              <strong>
                {selectedRecord.class_name || selectedRecord.subject || 'Class Session'}
              </strong>
              <span className="attendance-selected-meta">
                Date: {selectedRecord.session_date} {selectedRecord.period ? `• ${selectedRecord.period}` : ''} • Mentor: {selectedRecord.mentor_name || 'Prof. Rajesh Verma'}
              </span>
            </div>
          </div>
          <div className="attendance-selected-action">
            <Badge
              variant={
                selectedRecord.status === 'present'
                  ? 'success'
                  : selectedRecord.status === 'late'
                  ? 'warning'
                  : 'danger'
              }
            >
              {selectedRecord.status.toUpperCase()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRecord(null)}
              className="attendance-selected-close"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Required Legend with both color and text */}
      <div className="attendance-calendar-legend">
        <span className="attendance-legend-title">Legend:</span>
        <div className="attendance-legend-items">
          <div className="attendance-legend-item">
            <span className="attendance-legend-swatch attendance-legend-swatch--present" />
            <span className="attendance-legend-label">Present (On time)</span>
          </div>
          <div className="attendance-legend-item">
            <span className="attendance-legend-swatch attendance-legend-swatch--late" />
            <span className="attendance-legend-label">Late (Recorded after start)</span>
          </div>
          <div className="attendance-legend-item">
            <span className="attendance-legend-swatch attendance-legend-swatch--absent" />
            <span className="attendance-legend-label">Absent (Missed)</span>
          </div>
          <div className="attendance-legend-item">
            <span className="attendance-legend-swatch attendance-legend-swatch--none" />
            <span className="attendance-legend-label">No scheduled class</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AttendanceCalendar;
