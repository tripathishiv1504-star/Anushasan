import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './TimetableGrid.css';

/**
 * TimetableGrid
 * Weekly timetable view showing schedule from student's enrolled classes.
 *
 * @param {Array<Object>} timetable - Array of timetable session items
 */
export function TimetableGrid({ timetable = [] }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Detect current day of week (Monday=1 .. Friday=5)
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const initialDay =
    currentDayIndex >= 1 && currentDayIndex <= 5 ? days[currentDayIndex - 1] : 'Monday';

  const [activeDay, setActiveDay] = useState(initialDay);

  // Filter sessions for selected day
  const daySessions = timetable.filter((s) => s.day_of_week === activeDay);

  return (
    <Card className="timetable-card">
      <div className="timetable-header">
        <div className="timetable-title-wrap">
          <CalendarDays className="timetable-title-icon" size={20} />
          <div>
            <h3 className="timetable-title">Weekly Lecture Timetable</h3>
            <p className="timetable-subtitle">
              Class schedule & laboratory hours for enrolled courses
            </p>
          </div>
        </div>

        {/* Day selection tabs */}
        <div className="timetable-tabs" role="tablist" aria-label="Select day for timetable">
          {days.map((day, idx) => {
            const isToday = currentDayIndex === idx + 1;
            const isSelected = activeDay === day;

            return (
              <button
                key={day}
                role="tab"
                aria-selected={isSelected}
                className={`timetable-tab-btn ${isSelected ? 'timetable-tab-btn--active' : ''} ${
                  isToday ? 'timetable-tab-btn--today' : ''
                }`}
                onClick={() => setActiveDay(day)}
              >
                <span>{day.slice(0, 3)}</span>
                {isToday && <span className="timetable-today-dot" title="Today" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions Content */}
      <div className="timetable-body">
        <div className="timetable-active-day-heading">
          <span className="timetable-day-name">{activeDay}</span>
          <span className="timetable-session-count">
            {daySessions.length} {daySessions.length === 1 ? 'lecture' : 'sessions'} scheduled
          </span>
        </div>

        {daySessions.length === 0 ? (
          <div className="timetable-empty">
            <Sparkles size={24} className="timetable-empty-icon" />
            <p>No scheduled lectures or labs on {activeDay}. Great time for self-study!</p>
          </div>
        ) : (
          <div className="timetable-session-list">
            {daySessions.map((item) => (
              <div key={item.id} className="timetable-session-item">
                <div className="timetable-session-time-col">
                  <span className="timetable-time-text">
                    <Clock size={13} />
                    {item.start_time} - {item.end_time}
                  </span>
                  <Badge
                    variant={
                      item.type === 'Lab'
                        ? 'info'
                        : item.type === 'Tutorial'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {item.type}
                  </Badge>
                </div>

                <div className="timetable-session-details">
                  <div className="timetable-session-top">
                    <h4 className="timetable-session-subject">{item.subject}</h4>
                    {item.class_code && (
                      <span className="timetable-class-code">{item.class_code}</span>
                    )}
                  </div>

                  <div className="timetable-session-meta">
                    <span className="timetable-meta-item">
                      <MapPin size={13} />
                      {item.room}
                    </span>
                    <span className="timetable-meta-item">
                      <User size={13} />
                      {item.mentor_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default TimetableGrid;
