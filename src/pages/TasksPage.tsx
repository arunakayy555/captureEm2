import React, { useState } from 'react';
import {
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskSection, TaskImportance, TaskUrgency, TaskTag } from '../types';

export type GridCubicle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export function getTaskCubicle(task: Task): GridCubicle {
  const isNotImportant = task.importance === 'Not Important' || (task.tags && task.tags.includes('Not Important'));
  const isNotUrgent = task.urgency === 'Not Urgent' || (task.tags && task.tags.includes('Not Urgent'));

  if (!isNotImportant && !isNotUrgent) {
    return 'top-left'; // Important + Urgent
  } else if (isNotImportant && !isNotUrgent) {
    return 'top-right'; // Not Important + Urgent
  } else if (!isNotImportant && isNotUrgent) {
    return 'bottom-left'; // Important + Not Urgent
  } else {
    return 'bottom-right'; // Not Important + Not Urgent
  }
}

export const TasksPage: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    moveTaskSection,
    setTaskAsRightNow,
    startFocusWithTask,
  } = useApp();

  // View Mode: 'columns' (3-column NOW | NEXT | LATER) or 'matrix' (2x2 Eisenhower)
  const [viewMode, setViewMode] = useState<'columns' | 'matrix'>('columns');

  // Quick inline add form (Global)
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [targetSection, setTargetSection] = useState<TaskSection>('now');
  const [selectedImportance, setSelectedImportance] = useState<TaskImportance | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<TaskUrgency | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Column inline quick-add states
  const [addingToColumn, setAddingToColumn] = useState<TaskSection | null>(null);
  const [colTaskTitle, setColTaskTitle] = useState('');

  // Active / Completed filter toggle
  const [showCompleted, setShowCompleted] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags: TaskTag[] = [];
    if (selectedImportance) tags.push(selectedImportance);
    if (selectedUrgency) tags.push(selectedUrgency);

    addTask({
      title: title.trim(),
      note: note.trim() || undefined,
      section: targetSection,
      estimated_time: estimatedTime.trim() || undefined,
      deadline: deadline.trim() || undefined,
      importance: selectedImportance || undefined,
      urgency: selectedUrgency || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    setTitle('');
    setNote('');
    setSelectedImportance(null);
    setSelectedUrgency(null);
    setEstimatedTime('');
    setDeadline('');
    setIsAdding(false);
  };

  const handleUpdateTaskTags = (id: string, newImportance?: TaskImportance, newUrgency?: TaskUrgency) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isNotImp = task.importance === 'Not Important' || (task.tags && task.tags.includes('Not Important'));
    const isNotUrg = task.urgency === 'Not Urgent' || (task.tags && task.tags.includes('Not Urgent'));

    const currentImportance: TaskImportance =
      newImportance !== undefined ? newImportance : isNotImp ? 'Not Important' : 'Important';

    const currentUrgency: TaskUrgency =
      newUrgency !== undefined ? newUrgency : isNotUrg ? 'Not Urgent' : 'Urgent';

    const tags: TaskTag[] = [currentImportance, currentUrgency];

    updateTask(id, {
      importance: currentImportance,
      urgency: currentUrgency,
      tags,
    });
  };

  const handleAddColumnTask = (sec: TaskSection, e: React.FormEvent) => {
    e.preventDefault();
    if (!colTaskTitle.trim()) return;

    addTask({
      title: colTaskTitle.trim(),
      section: sec,
    });

    setColTaskTitle('');
    setAddingToColumn(null);
  };

  const getSectionTasks = (sec: TaskSection) =>
    tasks.filter((t) => t.section === sec && t.status === (showCompleted ? 'completed' : 'active'));

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight">
            things i got to do
          </h1>
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-light-muted dark:text-night-muted mt-1">
            "i remembered something. i'll put it here."
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle (Columns / 2x2 Grid) */}
          <div className="flex items-center bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('columns')}
              className={`p-1.5 rounded-lg transition-colors btn-clean ${
                viewMode === 'columns'
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
              title="3-column layout (NOW | NEXT | LATER)"
            >
              <Columns className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-lg transition-colors btn-clean ${
                viewMode === 'matrix'
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
              title="2×2 matrix view"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {completedCount > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors btn-clean ${
                showCompleted
                  ? 'bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage border-2 border-pastel-sage/50'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
            >
              {showCompleted ? 'view active' : `${completedCount} completed`}
            </button>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all shadow-sm btn-clean"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>add</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Global Add Task Card */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 space-y-4 shadow-sm animate-fadeIn max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-bold text-pastel-yellow-ink dark:text-pastel-yellow">
              new item
            </span>
            <div className="flex items-center gap-1.5">
              {(['now', 'next', 'later'] as TaskSection[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTargetSection(sec)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all btn-clean ${
                    targetSection === sec
                      ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/70 dark:border-night-border/70'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. edit photos, message someone, submit assignment..."
            autoFocus
            className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-base font-medium focus:outline-none focus:ring-1 focus:ring-pastel-yellow"
          />

          {/* Optional categorization tags */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-light-muted dark:text-night-muted">
                tags <span className="font-serif italic text-xs text-light-muted/70 dark:text-night-muted/70">(optional)</span>:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedImportance(selectedImportance === 'Important' ? null : 'Important')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all btn-clean ${
                  selectedImportance === 'Important'
                    ? 'bg-pastel-yellow text-night-bg font-bold shadow-xs border border-pastel-yellow'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                Important
              </button>
              <button
                type="button"
                onClick={() => setSelectedImportance(selectedImportance === 'Not Important' ? null : 'Not Important')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all btn-clean ${
                  selectedImportance === 'Not Important'
                    ? 'bg-pastel-lavender text-night-bg font-bold shadow-xs border border-pastel-lavender'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                Not Important
              </button>
              <span className="text-light-muted/40 dark:text-night-muted/40 text-xs px-1">·</span>
              <button
                type="button"
                onClick={() => setSelectedUrgency(selectedUrgency === 'Urgent' ? null : 'Urgent')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all btn-clean ${
                  selectedUrgency === 'Urgent'
                    ? 'bg-pastel-pink text-night-bg font-bold shadow-xs border border-pastel-pink'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                Urgent
              </button>
              <button
                type="button"
                onClick={() => setSelectedUrgency(selectedUrgency === 'Not Urgent' ? null : 'Not Urgent')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all btn-clean ${
                  selectedUrgency === 'Not Urgent'
                    ? 'bg-pastel-blue text-night-bg font-bold shadow-xs border border-pastel-blue'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                Not Urgent
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text transition-colors"
          >
            {showOptionalFields ? (
              <>
                <ChevronUp className="w-4 h-4 stroke-[2]" />
                <span>hide optional note and timing</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 stroke-[2]" />
                <span>add optional note, timing, or deadline</span>
              </>
            )}
          </button>

          {showOptionalFields && (
            <div className="space-y-3 pt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="optional note or details..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none focus:ring-1 focus:ring-pastel-yellow resize-none leading-relaxed"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="estimated time (e.g. 30 min)"
                  className="px-3.5 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="deadline (optional)"
                  className="px-3.5 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-light-border/60 dark:border-night-border/60">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 btn-clean shadow-xs"
            >
              save
            </button>
          </div>
        </form>
      )}

      {/* VIEW 1: THREE-COLUMN HORIZONTAL LAYOUT (NOW | NEXT | LATER) */}
      {viewMode === 'columns' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* COLUMN 1: NOW */}
          <TaskColumn
            section="now"
            subtitle="handle soon"
            accentColor="text-pastel-yellow-ink dark:text-pastel-yellow"
            badgeBg="bg-pastel-yellow/30 dark:bg-pastel-yellow/20 text-pastel-yellow-ink dark:text-pastel-yellow"
            borderColor="border-pastel-yellow/60"
            tasks={getSectionTasks('now')}
            onToggleCompleted={toggleTaskCompleted}
            onDelete={deleteTask}
            onMoveSection={moveTaskSection}
            onSetRightNow={setTaskAsRightNow}
            onStartFocus={startFocusWithTask}
            onUpdateTags={handleUpdateTaskTags}
            isAddingToColumn={addingToColumn === 'now'}
            setIsAddingToColumn={(val) => setAddingToColumn(val ? 'now' : null)}
            colTaskTitle={colTaskTitle}
            setColTaskTitle={setColTaskTitle}
            onAddColumnSubmit={(e) => handleAddColumnTask('now', e)}
          />

          {/* COLUMN 2: NEXT */}
          <TaskColumn
            section="next"
            subtitle="coming up"
            accentColor="text-pastel-blue-ink dark:text-pastel-blue"
            badgeBg="bg-pastel-blue/30 dark:bg-pastel-blue/20 text-pastel-blue-ink dark:text-pastel-blue"
            borderColor="border-pastel-blue/60"
            tasks={getSectionTasks('next')}
            onToggleCompleted={toggleTaskCompleted}
            onDelete={deleteTask}
            onMoveSection={moveTaskSection}
            onSetRightNow={setTaskAsRightNow}
            onStartFocus={startFocusWithTask}
            onUpdateTags={handleUpdateTaskTags}
            isAddingToColumn={addingToColumn === 'next'}
            setIsAddingToColumn={(val) => setAddingToColumn(val ? 'next' : null)}
            colTaskTitle={colTaskTitle}
            setColTaskTitle={setColTaskTitle}
            onAddColumnSubmit={(e) => handleAddColumnTask('next', e)}
          />

          {/* COLUMN 3: LATER */}
          <TaskColumn
            section="later"
            subtitle="to return to"
            accentColor="text-pastel-lavender-ink dark:text-pastel-lavender"
            badgeBg="bg-pastel-lavender/30 dark:bg-pastel-lavender/20 text-pastel-lavender-ink dark:text-pastel-lavender"
            borderColor="border-pastel-lavender/60"
            tasks={getSectionTasks('later')}
            onToggleCompleted={toggleTaskCompleted}
            onDelete={deleteTask}
            onMoveSection={moveTaskSection}
            onSetRightNow={setTaskAsRightNow}
            onStartFocus={startFocusWithTask}
            onUpdateTags={handleUpdateTaskTags}
            isAddingToColumn={addingToColumn === 'later'}
            setIsAddingToColumn={(val) => setAddingToColumn(val ? 'later' : null)}
            colTaskTitle={colTaskTitle}
            setColTaskTitle={setColTaskTitle}
            onAddColumnSubmit={(e) => handleAddColumnTask('later', e)}
          />
        </div>
      ) : (
        /* VIEW 2: 2×2 SPACIOUS FOUR-QUADRANT MATRIX */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b-2 border-light-border/60 dark:border-night-border/60 gap-2">
            <span className="text-sm uppercase tracking-widest font-bold text-light-muted dark:text-night-muted">
              2×2 matrix · clarity view
            </span>
            <div className="flex items-center gap-3 text-sm sm:text-base font-serif italic text-light-muted dark:text-night-muted">
              <span>columns: <strong className="not-italic font-sans font-semibold text-light-text dark:text-night-text">important | not important</strong></span>
              <span>·</span>
              <span>rows: <strong className="not-italic font-sans font-semibold text-light-text dark:text-night-text">urgent | not urgent</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top-Left: Important + Urgent */}
            <div className="p-5 rounded-3xl bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-night-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-yellow-ink dark:bg-pastel-yellow" />
                  <span className="text-sm sm:text-base uppercase tracking-wider font-bold text-pastel-yellow-ink dark:text-pastel-yellow">
                    important · urgent
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pastel-yellow/30 dark:bg-pastel-yellow/20 text-pastel-yellow-ink dark:text-pastel-yellow">
                  {tasks.filter((t) => getTaskCubicle(t) === 'top-left' && t.status === (showCompleted ? 'completed' : 'active')).length}
                </span>
              </div>
              <QuadrantTaskList
                tasks={tasks.filter((t) => getTaskCubicle(t) === 'top-left' && t.status === (showCompleted ? 'completed' : 'active'))}
                onToggleCompleted={toggleTaskCompleted}
                onDelete={deleteTask}
                onStartFocus={startFocusWithTask}
                onSetRightNow={setTaskAsRightNow}
                onUpdateTags={handleUpdateTaskTags}
              />
            </div>

            {/* Top-Right: Not Important + Urgent */}
            <div className="p-5 rounded-3xl bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-night-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-lavender-ink dark:bg-pastel-lavender" />
                  <span className="text-sm sm:text-base uppercase tracking-wider font-bold text-pastel-lavender-ink dark:text-pastel-lavender">
                    not important · urgent
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pastel-lavender/30 dark:bg-pastel-lavender/20 text-pastel-lavender-ink dark:text-pastel-lavender">
                  {tasks.filter((t) => getTaskCubicle(t) === 'top-right' && t.status === (showCompleted ? 'completed' : 'active')).length}
                </span>
              </div>
              <QuadrantTaskList
                tasks={tasks.filter((t) => getTaskCubicle(t) === 'top-right' && t.status === (showCompleted ? 'completed' : 'active'))}
                onToggleCompleted={toggleTaskCompleted}
                onDelete={deleteTask}
                onStartFocus={startFocusWithTask}
                onSetRightNow={setTaskAsRightNow}
                onUpdateTags={handleUpdateTaskTags}
              />
            </div>

            {/* Bottom-Left: Important + Not Urgent */}
            <div className="p-5 rounded-3xl bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-night-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-blue-ink dark:bg-pastel-blue" />
                  <span className="text-sm sm:text-base uppercase tracking-wider font-bold text-pastel-blue-ink dark:text-pastel-blue">
                    important · not urgent
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pastel-blue/30 dark:bg-pastel-blue/20 text-pastel-blue-ink dark:text-pastel-blue">
                  {tasks.filter((t) => getTaskCubicle(t) === 'bottom-left' && t.status === (showCompleted ? 'completed' : 'active')).length}
                </span>
              </div>
              <QuadrantTaskList
                tasks={tasks.filter((t) => getTaskCubicle(t) === 'bottom-left' && t.status === (showCompleted ? 'completed' : 'active'))}
                onToggleCompleted={toggleTaskCompleted}
                onDelete={deleteTask}
                onStartFocus={startFocusWithTask}
                onSetRightNow={setTaskAsRightNow}
                onUpdateTags={handleUpdateTaskTags}
              />
            </div>

            {/* Bottom-Right: Not Important + Not Urgent */}
            <div className="p-5 rounded-3xl bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-night-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-sage-ink dark:bg-pastel-sage" />
                  <span className="text-sm sm:text-base uppercase tracking-wider font-bold text-pastel-sage-ink dark:text-pastel-sage">
                    not important · not urgent
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pastel-sage/30 dark:bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage">
                  {tasks.filter((t) => getTaskCubicle(t) === 'bottom-right' && t.status === (showCompleted ? 'completed' : 'active')).length}
                </span>
              </div>
              <QuadrantTaskList
                tasks={tasks.filter((t) => getTaskCubicle(t) === 'bottom-right' && t.status === (showCompleted ? 'completed' : 'active'))}
                onToggleCompleted={toggleTaskCompleted}
                onDelete={deleteTask}
                onStartFocus={startFocusWithTask}
                onSetRightNow={setTaskAsRightNow}
                onUpdateTags={handleUpdateTaskTags}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskColumnProps {
  section: TaskSection;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  tasks: Task[];
  onToggleCompleted: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveSection: (id: string, section: TaskSection) => void;
  onSetRightNow: (id: string) => void;
  onStartFocus: (title: string, duration?: number, taskId?: string, projectId?: string) => void;
  onUpdateTags: (id: string, newImportance?: TaskImportance, newUrgency?: TaskUrgency) => void;
  isAddingToColumn: boolean;
  setIsAddingToColumn: (val: boolean) => void;
  colTaskTitle: string;
  setColTaskTitle: (val: string) => void;
  onAddColumnSubmit: (e: React.FormEvent) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  section,
  subtitle,
  accentColor,
  badgeBg,
  tasks,
  onToggleCompleted,
  onDelete,
  onMoveSection,
  onSetRightNow,
  onStartFocus,
  onUpdateTags,
  isAddingToColumn,
  setIsAddingToColumn,
  colTaskTitle,
  setColTaskTitle,
  onAddColumnSubmit,
}) => {
  return (
    <div className="flex flex-col bg-light-surface/60 dark:bg-night-surface/60 border-2 border-light-border/80 dark:border-night-border/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs min-h-[480px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-light-border/70 dark:border-night-border/70">
        <div className="flex items-center gap-2">
          <h2 className={`text-base sm:text-lg uppercase tracking-wider font-bold ${accentColor}`}>
            {section}
          </h2>
          <span className="text-sm sm:text-base text-light-muted dark:text-night-muted font-serif italic">
            · {subtitle}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${badgeBg} ${accentColor}`}>
          {tasks.length}
        </span>
      </div>

      {/* Simple Inline Column Add Task */}
      {isAddingToColumn ? (
        <form onSubmit={onAddColumnSubmit} className="space-y-2 bg-light-bg dark:bg-night-elevated p-3 rounded-2xl border-2 border-light-border dark:border-night-border animate-fadeIn">
          <input
            type="text"
            value={colTaskTitle}
            onChange={(e) => setColTaskTitle(e.target.value)}
            placeholder={`add task to ${section}...`}
            autoFocus
            className="w-full px-3 py-1.5 bg-transparent text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-light-border/50 dark:border-night-border/50">
            <button
              type="button"
              onClick={() => {
                setIsAddingToColumn(false);
                setColTaskTitle('');
              }}
              className="px-2.5 py-1 text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!colTaskTitle.trim()}
              className="px-3 py-1 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-lg text-xs font-semibold disabled:opacity-40 btn-clean shadow-xs"
            >
              save
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingToColumn(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated border border-dashed border-light-border dark:border-night-border transition-all btn-clean"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2]" />
          <span>add to {section}</span>
        </button>
      )}

      {/* Task Cards List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isNotImportant = task.importance === 'Not Important' || (task.tags && task.tags.includes('Not Important'));
            const isNotUrgent = task.urgency === 'Not Urgent' || (task.tags && task.tags.includes('Not Urgent'));
            const currentImportance: TaskImportance = isNotImportant ? 'Not Important' : 'Important';
            const currentUrgency: TaskUrgency = isNotUrgent ? 'Not Urgent' : 'Urgent';

            return (
              <div
                key={task.id}
                className={`group p-3.5 sm:p-4 rounded-2xl bg-light-surface dark:bg-night-surface border-2 transition-all duration-200 ${
                  task.is_right_now
                    ? 'border-pastel-yellow shadow-xs'
                    : 'border-light-border dark:border-night-border hover:border-light-border dark:hover:border-night-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleCompleted(task.id)}
                      className="mt-0.5 shrink-0 text-light-muted dark:text-night-muted hover:text-pastel-sage transition-colors"
                      title={isCompleted ? 'Mark active' : 'Mark complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-pastel-sage stroke-[2.2]" />
                      ) : (
                        <Circle className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-sm sm:text-base font-medium leading-snug ${
                            isCompleted
                              ? 'line-through text-light-muted dark:text-night-muted'
                              : 'text-light-text dark:text-night-text'
                          }`}
                        >
                          {task.title}
                        </span>

                        {task.is_right_now && !isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-pastel-yellow/20 text-light-text dark:text-pastel-yellow font-bold border border-pastel-yellow/40">
                            right now
                          </span>
                        )}
                      </div>

                      {task.note && (
                        <p className="text-xs text-light-muted dark:text-night-muted mt-1 leading-relaxed font-normal">
                          {task.note}
                        </p>
                      )}

                      {/* Tag badges */}
                      {(task.tags || task.importance || task.urgency) && !isCompleted && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateTags(
                                task.id,
                                currentImportance === 'Important' ? 'Not Important' : 'Important',
                                undefined
                              )
                            }
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all btn-clean ${
                              currentImportance === 'Important'
                                ? 'bg-pastel-yellow/25 text-pastel-yellow-ink dark:text-pastel-yellow border border-pastel-yellow/40'
                                : 'bg-pastel-lavender/25 text-pastel-lavender-ink dark:text-pastel-lavender border border-pastel-lavender/40'
                            }`}
                            title="Click to toggle importance"
                          >
                            {currentImportance}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateTags(
                                task.id,
                                undefined,
                                currentUrgency === 'Urgent' ? 'Not Urgent' : 'Urgent'
                              )
                            }
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all btn-clean ${
                              currentUrgency === 'Urgent'
                                ? 'bg-pastel-pink/25 text-pastel-pink-ink dark:text-pastel-pink border border-pastel-pink/40'
                                : 'bg-pastel-blue/25 text-pastel-blue-ink dark:text-pastel-blue border border-pastel-blue/40'
                            }`}
                            title="Click to toggle urgency"
                          >
                            {currentUrgency}
                          </button>
                        </div>
                      )}

                      {(task.estimated_time || task.deadline) && (
                        <div className="flex items-center gap-2.5 mt-2 text-[11px] text-light-muted dark:text-night-muted font-medium">
                          {task.estimated_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 stroke-[2]" />
                              {task.estimated_time}
                            </span>
                          )}
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 stroke-[2]" />
                              {task.deadline}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Start Focus, Move Section, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => onStartFocus(task.title, 45, task.id, task.project_id)}
                        className="p-1 rounded-lg text-light-muted dark:text-night-muted hover:text-pastel-yellow hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
                        title="Focus on this"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1 rounded-lg text-light-muted dark:text-night-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* Section Movement Buttons */}
                {!isCompleted && (
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-light-border/60 dark:border-night-border/60">
                    {!task.is_right_now && (
                      <button
                        onClick={() => onSetRightNow(task.id)}
                        className="text-[10px] font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:underline transition-all"
                        title="Set as Right Now on Home"
                      >
                        make right now
                      </button>
                    )}
                    <div className="flex items-center gap-1 ml-auto text-[10px]">
                      {(['now', 'next', 'later'] as TaskSection[])
                        .filter((s) => s !== section)
                        .map((target) => (
                          <button
                            key={target}
                            onClick={() => onMoveSection(task.id, target)}
                            className="px-1.5 py-0.5 rounded bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text border border-light-border/60 dark:border-night-border/60 transition-all btn-clean font-medium"
                            title={`Move to ${target}`}
                          >
                            → {target}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 px-3 text-center border-2 border-dashed border-light-border/60 dark:border-night-border/60 rounded-2xl">
            <p className="text-xs font-serif italic text-light-muted dark:text-night-muted leading-relaxed">
              {section === 'now' && 'no tasks in now · add what you are focusing on right now.'}
              {section === 'next' && 'no tasks in next · queue upcoming tasks here.'}
              {section === 'later' && 'no tasks in later · save ideas & tasks to return to.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface QuadrantTaskListProps {
  tasks: Task[];
  onToggleCompleted: (id: string) => void;
  onDelete: (id: string) => void;
  onStartFocus: (title: string, duration?: number, taskId?: string, projectId?: string) => void;
  onSetRightNow: (id: string) => void;
  onUpdateTags: (id: string, newImportance?: TaskImportance, newUrgency?: TaskUrgency) => void;
}

const QuadrantTaskList: React.FC<QuadrantTaskListProps> = ({
  tasks,
  onToggleCompleted,
  onDelete,
  onStartFocus,
  onSetRightNow,
  onUpdateTags,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="py-6 px-3 text-center border-2 border-dashed border-light-border/50 dark:border-night-border/50 rounded-2xl">
        <p className="text-xs font-serif italic text-light-muted/70 dark:text-night-muted/70">
          no tasks in this quadrant
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => {
        const isCompleted = task.status === 'completed';
        const isNotImportant = task.importance === 'Not Important' || (task.tags && task.tags.includes('Not Important'));
        const isNotUrgent = task.urgency === 'Not Urgent' || (task.tags && task.tags.includes('Not Urgent'));
        const currentImportance: TaskImportance = isNotImportant ? 'Not Important' : 'Important';
        const currentUrgency: TaskUrgency = isNotUrgent ? 'Not Urgent' : 'Urgent';

        return (
          <div
            key={task.id}
            className="group p-3.5 rounded-2xl bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border space-y-2.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleCompleted(task.id)}
                  className="mt-0.5 shrink-0 text-light-muted dark:text-night-muted hover:text-pastel-sage transition-colors"
                  title={isCompleted ? 'Mark active' : 'Mark complete'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-pastel-sage stroke-[2.2]" />
                  ) : (
                    <Circle className="w-4 h-4 stroke-[2]" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs sm:text-sm block font-medium leading-snug ${
                      isCompleted
                        ? 'line-through text-light-muted dark:text-night-muted'
                        : 'text-light-text dark:text-night-text'
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.note && (
                    <p className="text-[11px] text-light-muted dark:text-night-muted mt-0.5 leading-relaxed truncate">
                      {task.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {!isCompleted && (
                  <>
                    <button
                      onClick={() => onSetRightNow(task.id)}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-light-surface dark:bg-night-surface text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
                      title="Make right now"
                    >
                      now
                    </button>
                    <button
                      onClick={() => onStartFocus(task.title, 30, task.id, task.project_id)}
                      className="p-1 rounded-lg text-light-muted dark:text-night-muted hover:text-pastel-yellow btn-clean"
                      title="Focus"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 rounded-lg text-light-muted dark:text-night-muted hover:text-red-400 btn-clean"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Editable Tags Pills */}
            {!isCompleted && (
              <div className="flex items-center justify-between pt-2 border-t border-light-border/50 dark:border-night-border/50">
                <span className="text-[10px] font-serif italic text-light-muted dark:text-night-muted">
                  tags (click to switch):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTags(
                        task.id,
                        currentImportance === 'Important' ? 'Not Important' : 'Important',
                        undefined
                      )
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all btn-clean ${
                      currentImportance === 'Important'
                        ? 'bg-pastel-yellow/25 text-pastel-yellow-ink dark:text-pastel-yellow border border-pastel-yellow/40 hover:opacity-80'
                        : 'bg-pastel-lavender/25 text-pastel-lavender-ink dark:text-pastel-lavender border border-pastel-lavender/40 hover:opacity-80'
                    }`}
                    title="Click to switch importance"
                  >
                    {currentImportance}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTags(
                        task.id,
                        undefined,
                        currentUrgency === 'Urgent' ? 'Not Urgent' : 'Urgent'
                      )
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all btn-clean ${
                      currentUrgency === 'Urgent'
                        ? 'bg-pastel-pink/25 text-pastel-pink-ink dark:text-pastel-pink border border-pastel-pink/40 hover:opacity-80'
                        : 'bg-pastel-blue/25 text-pastel-blue-ink dark:text-pastel-blue border border-pastel-blue/40 hover:opacity-80'
                    }`}
                    title="Click to switch urgency"
                  >
                    {currentUrgency}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
