import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  CheckCircle2,
  BookOpen,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatFocusDuration,
  toDateKey,
  formatReadableDate,
} from '../utils/date';
import { WeekReview } from '../types';

export const ReviewPage: React.FC = () => {
  const { reviews, saveReview, focusSessions, tasks, projects } = useApp();

  const todayKey = toDateKey(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Calendar month/year navigation state
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // Reflection form state for the selected date
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [made, setMade] = useState('');
  const [learned, setLearned] = useState('');
  const [forFun, setForFun] = useState('');
  const [nextFocus, setNextFocus] = useState('');

  // Find reflection matching the selected date
  const selectedDateReview: WeekReview | undefined = reviews.find(
    (r) => toDateKey(r.date) === selectedDateKey
  );

  // Sync form inputs whenever selectedDateKey or reviews change
  useEffect(() => {
    if (selectedDateReview) {
      setMade(selectedDateReview.made || '');
      setLearned(selectedDateReview.learned || '');
      setForFun(selectedDateReview.for_fun || '');
      setNextFocus(selectedDateReview.next_focus || '');
      setIsEditingReflection(false);
    } else {
      setMade('');
      setLearned('');
      setForFun('');
      setNextFocus('');
      setIsEditingReflection(false);
    }
  }, [selectedDateKey, selectedDateReview?.id]);

  // Historical data for selected date
  const daySessions = focusSessions.filter(
    (s) => toDateKey(s.date || s.created_at) === selectedDateKey
  );
  const dayFocusSeconds = daySessions.reduce((acc, s) => {
    if (typeof s.duration_seconds === 'number' && s.duration_seconds > 0) {
      return acc + s.duration_seconds;
    }
    return acc + (s.duration || 0) * 60;
  }, 0);

  const dayCompletedTasks = tasks.filter(
    (t) => t.status === 'completed' && t.completed_at && toDateKey(t.completed_at) === selectedDateKey
  );

  const hasReflection = Boolean(
    selectedDateReview &&
      (selectedDateReview.made?.trim() ||
        selectedDateReview.learned?.trim() ||
        selectedDateReview.for_fun?.trim() ||
        selectedDateReview.next_focus?.trim())
  );

  const hasHistory = hasReflection || dayFocusSeconds > 0 || dayCompletedTasks.length > 0;

  // Set of date keys that have reflections (from Supabase stored reviews)
  const datesWithReflections = new Set(
    reviews
      .filter((r) => r.made?.trim() || r.learned?.trim() || r.for_fun?.trim() || r.next_focus?.trim())
      .map((r) => toDateKey(r.date))
  );

  // Calendar generation helpers
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is index 0
  const startOffset = (firstDayIndex + 6) % 7;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleTodayJump = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDateKey(todayKey);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the ISO timestamp for the selected date
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);

    const totalFocusHours = Math.round((dayFocusSeconds / 3600) * 10) / 10;

    saveReview({
      id: selectedDateReview?.id || 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      week: `Week of ${formatReadableDate(selectedDateKey)}`,
      date: dateObj.toISOString(),
      made: made.trim(),
      learned: learned.trim(),
      for_fun: forFun.trim(),
      next_focus: nextFocus.trim(),
      completed: {
        focusSessions: daySessions.length,
        focusHours: totalFocusHours,
        tasksCount: dayCompletedTasks.length,
        projectsCount: projects.filter((p) => p.status === 'active').length,
      },
    });

    setIsEditingReflection(false);
  };

  const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight">
            so far
          </h1>
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-light-muted dark:text-night-muted mt-1">
            a calm view of your days, reflections, and focus history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / TOP: CLEAN MINIMAL CALENDAR */}
        <div className="lg:col-span-6 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          {/* Calendar Header: Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-light-border/70 dark:border-night-border/70">
            <h2 className="font-serif italic font-semibold text-2xl text-light-text dark:text-night-text capitalize">
              {monthName}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTodayJump}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border transition-colors btn-clean"
              >
                today
              </button>
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK_DAYS.map((w) => (
              <span
                key={w}
                className="text-[11px] font-sans uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Empty slots for month start offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-11" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = String(dayNum).padStart(2, '0');
              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

              const isSelected = dateKey === selectedDateKey;
              const isToday = dateKey === todayKey;
              const hasReflectionLogged = datesWithReflections.has(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={`h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center relative btn-clean ${
                    isSelected
                      ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-bold shadow-sm ring-2 ring-light-text dark:ring-night-text'
                      : hasReflectionLogged
                      ? 'bg-pastel-lavender/35 dark:bg-pastel-lavender/25 text-light-text dark:text-night-text border border-pastel-lavender/60 hover:bg-pastel-lavender/50'
                      : isToday
                      ? 'bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text font-bold border-2 border-pastel-yellow/80 hover:border-pastel-yellow'
                      : 'bg-light-bg/40 dark:bg-night-elevated/40 text-light-text dark:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated border border-transparent hover:border-light-border dark:hover:border-night-border'
                  }`}
                >
                  <span>{dayNum}</span>
                </button>
              );
            })}
          </div>

          {/* Subtle Aesthetic Legend */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-light-muted dark:text-night-muted border-t border-light-border/60 dark:border-night-border/60 font-serif italic">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pastel-lavender/60 border border-pastel-lavender" />
              <span>reflection logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-pastel-yellow" />
              <span>today</span>
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: SELECTED DATE DETAILS PANEL */}
        <div className="lg:col-span-6 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm min-h-[440px]">
          {/* Selected Date Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-light-border/70 dark:border-night-border/70">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold text-pastel-lavender-ink dark:text-pastel-lavender block">
                {selectedDateKey === todayKey ? 'today' : 'selected day'}
              </span>
              <h2 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text mt-0.5">
                {formatReadableDate(selectedDateKey)}
              </h2>
            </div>

            {!isEditingReflection && hasReflection && (
              <button
                onClick={() => setIsEditingReflection(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border transition-colors btn-clean"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                <span>edit</span>
              </button>
            )}
          </div>

          {/* Historical Details when NOT editing */}
          {!isEditingReflection ? (
            hasHistory ? (
              <div className="space-y-5 animate-fadeIn">
                {/* 1. REFLECTION SECTION (If exists) */}
                {hasReflection && (
                  <div className="space-y-3 p-4 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border-2 border-light-border/60 dark:border-night-border/60">
                    <div className="flex items-center gap-2 text-pastel-mauve-ink dark:text-pastel-mauve">
                      <BookOpen className="w-4 h-4 stroke-[2]" />
                      <span className="text-xs uppercase tracking-wider font-bold">
                        reflection
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1 text-xs sm:text-sm">
                      {selectedDateReview?.made && (
                        <div>
                          <span className="font-semibold text-light-muted dark:text-night-muted block text-[11px] uppercase tracking-wider">
                            made:
                          </span>
                          <p className="text-light-text dark:text-night-text font-serif italic mt-0.5 leading-relaxed">
                            {selectedDateReview.made}
                          </p>
                        </div>
                      )}

                      {selectedDateReview?.learned && (
                        <div>
                          <span className="font-semibold text-light-muted dark:text-night-muted block text-[11px] uppercase tracking-wider">
                            learned:
                          </span>
                          <p className="text-light-text dark:text-night-text font-serif italic mt-0.5 leading-relaxed">
                            {selectedDateReview.learned}
                          </p>
                        </div>
                      )}

                      {selectedDateReview?.for_fun && (
                        <div>
                          <span className="font-semibold text-light-muted dark:text-night-muted block text-[11px] uppercase tracking-wider">
                            for fun:
                          </span>
                          <p className="text-light-text dark:text-night-text font-serif italic mt-0.5 leading-relaxed">
                            {selectedDateReview.for_fun}
                          </p>
                        </div>
                      )}

                      {selectedDateReview?.next_focus && (
                        <div>
                          <span className="font-semibold text-light-muted dark:text-night-muted block text-[11px] uppercase tracking-wider">
                            next focus:
                          </span>
                          <p className="text-light-text dark:text-night-text font-serif italic mt-0.5 leading-relaxed">
                            {selectedDateReview.next_focus}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. FOCUS DURATION (If focus sessions exist on that day) */}
                {dayFocusSeconds > 0 && (
                  <div className="p-4 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border-2 border-light-border/60 dark:border-night-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
                      <span className="text-xs uppercase tracking-wider font-bold text-light-muted dark:text-night-muted">
                        focus time
                      </span>
                    </div>
                    <span className="font-serif italic font-semibold text-xl text-light-text dark:text-night-text">
                      {formatFocusDuration(dayFocusSeconds)}
                    </span>
                  </div>
                )}

                {/* 3. COMPLETED TASKS (If tasks were completed on that day) */}
                {dayCompletedTasks.length > 0 && (
                  <div className="p-4 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border-2 border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-pastel-sage-ink dark:text-pastel-sage stroke-[2]" />
                        <span className="text-xs uppercase tracking-wider font-bold text-light-muted dark:text-night-muted">
                          completed tasks
                        </span>
                      </div>
                      <span className="font-serif italic font-semibold text-lg text-light-text dark:text-night-text">
                        {dayCompletedTasks.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {dayCompletedTasks.map((t) => (
                        <div
                          key={t.id}
                          className="text-xs text-light-text/90 dark:text-night-text/90 flex items-center gap-2 pl-1"
                        >
                          <span className="text-pastel-sage font-bold">✓</span>
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hasReflection && (
                  <div className="pt-2">
                    <button
                      onClick={() => setIsEditingReflection(true)}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-light-border dark:border-night-border text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-all btn-clean"
                    >
                      + write reflection for this day
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* NO HISTORY STATE */
              <div className="py-12 px-4 text-center space-y-4 border-2 border-dashed border-light-border/60 dark:border-night-border/60 rounded-3xl animate-fadeIn">
                <p className="font-serif italic text-xl text-light-muted dark:text-night-muted">
                  No history for this day.
                </p>
                <button
                  onClick={() => setIsEditingReflection(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-light-bg dark:bg-night-elevated text-xs sm:text-sm font-semibold text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-lavender transition-all btn-clean shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                  <span>write reflection</span>
                </button>
              </div>
            )
          ) : (
            /* REFLECTION EDITOR FORM */
            <form onSubmit={handleSaveReflection} className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-pastel-mauve-ink dark:text-pastel-mauve block">
                  made
                </label>
                <textarea
                  value={made}
                  onChange={(e) => setMade(e.target.value)}
                  rows={2}
                  placeholder="things you created, built, or brought to life..."
                  className="w-full p-3 rounded-xl bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none focus:ring-1 focus:ring-pastel-mauve resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-pastel-blue-ink dark:text-pastel-blue block">
                  learned
                </label>
                <textarea
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                  rows={2}
                  placeholder="new insights, discoveries, or concepts..."
                  className="w-full p-3 rounded-xl bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none focus:ring-1 focus:ring-pastel-blue resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-pastel-pink-ink dark:text-pastel-pink block">
                  for fun
                </label>
                <textarea
                  value={forFun}
                  onChange={(e) => setForFun(e.target.value)}
                  rows={2}
                  placeholder="activities enjoyed purely for pleasure..."
                  className="w-full p-3 rounded-xl bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none focus:ring-1 focus:ring-pastel-pink resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-pastel-yellow-ink dark:text-pastel-yellow block">
                  next focus
                </label>
                <input
                  type="text"
                  value={nextFocus}
                  onChange={(e) => setNextFocus(e.target.value)}
                  placeholder="main intention or focus coming up..."
                  className="w-full px-3.5 py-2 bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none focus:ring-1 focus:ring-pastel-yellow rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-light-border/60 dark:border-night-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditingReflection(false)}
                  className="px-4 py-2 text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs font-semibold hover:opacity-90 transition-all btn-clean shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 stroke-[2]" />
                  <span>save reflection</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
