import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Check,
  Calendar,
  Edit2,
  Trash2,
  ListTodo,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { toDateKey } from '../../utils/scoring';
import { formatDate } from '../../utils/dates';
import './TaskManager.css';

/**
 * TaskManager Component
 * Manages student tasks with filter tabs (Today, Upcoming, Done), add, edit, toggle, and delete
 *
 * @param {Array<Object>} tasks - List of all student tasks
 * @param {Array<string>} subjects - Available subjects
 * @param {Function} onAddTask - Callback to add task
 * @param {Function} onUpdateTask - Callback to update task
 * @param {Function} onToggleTask - Callback to toggle task is_done
 * @param {Function} onDeleteTask - Callback to delete task
 */
export function TaskManager({
  tasks = [],
  subjects = [],
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'done'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form states
  const todayKey = toDateKey(new Date());
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: subjects[0] || '',
    dueDate: todayKey,
  });
  const [formErrors, setFormErrors] = useState({});

  // Filter tasks into the 3 tabs
  const todayTasks = tasks.filter((t) => !t.is_done && t.due_date <= todayKey);
  const upcomingTasks = tasks.filter((t) => !t.is_done && t.due_date > todayKey);
  const doneTasks = tasks.filter((t) => t.is_done);

  let currentTabTasks = todayTasks;
  if (activeTab === 'upcoming') currentTabTasks = upcomingTasks;
  if (activeTab === 'done') currentTabTasks = doneTasks;

  const subjectOptions = subjects.map((s) => ({ value: s, label: s }));

  // Add Task Handlers
  const handleOpenAdd = () => {
    setTaskForm({
      title: '',
      subject: subjects[0] || '',
      dueDate: todayKey,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!taskForm.title.trim()) errs.title = 'Task title is required';
    if (!taskForm.subject) errs.subject = 'Subject is required';
    if (!taskForm.dueDate) errs.dueDate = 'Due date is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    await onAddTask({
      title: taskForm.title,
      subject: taskForm.subject,
      dueDate: taskForm.dueDate,
    });
    setIsAddModalOpen(false);
  };

  // Edit Task Handlers
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      subject: task.subject || subjects[0] || '',
      dueDate: task.due_date || todayKey,
    });
    setFormErrors({});
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!taskForm.title.trim()) errs.title = 'Task title is required';
    if (!taskForm.subject) errs.subject = 'Subject is required';
    if (!taskForm.dueDate) errs.dueDate = 'Due date is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    await onUpdateTask(editingTask.id, {
      title: taskForm.title,
      subject: taskForm.subject,
      due_date: taskForm.dueDate,
    });
    setEditingTask(null);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task permanently?')) {
      await onDeleteTask(taskId);
    }
  };

  return (
    <Card className="task-manager" padding="lg">
      <div className="task-manager__header">
        <div className="task-manager__title-row">
          <ListTodo size={20} className="task-manager__icon" />
          <h3 className="task-manager__title">Task Management</h3>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          New Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="task-manager__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'today'}
          className={`task-tab ${activeTab === 'today' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span>Today</span>
          <span className="task-tab__count">{todayTasks.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'upcoming'}
          className={`task-tab ${activeTab === 'upcoming' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span>Upcoming</span>
          <span className="task-tab__count">{upcomingTasks.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'done'}
          className={`task-tab ${activeTab === 'done' ? 'task-tab--active' : ''}`}
          onClick={() => setActiveTab('done')}
        >
          <span>Done</span>
          <span className="task-tab__count">{doneTasks.length}</span>
        </button>
      </div>

      {/* Tasks List */}
      <div className="task-manager__list">
        {currentTabTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={
              activeTab === 'today'
                ? 'No tasks due today'
                : activeTab === 'upcoming'
                ? 'No upcoming tasks scheduled'
                : 'No completed tasks in this view'
            }
            description={
              activeTab === 'today'
                ? 'You’re all caught up! Click "New Task" to plan your upcoming study goals.'
                : 'Add assignments or revision topics to stay ahead of class deadlines.'
            }
          />
        ) : (
          currentTabTasks.map((task) => {
            const isDone = Boolean(task.is_done);
            const isOverdue = !isDone && task.due_date < todayKey;

            return (
              <div
                key={task.id}
                className={`task-item ${isDone ? 'task-item--done' : ''} ${
                  isOverdue ? 'task-item--overdue' : ''
                }`}
              >
                <label className="task-item__checkbox-label">
                  <input
                    type="checkbox"
                    className="task-item__native-checkbox"
                    checked={isDone}
                    onChange={() => onToggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${isDone ? 'incomplete' : 'done'}`}
                  />
                  <span className="task-item__custom-checkbox">
                    {isDone && <Check size={14} className="task-item__check-icon" />}
                  </span>
                </label>

                <div className="task-item__body">
                  <span className="task-item__title">{task.title}</span>
                  <div className="task-item__meta">
                    {task.subject && (
                      <Badge variant="neutral" size="sm">
                        {task.subject}
                      </Badge>
                    )}
                    <span className="task-item__date">
                      <Calendar size={12} />
                      {task.due_date === todayKey
                        ? 'Due Today'
                        : isOverdue
                        ? `Overdue (${formatDate(task.due_date)})`
                        : `Due ${formatDate(task.due_date)}`}
                    </span>
                  </div>
                </div>

                <div className="task-item__actions">
                  <button
                    type="button"
                    className="task-item__action-btn"
                    onClick={() => handleOpenEdit(task)}
                    aria-label={`Edit task ${task.title}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="task-item__action-btn task-item__action-btn--delete"
                    onClick={() => handleDelete(task.id)}
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Task
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="task-modal-form">
          <Input
            label="Task Title"
            placeholder="e.g. Finish Operating Systems Lab 4"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            error={formErrors.title}
            required
          />

          <Select
            label="Subject"
            value={taskForm.subject}
            onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
            options={subjectOptions}
            error={formErrors.subject}
            required
          />

          <Input
            type="date"
            label="Due Date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            error={formErrors.dueDate}
            required
          />
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Update Task
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="task-modal-form">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            error={formErrors.title}
            required
          />

          <Select
            label="Subject"
            value={taskForm.subject}
            onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
            options={subjectOptions}
            error={formErrors.subject}
            required
          />

          <Input
            type="date"
            label="Due Date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            error={formErrors.dueDate}
            required
          />
        </form>
      </Modal>
    </Card>
  );
}

export default TaskManager;
