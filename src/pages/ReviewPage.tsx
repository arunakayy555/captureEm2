import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Activity,
  Edit3,
  Trash2,
  Play,
  Grid,
  ListFilter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatFocusDuration,
  toDateKey,
  formatReadableDate,
} from '../utils/date';
import { WeekReview } from '../types';
import { AddCalendarItemModal } from '../components/calendar/AddCalendarItemModal';


const EVENT_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  yellow: {
    bg: 'bg-pastel-yellow/25 dark:bg-pastel-yellow/20',
    text: 'text-pastel-yellow-ink dark:text-pastel-yellow',
    border: 'border-pastel-yellow/50',
    dot: 'bg-pastel-yellow',
  },
  blue: {
    bg: 'bg-pastel-blue/25 dark:bg-pastel-blue/20',
    text: 'text-pastel-blue-ink dark:text-pastel-blue',
    border: 'border-pastel-blue/50',
    dot: 'bg-pastel-blue',
  },
  lavender: {
    bg: 'bg-pastel-lavender/25 dark:bg-pastel-lavender/20',
    text: 'text-pastel-lavender-ink dark:text-pastel-lavender',
    border: 'border-pastel-lavender/50',
    dot: 'bg-pastel-lavender',
  },
  sage: {
    bg: 'bg-pastel-sage/25 dark:bg-pastel-sage/20',
    text: 'text-pastel-sage-ink dark:text-pastel-sage',
    border: 'border-pastel-sage/50',
    dot: 'bg-pastel-sage',
  },
  pink: {
    bg: 'bg-pastel-pink/25 dark:bg-pastel-pink/20',
    text: 'text-pastel-pink-ink dark:text-pastel-pink',
    border: 'border-pastel-pink/50',
    dot: 'bg-pastel-pink',
  },
  mauve: {
    bg: 'bg-pastel-mauve/25 dark:bg-pastel-mauve/20',
    text: 'text-pastel-mauve-ink dark:text-pastel-mauve',
    border: 'border-pastel-mauve/50',
    dot: 'bg-pastel-mauve',
  },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM (22:00)

