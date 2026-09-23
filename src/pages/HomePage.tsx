import React from 'react';
import {
  Play,
  ArrowRight,
  Sparkles,
  Circle,
  Plus,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentFormattedDate } from '../utils/date';

export const HomePage: React.FC = () => {
  const {
    rightNowTask,
    nextTasks,
    tasks,
    todayCompletedTasksCount,
    forFunItems,
    setPage,
    startFocusWithTask,
    setTaskAsRightNow,
    toggleTaskCompleted,
    setIsResetOpen,
    setIsQuickAddOpen,
  } = useApp();

  const today = getCurrentFormattedDate();

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 17) return 'good afternoon';
    return 'good evening';
  };

  const activeTasksCount = tasks.filter((t) => t.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10 animate-fadeIn">
      {/* Top Greeting Header with current date & glitter ✦ */}
      <section className="space-y-2 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
          <h1 className="font-serif italic font-semibold text-5xl sm:text-6xl text-light-text dark:text-night-text tracking-tight flex items-center gap-3">
            <span>{getGreeting()}</span>
            <span className="text-pastel-yellow-ink dark:text-pastel-yellow not-italic inline-block text-4xl sm:text-5xl animate-soft-pulse">✦</span>
          </h1>
          <span className="font-serif italic text-base sm:text-lg text-light-muted dark:text-night-muted">
            {today.dayName}, {today.dateStr}
          </span>
        </div>
        <p className="font-serif italic font-medium text-2xl sm:text-3xl text-light-muted dark:text-night-muted">
          what are we doing today?
        </p>
      </section>

      {/* Main Responsive Grid: 2 Columns on Desktop (7/5 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Right Now Focus Hero + Next Up Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* SECTION 1: RIGHT NOW (Primary Dominant Section) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg uppercase tracking-widest font-bold text-pastel-yellow-ink dark:text-pastel-yellow">
                right now
              </h2>
              <span className="text-base sm:text-lg font-serif italic text-light-muted dark:text-night-muted">
                one thing at a time
              </span>
            </div>

            {rightNowTask ? (
              <div className="group relative bg-light-surface dark:bg-night-surface border-2 border-pastel-yellow/80 dark:border-pastel-yellow/60 rounded-3xl p-6 sm:p-9 shadow-md hover:shadow-lg transition-all duration-300">
                {/* Top decorative accent glow */}
                <div className="absolute top-0 left-10 right-10 h-[3px] bg-gradient-to-r from-transparent via-pastel-yellow to-transparent" />

                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-pastel-yellow/30 dark:bg-pastel-yellow/20 text-light-text dark:text-pastel-yellow font-bold mb-3 border border-pastel-yellow/50">
                      current focus
                    </span>
                    <h3 className="font-serif italic font-semibold text-3xl sm:text-4xl md:text-5xl text-light-text dark:text-night-text leading-snug">
                      {rightNowTask.title}
                    </h3>
                    {rightNowTask.note && (
                      <p className="text-base sm:text-lg text-light-muted dark:text-night-muted mt-3 leading-relaxed font-normal">
                        {rightNowTask.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t-2 border-light-border/80 dark:border-night-border/80">
                    <div className="flex items-center gap-2 text-sm font-medium text-light-muted dark:text-night-muted">
                      <Clock className="w-4 h-4 stroke-[2]" />
                      <span>{rightNowTask.estimated_time || '45 min'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompleted(rightNowTask.id)}
                        className="p-2.5 rounded-xl text-light-muted dark:text-night-muted hover:text-pastel-sage hover:bg-light-bg dark:hover:bg-night-elevated border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
                        title="Mark done"
                      >
                        <Circle className="w-6 h-6 stroke-[2]" />
                      </button>
                      <button
                        onClick={() => startFocusWithTask(rightNowTask.title, 45, rightNowTask.id, rightNowTask.project_id)}
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-sm sm:text-base font-semibold hover:opacity-90 transition-all shadow-md btn-clean"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>start focus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-light-surface dark:bg-night-surface border-2 border-dashed border-light-border dark:border-night-border rounded-3xl p-8 text-center space-y-3">
                <p className="font-serif italic text-xl text-light-muted dark:text-night-muted">
                  nothing chosen right now. what would you like to begin with?
                </p>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-light-bg dark:bg-night-elevated text-sm font-medium text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-yellow/80 transition-colors btn-clean"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>choose or add a focus</span>
                </button>
              </div>
            )}
          </section>

          {/* SECTION 2: NEXT (Secondary Section) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b-2 border-light-border/60 dark:border-night-border/60">
              <h2 className="text-sm sm:text-base uppercase tracking-widest font-bold text-pastel-blue-ink dark:text-pastel-blue">
                next
              </h2>
              <span className="text-sm sm:text-base font-serif italic text-light-muted dark:text-night-muted">
                coming up
              </span>
            </div>

            {nextTasks.length > 0 ? (
              <div className="space-y-2.5">
                {nextTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-light-surface/85 dark:bg-night-surface/85 border-2 border-light-border/70 dark:border-night-border/70 hover:border-light-border dark:hover:border-night-border transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="shrink-0 text-light-muted dark:text-night-muted hover:text-pastel-sage-ink dark:hover:text-pastel-sage transition-colors"
                      >
                        <Circle className="w-5 h-5 stroke-[2]" />
                      </button>
                      <div className="min-w-0">
                        <span className="text-base font-medium text-light-text dark:text-night-text block truncate">
                          {task.title}
                        </span>
                        {task.estimated_time && (
                          <span className="text-xs text-light-muted dark:text-night-muted font-normal">
                            {task.estimated_time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setTaskAsRightNow(task.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated border border-transparent hover:border-light-border dark:hover:border-night-border transition-all btn-clean"
                      >
                        make right now
                      </button>
                      <button
                        onClick={() => startFocusWithTask(task.title, 30, task.id, task.project_id)}
                        className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-pastel-yellow-ink dark:hover:text-pastel-yellow hover:bg-light-bg dark:hover:bg-night-elevated border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
                        title="Focus now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-serif italic text-light-muted dark:text-night-muted pl-1">
                nothing queued next · your day is calm.
              </p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Tasks Summary + For Fun + Workspace Reset (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* SECTION 3: THINGS I GOT TO DO (Summary Box) */}
          <section className="p-5 sm:p-6 rounded-3xl bg-light-surface/75 dark:bg-night-surface/75 border-2 border-light-border/70 dark:border-night-border/70 flex items-center justify-between shadow-xs">
            <div>
              <h2 className="text-sm sm:text-base uppercase tracking-widest font-bold text-pastel-sage-ink dark:text-pastel-sage mb-1">
                things i got to do
              </h2>
              <p className="font-serif italic font-semibold text-xl sm:text-2xl text-light-text dark:text-night-text">
                {activeTasksCount} {activeTasksCount === 1 ? 'task' : 'tasks'} active
                {todayCompletedTasksCount > 0 && (
                  <span className="text-pastel-sage-ink dark:text-pastel-sage font-normal text-base sm:text-lg block sm:inline sm:ml-2">
                    · {todayCompletedTasksCount} completed today
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => setPage('tasks')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-light-bg dark:bg-night-elevated text-xs sm:text-sm font-semibold text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-sage transition-all btn-clean shrink-0"
            >
              <span>view all</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </section>

          {/* SECTION 4: FOR FUN */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b-2 border-light-border/60 dark:border-night-border/60">
              <h2 className="text-sm sm:text-base uppercase tracking-widest font-bold text-pastel-pink-ink dark:text-pastel-pink">
                for fun
              </h2>
              <button
                onClick={() => setPage('for_fun')}
                className="text-sm sm:text-base font-serif italic font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text transition-colors flex items-center gap-1"
              >
                <span>more</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>

            {forFunItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {forFunItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 sm:p-5 rounded-2xl bg-light-surface/75 dark:bg-night-surface/75 border-2 border-light-border/70 dark:border-night-border/70 hover:border-pastel-pink/70 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="font-serif italic font-semibold text-xl sm:text-2xl text-light-text dark:text-night-text truncate">
                        {item.title}
                      </h4>
                      {item.duration && (
                        <span className="text-xs text-light-muted dark:text-night-muted font-normal">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => startFocusWithTask(item.title, 30)}
                      className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-pastel-pink-ink dark:hover:text-pastel-pink hover:bg-light-bg dark:hover:bg-night-elevated border border-transparent hover:border-light-border dark:border-night-border transition-colors btn-clean shrink-0"
                      title="Enjoy now"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-serif italic text-light-muted dark:text-night-muted pl-1">
                no activities added yet · add something you love doing for fun.
              </p>
            )}
          </section>

          {/* SECTION 5: WORKSPACE RESET (Shortcut) */}
          <section className="p-5 sm:p-6 rounded-3xl bg-light-surface/50 dark:bg-night-surface/50 border-2 border-dashed border-light-border/80 dark:border-night-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
                <h3 className="font-serif italic font-semibold text-xl sm:text-2xl text-light-text dark:text-night-text">
                  reset workspace
                </h3>
              </div>
              <p className="text-sm sm:text-base font-serif italic text-light-muted dark:text-night-muted">
                take 2 minutes to clear your desk and prepare your mind
              </p>
            </div>

            <button
              onClick={() => setIsResetOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-light-bg dark:bg-night-elevated text-xs sm:text-sm font-semibold text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-yellow transition-colors btn-clean shrink-0"
            >
              <span>begin reset</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
