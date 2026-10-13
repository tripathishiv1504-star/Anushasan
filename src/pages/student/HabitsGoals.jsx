import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { habitService } from '../../services/habitService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import HabitGrid from '../../components/student/HabitGrid';
import GoalCard from '../../components/student/GoalCard';
import './HabitsGoals.css';

export function HabitsGoals() {
  const { user } = useAuth();
  const [habitsData, setHabitsData] = useState({ habits: [], weekDays: [] });
  const [goals, setGoals] = useState([]);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Goal Modal State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetDate: '',
    progressPercent: 0,
  });
  const [goalFormErrors, setGoalFormErrors] = useState({});

  const studentId = user?.id || 'user_student_1';

  // Load all habits and goals data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [weeklyHabits, fetchedGoals] = await Promise.all([
        habitService.getWeeklyHabitsData(studentId),
        habitService.getGoals(studentId),
      ]);
      const icons = habitService.getAvailableIcons();

      setHabitsData(weeklyHabits);
      setGoals(fetchedGoals);
      setAvailableIcons(icons);
    } catch (err) {
      console.error('[HabitsGoals] Error loading data:', err);
      setError(err.message || 'Failed to load habits and goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Habit Handlers
  const handleToggleHabitDay = async (habitId, dateKey) => {
    try {
      // Optimistic update in UI
      setHabitsData((prev) => {
        const updatedHabits = prev.habits.map((habit) => {
          if (habit.id === habitId) {
            let completedCount = 0;
            const updatedDays = habit.days.map((d) => {
              const isDone = d.dateKey === dateKey ? !d.isDone : d.isDone;
              if (isDone) completedCount += 1;
              return { ...d, isDone };
            });
            const percent = Math.round((completedCount / 7) * 100);
            return {
              ...habit,
              days: updatedDays,
              daysCompletedThisWeek: completedCount,
              weeklyPercent: percent,
            };
          }
          return habit;
        });
        return { ...prev, habits: updatedHabits };
      });

      await habitService.toggleHabitLog(habitId, dateKey);
    } catch (err) {
      console.error('[HabitsGoals] Error toggling habit log:', err);
      loadData(); // Rollback on error
    }
  };

  const handleAddHabit = async (habitData) => {
    try {
      await habitService.addHabit({
        studentId,
        ...habitData,
      });
      const updated = await habitService.getWeeklyHabitsData(studentId);
      setHabitsData(updated);
    } catch (err) {
      console.error('[HabitsGoals] Error adding habit:', err);
      alert('Failed to add habit.');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await habitService.deleteHabit(habitId);
      const updated = await habitService.getWeeklyHabitsData(studentId);
      setHabitsData(updated);
    } catch (err) {
      console.error('[HabitsGoals] Error deleting habit:', err);
      alert('Failed to delete habit.');
    }
  };

  // Goal Handlers
  const handleOpenAddGoal = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    const dateStr = defaultDate.toISOString().split('T')[0];

    setGoalForm({
      title: '',
      targetDate: dateStr,
      progressPercent: 0,
    });
    setGoalFormErrors({});
    setIsAddGoalModalOpen(true);
  };

  const handleSaveAddGoal = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!goalForm.title.trim()) errs.title = 'Goal title is required';
    if (!goalForm.targetDate) errs.targetDate = 'Target date is required';

    if (Object.keys(errs).length > 0) {
      setGoalFormErrors(errs);
      return;
    }

    try {
      await habitService.addGoal({
        studentId,
        title: goalForm.title,
        targetDate: goalForm.targetDate,
        progressPercent: goalForm.progressPercent,
      });
      const updated = await habitService.getGoals(studentId);
      setGoals(updated);
      setIsAddGoalModalOpen(false);
    } catch (err) {
      console.error('[HabitsGoals] Error adding goal:', err);
      alert('Failed to create goal.');
    }
  };

  const handleUpdateGoalProgress = async (goalId, newPercent) => {
    try {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, progress_percent: newPercent } : g))
      );
      await habitService.updateGoalProgress(goalId, newPercent);
    } catch (err) {
      console.error('[HabitsGoals] Error updating goal progress:', err);
      loadData();
    }
  };

  const handleMarkGoalAchieved = async (goalId) => {
    try {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, progress_percent: 100 } : g))
      );
      await habitService.markGoalAchieved(goalId);
    } catch (err) {
      console.error('[HabitsGoals] Error achieving goal:', err);
      loadData();
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await habitService.deleteGoal(goalId);
      const updated = await habitService.getGoals(studentId);
      setGoals(updated);
    } catch (err) {
      console.error('[HabitsGoals] Error deleting goal:', err);
      alert('Failed to delete goal.');
    }
  };

  if (isLoading) {
    return (
      <div className="habits-goals__loading">
        <LoadingState message="Loading your habits and targets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="habits-goals__error">
        <ErrorState
          title="Could not load habits and goals"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const { habits = [], weekDays = [] } = habitsData;
  const activeGoals = goals.filter((g) => Number(g.progress_percent) < 100);
  const completedGoals = goals.filter((g) => Number(g.progress_percent) === 100);

  // Overall average habit consistency
  const avgConsistency =
    habits.length > 0
      ? Math.round(
          habits.reduce((sum, h) => sum + (h.weeklyPercent || 0), 0) / habits.length
        )
      : 0;

  return (
    <div className="habits-goals">
      {/* Header */}
      <div className="habits-goals__header">
        <div>
          <h1 className="habits-goals__title">Habits & Goals</h1>
          <p className="habits-goals__subtitle">
            Cultivate winning daily habits and track milestone academic targets.
          </p>
        </div>

        <div className="habits-goals__overview-pills">
          <div className="overview-pill">
            <span className="overview-pill__label">Weekly Habit Score</span>
            <span className="overview-pill__value overview-pill__value--primary">
              {avgConsistency}%
            </span>
          </div>
          <div className="overview-pill">
            <span className="overview-pill__label">Active Goals</span>
            <span className="overview-pill__value">{activeGoals.length}</span>
          </div>
          <div className="overview-pill">
            <span className="overview-pill__label">Achieved</span>
            <span className="overview-pill__value overview-pill__value--success">
              {completedGoals.length}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Weekly Habits Grid */}
      <section className="habits-goals__section">
        <HabitGrid
          habits={habits}
          weekDays={weekDays}
          onToggleHabitDay={handleToggleHabitDay}
          onAddHabit={handleAddHabit}
          onDeleteHabit={handleDeleteHabit}
          availableIcons={availableIcons}
        />
      </section>

      {/* Section 2: Goals Management */}
      <section className="habits-goals__section">
        <div className="goals-section-header">
          <div className="goals-section-header__title-row">
            <Target size={20} className="goals-section-header__icon" />
            <div>
              <h3 className="goals-section-header__title">Academic Targets & Goals</h3>
              <p className="goals-section-header__subtitle">
                Set milestones, adjust your progress, and celebrate achievements.
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddGoal}>
            New Goal
          </Button>
        </div>

        {/* Active Goals Grid */}
        <div className="goals-grid-wrapper">
          <h4 className="goals-group-label">
            In Progress ({activeGoals.length})
          </h4>

          {activeGoals.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={Target}
                title="No active goals set"
                description="Break your semester into milestone targets like exam preparation or project builds."
                actionText="Create a Target"
                onAction={handleOpenAddGoal}
              />
            </Card>
          ) : (
            <div className="goals-cards-grid">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={handleUpdateGoalProgress}
                  onMarkAchieved={handleMarkGoalAchieved}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Goals Section */}
        {completedGoals.length > 0 && (
          <div className="goals-grid-wrapper goals-grid-wrapper--completed">
            <div className="goals-completed-heading">
              <CheckCircle2 size={16} className="goals-completed-icon" />
              <h4 className="goals-group-label">
                Accomplished Goals ({completedGoals.length})
              </h4>
            </div>

            <div className="goals-cards-grid">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={handleUpdateGoalProgress}
                  onMarkAchieved={handleMarkGoalAchieved}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title="Add New Target Goal"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsAddGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAddGoal}>
              Save Target
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAddGoal} className="goal-modal-form">
          <Input
            label="Target Goal Title"
            placeholder="e.g. Solve 50 Graph Traversal LeetCode problems"
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            error={goalFormErrors.title}
            required
          />

          <Input
            type="date"
            label="Target Completion Date"
            value={goalForm.targetDate}
            onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
            error={goalFormErrors.targetDate}
            required
          />

          <div className="input-group">
            <label className="input-group__label">
              Initial Progress: {goalForm.progressPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={goalForm.progressPercent}
              onChange={(e) =>
                setGoalForm({ ...goalForm, progressPercent: Number(e.target.value) })
              }
              className="goal-card__slider"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HabitsGoals;
