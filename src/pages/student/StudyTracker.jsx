import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studyService } from '../../services/studyService';
import { formatDuration } from '../../utils/dates';
import { toDateKey } from '../../utils/scoring';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StudyTimer from '../../components/student/StudyTimer';
import SessionList from '../../components/student/SessionList';
import TaskManager from '../../components/student/TaskManager';
import './StudyTracker.css';

export function StudyTracker() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingSession, setIsSavingSession] = useState(false);

  const studentId = user?.id || 'user_student_1';
  const studyMode = user?.study_mode || 'class';

  // Load tracker data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedSessions, fetchedTasks] = await Promise.all([
        studyService.getStudySessions(studentId),
        studyService.getTasks(studentId),
      ]);
      const availableSubjects = studyService.getAvailableSubjects(studyMode);

      setSessions(fetchedSessions);
      setTasks(fetchedTasks);
      setSubjects(availableSubjects);
    } catch (err) {
      console.error('[StudyTracker] Failed to load study data:', err);
      setError(err.message || 'Failed to load study tracker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, studyMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Session Handlers
  const handleSaveSession = async (sessionData) => {
    try {
      setIsSavingSession(true);
      await studyService.addStudySession({
        studentId,
        ...sessionData,
      });
      const updated = await studyService.getStudySessions(studentId);
      setSessions(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to save session:', err);
      alert('Failed to save study session. Please try again.');
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleUpdateSession = async (sessionId, updates) => {
    try {
      await studyService.updateStudySession(sessionId, updates);
      const updated = await studyService.getStudySessions(studentId);
      setSessions(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to update session:', err);
      alert('Failed to update study session.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await studyService.deleteStudySession(sessionId);
      const updated = await studyService.getStudySessions(studentId);
      setSessions(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to delete session:', err);
      alert('Failed to delete study session.');
    }
  };

  // Task Handlers
  const handleAddTask = async (taskData) => {
    try {
      await studyService.addTask({
        studentId,
        ...taskData,
      });
      const updated = await studyService.getTasks(studentId);
      setTasks(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to add task:', err);
      alert('Failed to create task.');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await studyService.updateTask(taskId, updates);
      const updated = await studyService.getTasks(studentId);
      setTasks(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to update task:', err);
      alert('Failed to update task.');
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      // Optimistic update in UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_done: !t.is_done } : t))
      );
      await studyService.toggleTaskDone(taskId);
      const updated = await studyService.getTasks(studentId);
      setTasks(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to toggle task:', err);
      loadData(); // Rollback
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await studyService.deleteTask(taskId);
      const updated = await studyService.getTasks(studentId);
      setTasks(updated);
    } catch (err) {
      console.error('[StudyTracker] Failed to delete task:', err);
      alert('Failed to delete task.');
    }
  };

  if (isLoading) {
    return (
      <div className="study-tracker__loading">
        <LoadingState message="Loading your study tracker..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-tracker__error">
        <ErrorState
          title="Could not load study tracker"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  // Calculate header stats
  const todayKey = toDateKey(new Date());
  const todayMinutes = sessions
    .filter((s) => s.started_at && s.started_at.startsWith(todayKey))
    .reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);

  const pendingTasksCount = tasks.filter((t) => !t.is_done).length;

  return (
    <div className="study-tracker">
      {/* Page Header */}
      <div className="study-tracker__header">
        <div>
          <h1 className="study-tracker__title">Study Tracker</h1>
          <p className="study-tracker__subtitle">
            Log your daily deep work and complete course assignments to increase your discipline score.
          </p>
        </div>

        <div className="study-tracker__quick-stats">
          <div className="tracker-stat-pill">
            <span className="tracker-stat-pill__label">Today’s Study</span>
            <span className="tracker-stat-pill__value">{formatDuration(todayMinutes)}</span>
          </div>
          <div className="tracker-stat-pill">
            <span className="tracker-stat-pill__label">Pending Tasks</span>
            <span className="tracker-stat-pill__value">{pendingTasksCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Timer & Sessions; Right = Tasks */}
      <div className="study-tracker__grid">
        <div className="study-tracker__col">
          <StudyTimer
            subjects={subjects}
            onSaveSession={handleSaveSession}
            isSaving={isSavingSession}
          />

          <SessionList
            sessions={sessions}
            subjects={subjects}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>

        <div className="study-tracker__col">
          <TaskManager
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
}

export default StudyTracker;
