import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight, Check } from 'lucide-react';
import { ROUTES } from '../../routes/routeConfig';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import './TodayTasks.css';

/**
 * TodayTasks Component
 * Interactive task checklist for the student's dashboard
 *
 * @param {Array<Object>} tasks - List of today's tasks
 * @param {Function} onToggle - Callback when task checkbox is toggled (taskId)
 * @param {string | null} togglingId - ID of task currently in flight
 */
export function TodayTasks({ tasks = [], onToggle, togglingId = null }) {
  const completedCount = tasks.filter((t) => t.is_done).length;
  const totalCount = tasks.length;

  return (
    <Card className="today-tasks-card" padding="lg">
      <div className="today-tasks-card__header">
        <div>
          <div className="today-tasks-card__title-row">
            <h3 className="today-tasks-card__title">Today’s Tasks</h3>
            <span className="today-tasks-card__counter">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <p className="today-tasks-card__subtitle">
            Check off completed assignments to instantly boost your discipline score.
          </p>
        </div>

        <Link to={ROUTES.studentStudy} className="today-tasks-card__manage-link">
          <span>Study Tracker</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks scheduled for today"
          description="You’re all caught up! Head to the study tracker to schedule upcoming assignments."
          actionText="Add New Task"
          actionLink={ROUTES.studentStudy}
        />
      ) : (
        <div className="today-tasks-card__list">
          {tasks.map((task) => {
            const isDone = Boolean(task.is_done);
            const isPending = togglingId === task.id;

            return (
              <div
                key={task.id}
                className={`task-row ${isDone ? 'task-row--done' : ''} ${
                  isPending ? 'task-row--pending' : ''
                }`}
              >
                <label className="task-row__checkbox-label">
                  <input
                    type="checkbox"
                    className="task-row__native-checkbox"
                    checked={isDone}
                    disabled={isPending}
                    onChange={() => onToggle && onToggle(task.id)}
                    aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'done'}`}
                  />
                  <span className="task-row__custom-checkbox">
                    {isDone && <Check size={14} className="task-row__check-icon" />}
                  </span>
                </label>

                <div className="task-row__content">
                  <span className="task-row__title">{task.title}</span>
                  <div className="task-row__meta">
                    {task.subject && (
                      <Badge variant="neutral" size="sm" className="task-row__subject-badge">
                        {task.subject}
                      </Badge>
                    )}
                    <span className="task-row__due">Due Today</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default TodayTasks;