export const ReviewPage: React.FC = () => {
  const {
    reviews,
    saveReview,
    focusSessions,
    tasks,
    projects,
    calendarEvents,
    deleteCalendarEvent,
    toggleTaskCompleted,
    startFocusWithTask,
    bodyEntries,
    lifetimeCompletedTasksCount,
    todayCompletedTasksCount,
  } = useApp();


  const todayKey = toDateKey(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  // Month navigation state
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // Modal State for Adding Item (Event / Task)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>(undefined);
  const [modalInitialType, setModalInitialType] = useState<'event' | 'task'>('event');

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

  // Calendar calculations
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
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

  const handlePrevDay = () => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const prevDate = new Date(y, m - 1, d - 1);
    setSelectedDateKey(toDateKey(prevDate));
    setViewDate(prevDate);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d + 1);
    setSelectedDateKey(toDateKey(nextDate));
    setViewDate(nextDate);
  };

  const handleOpenAddModal = (timeSlot?: string, type: 'event' | 'task' = 'event') => {
    setModalInitialTime(timeSlot);
    setModalInitialType(type);
    setIsAddModalOpen(true);
  };

  // Filter Items for Selected Date
  const dayEvents = calendarEvents.filter((e) => e.date === selectedDateKey);
  
  // Tasks scheduled for this date (either explicit scheduled_date or matching deadline)
  const dayScheduledTasks = tasks.filter(
    (t) =>
      (t.scheduled_date === selectedDateKey || (t.deadline && t.deadline === selectedDateKey))
  );

  // Focus sessions for selected date
  const daySessions = focusSessions.filter(
    (s) => toDateKey(s.date || s.created_at) === selectedDateKey
  );
  const dayFocusSeconds = daySessions.reduce((acc, s) => {
    if (typeof s.duration_seconds === 'number' && s.duration_seconds > 0) {
      return acc + s.duration_seconds;
    }
    return acc + (s.duration || 0) * 60;
  }, 0);

  // Historical completed tasks on this date
  const dayBodyEntry = bodyEntries.find((b) => b.date === selectedDateKey);

  const dayCompletedTasks = tasks.filter(
    (t) => t.status === 'completed' && t.completed_at && toDateKey(t.completed_at) === selectedDateKey
  );

  // Reflection existence
  const hasReflection = Boolean(
    selectedDateReview &&
      (selectedDateReview.made?.trim() ||
        selectedDateReview.learned?.trim() ||
        selectedDateReview.for_fun?.trim() ||
        selectedDateReview.next_focus?.trim())
  );

  // Check if selected date is today
  const isSelectedToday = selectedDateKey === todayKey;


  // Set of dates with recorded reflections
  const datesWithReflections = new Set(
    reviews
      .filter((r) => r.made?.trim() || r.learned?.trim() || r.for_fun?.trim() || r.next_focus?.trim())
      .map((r) => toDateKey(r.date))
  );

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Top Header: Title, Description & Month/Day View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-5xl sm:text-6xl text-light-text dark:text-night-text tracking-tight">
            calendar & so far
          </h1>
          <p className="font-serif italic font-medium text-2xl sm:text-3xl text-light-muted dark:text-night-muted mt-1.5">
            plan what's ahead · reflect on what was done
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Month vs Day */}
          <div className="flex items-center bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all btn-clean ${
                viewMode === 'month'
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
            >
              <Grid className="w-4 h-4 stroke-[2]" />
              <span>Month</span>
            </button>

            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all btn-clean ${
                viewMode === 'day'
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                  : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
              }`}
            >
              <ListFilter className="w-4 h-4 stroke-[2]" />
              <span>Day</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => handleOpenAddModal(undefined, 'event')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all shadow-sm btn-clean"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">schedule item</span>
            <span className="xs:hidden">add</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Bar: Lifetime Completed Tasks + Today's Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-light-surface/90 dark:bg-night-surface/90 border-2 border-light-border dark:border-night-border shadow-xs">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted block">
            total completed
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif italic font-semibold text-3xl sm:text-4xl text-pastel-sage-ink dark:text-pastel-sage">
              {lifetimeCompletedTasksCount}
            </span>
            <span className="font-serif italic text-xs text-light-muted dark:text-night-muted">tasks (all-time)</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-light-surface/90 dark:bg-night-surface/90 border-2 border-light-border dark:border-night-border shadow-xs">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted block">
            completed today
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif italic font-semibold text-3xl sm:text-4xl text-pastel-yellow-ink dark:text-pastel-yellow">
              {todayCompletedTasksCount}
            </span>
            <span className="font-serif italic text-xs text-light-muted dark:text-night-muted">tasks today</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-light-surface/90 dark:bg-night-surface/90 border-2 border-light-border dark:border-night-border shadow-xs">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted block">
            focus sessions
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif italic font-semibold text-3xl sm:text-4xl text-pastel-blue-ink dark:text-pastel-blue">
              {focusSessions.length}
            </span>
            <span className="font-serif italic text-xs text-light-muted dark:text-night-muted">sessions</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-light-surface/90 dark:bg-night-surface/90 border-2 border-light-border dark:border-night-border shadow-xs">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted block">
            active projects
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-serif italic font-semibold text-3xl sm:text-4xl text-pastel-mauve-ink dark:text-pastel-mauve">
              {projects.filter((p) => p.status === 'active').length}
            </span>
            <span className="font-serif italic text-xs text-light-muted dark:text-night-muted">projects</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MONTH VIEW (Clean Month Grid + Selected Day Preview Side Panel)   */}
      {/* ========================================================================= */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MONTH CALENDAR GRID (Left/Main Column) */}
          <div className="lg:col-span-7 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
            {/* Calendar Navigation Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-light-border/70 dark:border-night-border/70">
              <h2 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text capitalize">
                {monthName}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTodayJump}
                  className="px-3 py-1 rounded-xl text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border transition-colors btn-clean"
                >
                  today
                </button>
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1.5 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2]" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-1.5 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEK_DAYS.map((w) => (
                <span
                  key={w}
                  className="text-xs font-sans uppercase tracking-wider font-bold text-light-muted dark:text-night-muted py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-transparent" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayStr = String(dayNum).padStart(2, '0');
                const monthStr = String(currentMonth + 1).padStart(2, '0');
                const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === todayKey;
                const cellEvents = calendarEvents.filter((e) => e.date === dateKey);
                const cellTasks = tasks.filter((t) => t.scheduled_date === dateKey || t.deadline === dateKey);
                const hasReflectionLogged = datesWithReflections.has(dateKey);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`h-16 sm:h-20 p-1.5 rounded-2xl text-left transition-all duration-150 flex flex-col justify-between relative btn-clean border-2 ${
                      isSelected
                        ? 'bg-light-surface dark:bg-night-surface border-light-text dark:border-night-text shadow-sm ring-2 ring-pastel-yellow/60'
                        : isToday
                        ? 'bg-light-bg dark:bg-night-elevated border-pastel-yellow/90 font-bold'
                        : 'bg-light-bg/40 dark:bg-night-elevated/40 border-transparent hover:border-light-border dark:hover:border-night-border'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-semibold leading-none ${
                          isSelected
                            ? 'text-light-text dark:text-night-text font-bold'
                            : isToday
                            ? 'text-pastel-yellow-ink dark:text-pastel-yellow font-bold'
                            : 'text-light-text/90 dark:text-night-text/90'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {hasReflectionLogged && (
                        <span
                          className="w-2 h-2 rounded-full bg-pastel-lavender ring-1 ring-pastel-lavender/50"
                          title="Reflection recorded"
                        />
                      )}
                    </div>

                    {/* Indicators for Events & Tasks */}
                    <div className="space-y-0.5 w-full overflow-hidden">
                      {cellEvents.slice(0, 2).map((ev) => {
                        const style = EVENT_COLOR_MAP[ev.color || 'yellow'] || EVENT_COLOR_MAP.yellow;
                        return (
                          <div
                            key={ev.id}
                            className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium ${style.bg} ${style.text}`}
                          >
                            {ev.start_time ? `${ev.start_time} ` : ''}{ev.title}
                          </div>
                        );
                      })}

                      {cellTasks.slice(0, 1).map((t) => (
                        <div
                          key={t.id}
                          className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage flex items-center gap-0.5"
                        >
                          <span>•</span>
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {cellEvents.length + cellTasks.length > 2 && (
                        <span className="text-[8px] text-light-muted dark:text-night-muted pl-0.5 font-bold">
                          +{cellEvents.length + cellTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-light-muted dark:text-night-muted border-t border-light-border/60 dark:border-night-border/60 font-serif italic">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-yellow" />
                  <span>events</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-sage" />
                  <span>tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-lavender" />
                  <span>reflections</span>
                </div>
              </div>
              <button
                onClick={() => setViewMode('day')}
                className="text-xs font-sans not-italic font-semibold text-light-text dark:text-night-text hover:underline"
              >
                open day view →
              </button>
            </div>
          </div>

          {/* SELECTED DAY PREVIEW & DETAILS (Right Column) */}
          <div className="lg:col-span-5 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 space-y-6 shadow-sm min-h-[480px]">
            {/* Header for Selected Day */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-light-border/70 dark:border-night-border/70">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-pastel-lavender-ink dark:text-pastel-lavender block">
                  {isSelectedToday ? 'today' : 'selected day'}
                </span>
                <h2 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text mt-0.5">
                  {formatReadableDate(selectedDateKey)}
                </h2>
              </div>

              <button
                onClick={() => handleOpenAddModal(undefined, 'event')}
                className="p-2 rounded-xl bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text border border-light-border dark:border-night-border hover:border-pastel-yellow transition-colors btn-clean"
                title="Add event or task to this date"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* DATE-FIRST ORDER: 1. Scheduled Events */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between pb-1 mb-2 border-b border-light-border/50 dark:border-night-border/50">
                  <span className="text-xs uppercase tracking-wider font-bold text-light-muted dark:text-night-muted">
                    scheduled items ({dayEvents.length + dayScheduledTasks.length})
                  </span>
                  <button
                    onClick={() => setViewMode('day')}
                    className="text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text font-serif italic"
                  >
                    day timeline
                  </button>
                </div>

                {dayEvents.length > 0 || dayScheduledTasks.length > 0 ? (
                  <div className="space-y-2">
                    {/* Events */}
                    {dayEvents.map((ev) => {
                      const colorStyle = EVENT_COLOR_MAP[ev.color || 'yellow'] || EVENT_COLOR_MAP.yellow;
                      return (
                        <div
                          key={ev.id}
                          className={`group p-3 rounded-2xl border-2 ${colorStyle.border} ${colorStyle.bg} flex items-start justify-between gap-2 transition-all`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`} />
                              <h4 className="font-semibold text-sm sm:text-base text-light-text dark:text-night-text truncate">
                                {ev.title}
                              </h4>
                            </div>

                            {(ev.start_time || ev.end_time) && (
                              <div className="flex items-center gap-1.5 text-xs text-light-muted dark:text-night-muted mt-1 ml-4 font-mono">
                                <Clock className="w-3 h-3 stroke-[2]" />
                                <span>
                                  {ev.start_time || ''}{ev.end_time ? ` - ${ev.end_time}` : ''}
                                </span>
                              </div>
                            )}

                            {ev.notes && (
                              <p className="text-xs text-light-muted dark:text-night-muted mt-1 ml-4 line-clamp-2">
                                {ev.notes}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteCalendarEvent(ev.id)}
                            className="p-1 text-light-muted dark:text-night-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Scheduled Tasks */}
                    {dayScheduledTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl bg-light-bg/80 dark:bg-night-elevated/80 border-2 border-light-border/80 dark:border-night-border/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskCompleted(task.id)}
                            className="text-light-muted dark:text-night-muted hover:text-pastel-sage transition-colors shrink-0"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-pastel-sage stroke-[2.2]" />
                            ) : (
                              <Circle className="w-4 h-4 stroke-[2]" />
                            )}
                          </button>
                          <span
                            className={`text-sm font-medium truncate ${
                              task.status === 'completed'
                                ? 'line-through text-light-muted dark:text-night-muted'
                                : 'text-light-text dark:text-night-text'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {task.status === 'active' && (
                          <button
                            onClick={() => startFocusWithTask(task.title, 45, task.id, task.project_id)}
                            className="p-1 rounded-lg text-light-muted dark:text-night-muted hover:text-pastel-yellow btn-clean"
                            title="Start focus"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-serif italic text-light-muted dark:text-night-muted py-2">
                    nothing scheduled for this day yet.
                  </p>
                )}
              </div>

              {/* 2. Historical Summary (Focus time, Completed tasks, Reflections) */}
              <div className="pt-3 border-t-2 border-light-border/60 dark:border-night-border/60 space-y-3">
                <span className="text-xs uppercase tracking-wider font-bold text-light-muted dark:text-night-muted block">
                  activity & reflections
                </span>

                {dayFocusSeconds > 0 && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pastel-yellow-ink dark:text-pastel-yellow">
                      <Clock className="w-4 h-4 stroke-[2]" />
                      <span className="text-xs font-bold uppercase tracking-wider">focus time</span>
                    </div>
                    <span className="font-serif italic font-semibold text-lg text-light-text dark:text-night-text">
                      {formatFocusDuration(dayFocusSeconds)}
                    </span>
                  </div>
                )}

                {dayCompletedTasks.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pastel-sage-ink dark:text-pastel-sage">
                        <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {isSelectedToday ? 'completed today' : 'completed on this day'} ({dayCompletedTasks.length})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {dayCompletedTasks.map((t) => {
                        const proj = projects.find((p) => p.id === t.project_id);
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-xl bg-light-surface/70 dark:bg-night-surface/70 border border-light-border/40 dark:border-night-border/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                onClick={() => toggleTaskCompleted(t.id)}
                                className="text-pastel-sage-ink dark:text-pastel-sage hover:opacity-75 transition-opacity shrink-0 p-0.5"
                                title="Click to unmark as completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                              <span className="truncate line-through text-light-muted dark:text-night-muted font-medium">
                                {t.title}
                              </span>
                            </div>
                            {proj && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pastel-mauve/20 text-pastel-mauve-ink dark:text-pastel-mauve font-medium shrink-0">
                                {proj.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {dayBodyEntry && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pastel-lavender-ink dark:text-pastel-lavender">
                        <Activity className="w-4 h-4 stroke-[2]" />
                        <span className="text-xs font-bold uppercase tracking-wider">body wellbeing</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-light-text dark:text-night-text">
                        Energy: {dayBodyEntry.energy}/10
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-pastel-lavender/20 text-pastel-lavender-ink dark:text-pastel-lavender font-medium">
                        Sleep: {dayBodyEntry.sleep}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage font-medium">
                        Movement: {dayBodyEntry.movement}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pastel-blue/20 text-pastel-blue-ink dark:text-pastel-blue font-medium">
                        Water: {dayBodyEntry.water}
                      </span>
                    </div>
                  </div>
                )}

                {hasReflection ? (
                  <div className="p-4 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pastel-mauve-ink dark:text-pastel-mauve">
                        <BookOpen className="w-4 h-4 stroke-[2]" />
                        <span className="text-xs font-bold uppercase tracking-wider">reflection</span>
                      </div>
                      <button
                        onClick={() => setIsEditingReflection(true)}
                        className="text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text flex items-center gap-1 btn-clean font-serif italic"
                      >
                        <Edit3 className="w-3 h-3 stroke-[2]" />
                        <span>edit</span>
                      </button>
                    </div>
                    <p className="font-serif italic text-xs sm:text-sm text-light-text dark:text-night-text leading-relaxed">
                      {selectedDateReview?.made || selectedDateReview?.learned || selectedDateReview?.for_fun || selectedDateReview?.next_focus}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingReflection(true)}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-light-border dark:border-night-border text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-all btn-clean"
                  >
                    + log reflection for this date
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: DAY VIEW (Google Calendar style Hourly Timeline + Prominent List) */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Day Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevDay}
                aria-label="Previous day"
                className="p-2 rounded-xl bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text border border-light-border dark:border-night-border transition-colors btn-clean"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                onClick={handleTodayJump}
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-light-text dark:text-night-text bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border hover:border-pastel-yellow transition-colors btn-clean"
              >
                today
              </button>
              <button
                onClick={handleNextDay}
                aria-label="Next day"
                className="p-2 rounded-xl bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text border border-light-border dark:border-night-border transition-colors btn-clean"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>

              <h2 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text ml-2">
                {formatReadableDate(selectedDateKey)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal(undefined, 'task')}
                className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-sage transition-all btn-clean"
              >
                + add task
              </button>
              <button
                onClick={() => handleOpenAddModal(undefined, 'event')}
                className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg hover:opacity-90 transition-all btn-clean shadow-xs"
              >
                + add event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* HOURLY TIMELINE SLOTS (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b-2 border-light-border/70 dark:border-night-border/70">
                <span className="text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted">
                  timeline schedule (click slot to add)
                </span>
                <span className="text-xs font-serif italic text-light-muted dark:text-night-muted">
                  7:00 AM - 10:00 PM
                </span>
              </div>

              {/* Hour rows */}
              <div className="divide-y divide-light-border/40 dark:divide-night-border/40">
                {HOURS.map((hour) => {
                  const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                  const displayTime =
                    hour === 12
                      ? '12 PM'
                      : hour > 12
                      ? `${hour - 12} PM`
                      : `${hour} AM`;

                  // Find events matching this hour
                  const eventsInHour = dayEvents.filter((e) => {
                    if (!e.start_time) return false;
                    const eventHour = parseInt(e.start_time.split(':')[0], 10);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={hour}
                      className="group flex items-start gap-4 py-2 hover:bg-light-bg/60 dark:hover:bg-night-elevated/60 rounded-xl px-2 transition-colors cursor-pointer"
                      onClick={() => handleOpenAddModal(hourStr, 'event')}
                    >
                      <span className="w-14 shrink-0 text-xs font-mono font-medium text-light-muted dark:text-night-muted pt-1">
                        {displayTime}
                      </span>

                      <div className="flex-1 min-h-[36px] flex flex-col gap-1.5 justify-center">
                        {eventsInHour.length > 0 ? (
                          eventsInHour.map((ev) => {
                            const colorStyle = EVENT_COLOR_MAP[ev.color || 'yellow'] || EVENT_COLOR_MAP.yellow;
                            return (
                              <div
                                key={ev.id}
                                onClick={(e) => e.stopPropagation()}
                                className={`p-2.5 rounded-xl border-2 ${colorStyle.border} ${colorStyle.bg} flex items-center justify-between gap-2 shadow-xs`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`} />
                                  <span className="text-xs sm:text-sm font-semibold text-light-text dark:text-night-text truncate">
                                    {ev.title}
                                  </span>
                                  <span className="text-[11px] font-mono text-light-muted dark:text-night-muted">
                                    ({ev.start_time}{ev.end_time ? ` - ${ev.end_time}` : ''})
                                  </span>
                                </div>

                                <button
                                  onClick={() => deleteCalendarEvent(ev.id)}
                                  className="text-light-muted dark:text-night-muted hover:text-red-400 p-1 btn-clean"
                                  title="Delete event"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[11px] font-serif italic text-light-muted/40 dark:text-night-muted/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            + click to schedule at {displayTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DAY DETAILS, PROMINENT TASKS & REFLECTIONS (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. DATE-FIRST SCHEDULED TASKS */}
              <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b-2 border-light-border/70 dark:border-night-border/70">
                  <span className="text-xs uppercase tracking-widest font-bold text-pastel-sage-ink dark:text-pastel-sage">
                    tasks for this day ({dayScheduledTasks.length})
                  </span>
                  <button
                    onClick={() => handleOpenAddModal(undefined, 'task')}
                    className="text-xs font-semibold text-light-text dark:text-night-text hover:underline"
                  >
                    + new task
                  </button>
                </div>

                {dayScheduledTasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {dayScheduledTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-2xl bg-light-bg/80 dark:bg-night-elevated/80 border-2 border-light-border dark:border-night-border flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            onClick={() => toggleTaskCompleted(task.id)}
                            className="mt-0.5 text-light-muted dark:text-night-muted hover:text-pastel-sage transition-colors shrink-0"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-pastel-sage stroke-[2.2]" />
                            ) : (
                              <Circle className="w-4 h-4 stroke-[2]" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-sm sm:text-base font-medium leading-snug block ${
                                task.status === 'completed'
                                  ? 'line-through text-light-muted dark:text-night-muted'
                                  : 'text-light-text dark:text-night-text'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.estimated_time && (
                              <span className="text-xs text-light-muted dark:text-night-muted font-normal mt-0.5 block">
                                {task.estimated_time}
                              </span>
                            )}
                          </div>
                        </div>

                        {task.status === 'active' && (
                          <button
                            onClick={() => startFocusWithTask(task.title, 45, task.id, task.project_id)}
                            className="p-1.5 rounded-lg text-light-muted dark:text-night-muted hover:text-pastel-yellow btn-clean"
                            title="Focus on this"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-serif italic text-light-muted dark:text-night-muted py-2">
                    no specific tasks scheduled for this day.
                  </p>
                )}
              </div>

              {/* 2. DAY'S RECORDED HISTORY (Focus, Completed, Reflections) */}
              <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b-2 border-light-border/70 dark:border-night-border/70">
                  <span className="text-xs uppercase tracking-widest font-bold text-pastel-mauve-ink dark:text-pastel-mauve">
                    reflection & history
                  </span>
                  {!isEditingReflection && hasReflection && (
                    <button
                      onClick={() => setIsEditingReflection(true)}
                      className="text-xs font-serif italic text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 stroke-[2]" />
                      <span>edit</span>
                    </button>
                  )}
                </div>

                {/* Focus summary */}
                {dayFocusSeconds > 0 && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pastel-yellow-ink dark:text-pastel-yellow">
                      <Clock className="w-4 h-4 stroke-[2]" />
                      <span className="text-xs font-bold uppercase tracking-wider">focus logged</span>
                    </div>
                    <span className="font-serif italic font-semibold text-lg text-light-text dark:text-night-text">
                      {formatFocusDuration(dayFocusSeconds)}
                    </span>
                  </div>
                )}

                {dayCompletedTasks.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pastel-sage-ink dark:text-pastel-sage">
                        <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {isSelectedToday ? 'completed today' : 'completed on this day'} ({dayCompletedTasks.length})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {dayCompletedTasks.map((t) => {
                        const proj = projects.find((p) => p.id === t.project_id);
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-xl bg-light-surface/70 dark:bg-night-surface/70 border border-light-border/40 dark:border-night-border/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                onClick={() => toggleTaskCompleted(t.id)}
                                className="text-pastel-sage-ink dark:text-pastel-sage hover:opacity-75 transition-opacity shrink-0 p-0.5"
                                title="Click to unmark as completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                              <span className="truncate line-through text-light-muted dark:text-night-muted font-medium">
                                {t.title}
                              </span>
                            </div>
                            {proj && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pastel-mauve/20 text-pastel-mauve-ink dark:text-pastel-mauve font-medium shrink-0">
                                {proj.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {dayBodyEntry && (
                  <div className="p-3.5 rounded-2xl bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/60 dark:border-night-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pastel-lavender-ink dark:text-pastel-lavender">
                        <Activity className="w-4 h-4 stroke-[2]" />
                        <span className="text-xs font-bold uppercase tracking-wider">body wellbeing</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-light-text dark:text-night-text">
                        Energy: {dayBodyEntry.energy}/10
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-pastel-lavender/20 text-pastel-lavender-ink dark:text-pastel-lavender font-medium">
                        Sleep: {dayBodyEntry.sleep}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage font-medium">
                        Movement: {dayBodyEntry.movement}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pastel-blue/20 text-pastel-blue-ink dark:text-pastel-blue font-medium">
                        Water: {dayBodyEntry.water}
                      </span>
                    </div>
                  </div>
                )}

                {/* Reflection View or Edit */}
                {!isEditingReflection ? (
                  hasReflection ? (
                    <div className="space-y-3 pt-1">
                      {selectedDateReview?.made && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-night-muted block">
                            made:
                          </span>
                          <p className="font-serif italic text-xs sm:text-sm text-light-text dark:text-night-text mt-0.5">
                            {selectedDateReview.made}
                          </p>
                        </div>
                      )}
                      {selectedDateReview?.learned && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-night-muted block">
                            learned:
                          </span>
                          <p className="font-serif italic text-xs sm:text-sm text-light-text dark:text-night-text mt-0.5">
                            {selectedDateReview.learned}
                          </p>
                        </div>
                      )}
                      {selectedDateReview?.for_fun && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-night-muted block">
                            for fun:
                          </span>
                          <p className="font-serif italic text-xs sm:text-sm text-light-text dark:text-night-text mt-0.5">
                            {selectedDateReview.for_fun}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="font-serif italic text-xs text-light-muted dark:text-night-muted">
                        no reflection written for this day yet.
                      </p>
                      <button
                        onClick={() => setIsEditingReflection(true)}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text border border-light-border dark:border-night-border hover:border-pastel-mauve btn-clean"
                      >
                        + write reflection
                      </button>
                    </div>
                  )
                ) : (
                  /* Reflection Edit Form */
                  <form onSubmit={handleSaveReflection} className="space-y-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-pastel-mauve-ink dark:text-pastel-mauve block mb-1">
                        made
                      </label>
                      <textarea
                        value={made}
                        onChange={(e) => setMade(e.target.value)}
                        rows={2}
                        placeholder="things created or accomplished..."
                        className="w-full p-2.5 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs text-light-text dark:text-night-text focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-pastel-blue-ink dark:text-pastel-blue block mb-1">
                        learned
                      </label>
                      <textarea
                        value={learned}
                        onChange={(e) => setLearned(e.target.value)}
                        rows={2}
                        placeholder="learnings or discoveries..."
                        className="w-full p-2.5 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs text-light-text dark:text-night-text focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-pastel-pink-ink dark:text-pastel-pink block mb-1">
                        for fun
                      </label>
                      <textarea
                        value={forFun}
                        onChange={(e) => setForFun(e.target.value)}
                        rows={2}
                        placeholder="joyful activities enjoyed..."
                        className="w-full p-2.5 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs text-light-text dark:text-night-text focus:outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-border/50 dark:border-night-border/50">
                      <button
                        type="button"
                        onClick={() => setIsEditingReflection(false)}
                        className="px-3 py-1 text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
                      >
                        cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-lg text-xs font-semibold btn-clean shadow-xs"
                      >
                        save
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Calendar Item Modal */}
      <AddCalendarItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialDate={selectedDateKey}
        initialTime={modalInitialTime}
        initialType={modalInitialType}
      />
    </div>
  );
};
