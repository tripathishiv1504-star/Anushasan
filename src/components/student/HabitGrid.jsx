import React, { useState } from 'react';
import {
  BookOpen,
  Dumbbell,
  Book,
  Droplets,
  Moon,
  Plus,
  Check,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import './HabitGrid.css';

/**
 * Map habit icon string to Lucide component and color style
 */
export function getHabitIconComponent(iconName) {
  switch (iconName) {
    case 'exercise':
      return { Icon: Dumbbell, colorClass: 'habit-icon--exercise' };
    case 'reading':
      return { Icon: Book, colorClass: 'habit-icon--reading' };
    case 'water':
      return { Icon: Droplets, colorClass: 'habit-icon--water' };
    case 'sleep':
      return { Icon: Moon, colorClass: 'habit-icon--sleep' };
    case 'study':
    default:
      return { Icon: BookOpen, colorClass: 'habit-icon--study' };
  }
}

/**
 * HabitGrid Component
 * Weekly Monday-to-Sunday interactive habit tracker grid
 *
 * @param {Array<Object>} habits - List of habits with weekly days and consistency
 * @param {Array<Object>} weekDays - Monday to Sunday day headers
 * @param {Function} onToggleHabitDay - Callback when a day checkbox is toggled (habitId, dateKey)
 * @param {Function} onAddHabit - Callback to add a new habit
 * @param {Function} onDeleteHabit - Callback to delete a habit
 * @param {Array<Object>} availableIcons - List of allowed icons
 */
export function HabitGrid({
  habits = [],
  weekDays = [],
  onToggleHabitDay,
  onAddHabit,
  onDeleteHabit,
  availableIcons = [],
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitForm, setHabitForm] = useState({ name: '', icon: 'study' });
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setHabitForm({ name: '', icon: 'study' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!habitForm.name.trim()) {
      setFormError('Habit name is required');
      return;
    }
    await onAddHabit({
      name: habitForm.name,
      icon: habitForm.icon,
    });
    setIsAddModalOpen(false);
  };

  const handleDelete = async (habitId, habitName) => {
    if (window.confirm(`Delete habit "${habitName}"? All weekly logs for this habit will be removed.`)) {
      await onDeleteHabit(habitId);
    }
  };

  return (
    <Card className="habit-grid-card" padding="lg">
      <div className="habit-grid-card__header">
        <div>
          <div className="habit-grid-card__title-row">
            <Sparkles size={20} className="habit-grid-card__icon" />
            <h3 className="habit-grid-card__title">Weekly Habits</h3>
          </div>
          <p className="habit-grid-card__subtitle">
            Consistent daily routines boost your overall discipline score. Tick off each day as you complete it.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No daily habits set"
          description="Build powerful campus routines like 30m study, hydration, and sleep by adding your first habit."
          actionText="Add First Habit"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="habit-grid-table-wrapper">
          <table className="habit-grid-table">
            <thead>
              <tr>
                <th className="habit-th habit-th--name">Habit & Consistency</th>
                {weekDays.map((day) => (
                  <th
                    key={day.dateKey}
                    className={`habit-th habit-th--day ${
                      day.isToday ? 'habit-th--today' : ''
                    }`}
                  >
                    <span className="habit-th__name">{day.dayName}</span>
                    <span className="habit-th__num">{day.dayNumber}</span>
                  </th>
                ))}
                <th className="habit-th habit-th--actions" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const { Icon, colorClass } = getHabitIconComponent(habit.icon);
                const percent = habit.weeklyPercent || 0;

                return (
                  <tr key={habit.id} className="habit-row">
                    <td className="habit-td habit-td--info">
                      <div className="habit-info">
                        <div className={`habit-icon-pill ${colorClass}`}>
                          <Icon size={16} />
                        </div>
                        <div className="habit-details">
                          <span className="habit-name">{habit.name}</span>
                          <div className="habit-progress-bar-wrap">
                            <div className="habit-progress-bar-track">
                              <div
                                className="habit-progress-bar-fill"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="habit-percent-text">
                              {percent}% ({habit.daysCompletedThisWeek}/7 days)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 7 Days Checkboxes */}
                    {habit.days.map((day) => (
                      <td
                        key={day.dateKey}
                        className={`habit-td habit-td--check ${
                          day.isToday ? 'habit-td--today' : ''
                        }`}
                      >
                        <label className="habit-check-label">
                          <input
                            type="checkbox"
                            className="habit-check-input"
                            checked={day.isDone}
                            onChange={() => onToggleHabitDay(habit.id, day.dateKey)}
                            aria-label={`${habit.name} on ${day.dayName}`}
                          />
                          <span
                            className={`habit-check-custom ${
                              day.isDone ? 'habit-check-custom--done' : ''
                            }`}
                          >
                            {day.isDone && <Check size={14} className="habit-check-icon" />}
                          </span>
                        </label>
                      </td>
                    ))}

                    {/* Actions */}
                    <td className="habit-td habit-td--actions">
                      <button
                        type="button"
                        className="habit-delete-btn"
                        onClick={() => handleDelete(habit.id, habit.name)}
                        aria-label={`Delete habit ${habit.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Habit"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Habit
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="add-habit-form">
          <Input
            label="Habit Name"
            placeholder="e.g. Read 20 pages of textbook"
            value={habitForm.name}
            onChange={(e) => {
              setHabitForm({ ...habitForm, name: e.target.value });
              if (e.target.value) setFormError('');
            }}
            error={formError}
            required
          />

          <div className="icon-selector-group">
            <label className="input-group__label">Choose Habit Icon</label>
            <div className="icon-selector-grid">
              {availableIcons.map((item) => {
                const { Icon, colorClass } = getHabitIconComponent(item.id);
                const isSelected = habitForm.icon === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`icon-option-btn ${isSelected ? 'icon-option-btn--selected' : ''}`}
                    onClick={() => setHabitForm({ ...habitForm, icon: item.id })}
                  >
                    <div className={`icon-option-btn__icon ${colorClass}`}>
                      <Icon size={20} />
                    </div>
                    <span className="icon-option-btn__label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

export default HabitGrid;
