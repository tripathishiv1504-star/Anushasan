import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  ChevronRight,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import './StudentTable.css';

/**
 * StudentTable component for Class Dashboard
 *
 * @param {Object} props
 * @param {Array<Object>} props.students
 * @param {(student: Object) => void} props.onSelectStudent
 */
export function StudentTable({ students = [], onSelectStudent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('current_score');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Filter and sort students
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = students.filter(
      (s) =>
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
    );

    return filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (sortField === 'is_at_risk') {
        valA = a.is_at_risk ? 1 : 0;
        valB = b.is_at_risk ? 1 : 0;
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });
  }, [students, searchQuery, sortField, sortOrder]);

  const getScoreFillColor = (score) => {
    if (score < 50) return 'var(--color-danger)';
    if (score < 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div className="student-table-container">
      {/* Table Header with Search */}
      <div className="student-table-header">
        <div className="student-table-header__title-group">
          <h3>Enrolled Students ({students.length})</h3>
          <p className="student-table-header__subtitle">
            Click on any student record to inspect their 8-week trend and study breakdown.
          </p>
        </div>

        <div className="student-table-search">
          <Search size={15} className="student-table-search__icon" />
          <input
            type="text"
            className="student-table-search__input"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search enrolled students"
          />
        </div>
      </div>

      {/* Responsive Scrollable Container */}
      <div className="student-table__wrapper">
        <table className="student-table" aria-label="Class Student Performance Table">
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort('name')}
                style={{ width: '28%' }}
              >
                <div className="th-content">
                  <span>Student</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('current_score')}
                style={{ width: '20%' }}
              >
                <div className="th-content">
                  <span>Discipline Score</span>
                  {getSortIcon('current_score')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('streak')}
                style={{ width: '14%' }}
              >
                <div className="th-content">
                  <span>Streak</span>
                  {getSortIcon('streak')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('attendance_pct')}
                style={{ width: '14%' }}
              >
                <div className="th-content">
                  <span>Attendance</span>
                  {getSortIcon('attendance_pct')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('is_at_risk')}
                style={{ width: '14%' }}
              >
                <div className="th-content">
                  <span>Risk Status</span>
                  {getSortIcon('is_at_risk')}
                </div>
              </th>
              <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                  No students match the search &ldquo;{searchQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((s) => {
                const initials = (s.name || 'S')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                const isLowAttendance = s.attendance_pct < 75;

                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectStudent(s);
                      }
                    }}
                    role="button"
                    aria-label={`View academic summary for ${s.name}`}
                  >
                    {/* Student Name */}
                    <td>
                      <div className="student-cell">
                        <div className="student-cell__avatar">{initials}</div>
                        <div className="student-cell__info">
                          <span className="student-cell__name">{s.name}</span>
                          <span className="student-cell__email">{s.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Discipline Score */}
                    <td>
                      <div className="score-cell">
                        <span
                          className="score-cell__value"
                          style={{ color: getScoreFillColor(s.current_score) }}
                        >
                          {s.current_score}
                        </span>
                        <div className="score-cell__progress-bar">
                          <div
                            className="score-cell__progress-fill"
                            style={{
                              width: `${Math.min(s.current_score, 100)}%`,
                              backgroundColor: getScoreFillColor(s.current_score),
                            }}
                          />
                        </div>
                        {s.previous_score - s.current_score >= 15 && (
                          <span
                            title={`Dropped ${s.previous_score - s.current_score} pts from last week`}
                            style={{ display: 'inline-flex', color: 'var(--color-danger)' }}
                          >
                            <TrendingDown size={14} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Streak */}
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <Flame size={15} style={{ color: s.streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                        <span>{s.streak} {s.streak === 1 ? 'day' : 'days'}</span>
                      </span>
                    </td>

                    {/* Attendance */}
                    <td>
                      <span className={`attendance-cell ${isLowAttendance ? 'attendance-cell--low' : 'attendance-cell--ok'}`}>
                        {s.attendance_pct}%
                        {isLowAttendance && ' (Low)'}
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td>
                      <RiskBadge
                        isAtRisk={s.is_at_risk}
                        reason={s.risk_reason}
                        size="sm"
                      />
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="student-table__view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTable;
