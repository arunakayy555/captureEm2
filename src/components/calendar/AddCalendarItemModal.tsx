import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEventColor, TaskSection, TaskImportance, TaskUrgency, TaskTag } from '../../types';
import { formatReadableDate } from '../../utils/date';

interface AddCalendarItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
  initialTime?: string;
  initialType?: 'event' | 'task';
}

const COLOR_OPTIONS: { id: CalendarEventColor; label: string; bgClass: string; borderClass: string }[] = [
  { id: 'yellow', label: 'Yellow', bgClass: 'bg-pastel-yellow', borderClass: 'border-pastel-yellow' },
  { id: 'blue', label: 'Blue', bgClass: 'bg-pastel-blue', borderClass: 'border-pastel-blue' },
  { id: 'lavender', label: 'Lavender', bgClass: 'bg-pastel-lavender', borderClass: 'border-pastel-lavender' },
  { id: 'sage', label: 'Sage', bgClass: 'bg-pastel-sage', borderClass: 'border-pastel-sage' },
  { id: 'pink', label: 'Pink', bgClass: 'bg-pastel-pink', borderClass: 'border-pastel-pink' },
  { id: 'mauve', label: 'Mauve', bgClass: 'bg-pastel-mauve', borderClass: 'border-pastel-mauve' },
];

export const AddCalendarItemModal: React.FC<AddCalendarItemModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  initialType = 'event',
}) => {
  const { addCalendarEvent, addTask } = useApp();

  const [itemType, setItemType] = useState<'event' | 'task'>(initialType);

  // Event State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime || '');
  const [endTime, setEndTime] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState<CalendarEventColor>('yellow');

  // Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(initialDate);
  const [taskSection, setTaskSection] = useState<TaskSection>('now');
  const [selectedImportance, setSelectedImportance] = useState<TaskImportance | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<TaskUrgency | null>(null);
  const [taskEstimatedTime, setTaskEstimatedTime] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItemType(initialType);
      setEventDate(initialDate);
      setTaskDate(initialDate);
      setStartTime(initialTime || '');
      setEndTime('');
      setEventTitle('');
      setEventNotes('');
      setSelectedColor('yellow');

      setTaskTitle('');
      setTaskNotes('');
      setTaskSection('now');
      setSelectedImportance(null);
      setSelectedUrgency(null);
      setTaskEstimatedTime('');
    }
  }, [isOpen, initialDate, initialTime, initialType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      start_time: startTime.trim() || undefined,
      end_time: endTime.trim() || undefined,
      notes: eventNotes.trim() || undefined,
      color: selectedColor,
    });

    onClose();
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const tags: TaskTag[] = [];
    if (selectedImportance) tags.push(selectedImportance);
    if (selectedUrgency) tags.push(selectedUrgency);

    addTask({
      title: taskTitle.trim(),
      note: taskNotes.trim() || undefined,
      section: taskSection,
      deadline: taskDate,
      scheduled_date: taskDate,
      estimated_time: taskEstimatedTime.trim() || undefined,
      importance: selectedImportance || undefined,
      urgency: selectedUrgency || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-light-border/80 dark:border-night-border/80">
          <div>
            <h2 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text">
              add to calendar
            </h2>
            <p className="text-xs sm:text-sm font-serif italic text-light-muted dark:text-night-muted mt-0.5">
              {formatReadableDate(itemType === 'event' ? eventDate : taskDate)}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Tab Switcher: Event vs Task */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setItemType('event')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 btn-clean ${
              itemType === 'event'
                ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border-2 border-light-border dark:border-night-border hover:text-light-text dark:hover:text-night-text'
            }`}
          >
            <CalendarIcon className="w-4 h-4 stroke-[2]" />
            <span>Event</span>
          </button>

          <button
            type="button"
            onClick={() => setItemType('task')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 btn-clean ${
              itemType === 'task'
                ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border-2 border-light-border dark:border-night-border hover:text-light-text dark:hover:text-night-text'
            }`}
          >
            <CheckSquare className="w-4 h-4 stroke-[2]" />
            <span>Task</span>
          </button>
        </div>

        {/* FORM 1: EVENT */}
        {itemType === 'event' ? (
          <form onSubmit={handleSaveEvent} className="space-y-4 pt-3">
            <div>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="event title (e.g. Doctor appointment, Team sync)..."
                autoFocus
                className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-base focus:outline-none focus:ring-1 focus:ring-pastel-yellow font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1">
                  date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1">
                  start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1">
                  end time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block">
                color accent
              </span>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bgClass} transition-all btn-clean flex items-center justify-center ${
                      selectedColor === c.id
                        ? 'ring-2 ring-light-text dark:ring-night-text scale-110 shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {selectedColor === c.id && <span className="text-black font-bold text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="optional details, location, or notes..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none focus:ring-1 focus:ring-pastel-yellow resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-light-border/60 dark:border-night-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={!eventTitle.trim()}
                className="px-5 py-2 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 btn-clean shadow-xs"
              >
                save event
              </button>
            </div>
          </form>
        ) : (
          /* FORM 2: TASK */
          <form onSubmit={handleSaveTask} className="space-y-4 pt-3">
            <div>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="task title (e.g. Finish project documentation)..."
                autoFocus
                className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-base focus:outline-none focus:ring-1 focus:ring-pastel-yellow font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1">
                  scheduled date
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1">
                  section
                </label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {(['now', 'next', 'later'] as TaskSection[]).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTaskSection(sec)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all btn-clean ${
                        taskSection === sec
                          ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs'
                          : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border dark:border-night-border'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Importance / Urgency Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block">
                priority tags (optional)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedImportance(selectedImportance === 'Important' ? null : 'Important')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all btn-clean ${
                    selectedImportance === 'Important'
                      ? 'bg-pastel-yellow text-night-bg font-bold shadow-xs border border-pastel-yellow'
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80'
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
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80'
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
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80'
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
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80'
                  }`}
                >
                  Not Urgent
                </button>
              </div>
            </div>

            {/* Note & Estimated time */}
            <div className="space-y-3">
              <input
                type="text"
                value={taskEstimatedTime}
                onChange={(e) => setTaskEstimatedTime(e.target.value)}
                placeholder="estimated time (e.g. 45 min)"
                className="w-full px-3.5 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none font-medium"
              />
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="optional note or details..."
                rows={2}
                className="w-full px-3.5 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none focus:ring-1 focus:ring-pastel-yellow resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-light-border/60 dark:border-night-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={!taskTitle.trim()}
                className="px-5 py-2 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 btn-clean shadow-xs"
              >
                save task
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
