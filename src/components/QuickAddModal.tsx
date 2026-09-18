import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Clock, Calendar, AlignLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskSection, TaskImportance, TaskUrgency, TaskTag } from '../types';

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, addTask } = useApp();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [section, setSection] = useState<TaskSection>('now');
  const [selectedImportance, setSelectedImportance] = useState<TaskImportance | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<TaskUrgency | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickAddOpen) {
      setTitle('');
      setNote('');
      setSection('now');
      setSelectedImportance(null);
      setSelectedUrgency(null);
      setEstimatedTime('');
      setDeadline('');
      setShowDetails(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isQuickAddOpen]);

  // Global shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
      if (e.key === 'Escape' && isQuickAddOpen) {
        setIsQuickAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen, setIsQuickAddOpen]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags: TaskTag[] = [];
    if (selectedImportance) tags.push(selectedImportance);
    if (selectedUrgency) tags.push(selectedUrgency);

    addTask({
      title: title.trim(),
      note: note.trim() || undefined,
      section,
      estimated_time: estimatedTime.trim() || undefined,
      deadline: deadline.trim() || undefined,
      importance: selectedImportance || undefined,
      urgency: selectedUrgency || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-light-border/80 dark:border-night-border/80">
          <div>
            <h2 className="font-serif italic font-semibold text-3xl text-light-text dark:text-night-text">
              capture thought
            </h2>
            <p className="text-sm sm:text-base font-serif italic text-light-muted dark:text-night-muted mt-0.5">
              put it here · return to what you were doing
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            aria-label="Close"
            className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="what's on your mind? (e.g. register for photography course)"
              className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-pastel-yellow/70 transition-all font-medium"
            />
          </div>

          {/* Section choice: now, next, later */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted mr-1">place in:</span>
            {(['now', 'next', 'later'] as TaskSection[]).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSection(sec)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-all btn-clean ${
                  section === sec
                    ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-semibold shadow-xs'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border-2 border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Optional categorization tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted">
                tags <span className="font-serif italic text-xs text-light-muted/70 dark:text-night-muted/70">(optional)</span>:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedImportance(selectedImportance === 'Important' ? null : 'Important')}
                className={`px-3 py-1 rounded-full text-xs transition-all btn-clean ${
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
                className={`px-3 py-1 rounded-full text-xs transition-all btn-clean ${
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
                className={`px-3 py-1 rounded-full text-xs transition-all btn-clean ${
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
                className={`px-3 py-1 rounded-full text-xs transition-all btn-clean ${
                  selectedUrgency === 'Not Urgent'
                    ? 'bg-pastel-blue text-night-bg font-bold shadow-xs border border-pastel-blue'
                    : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted border border-light-border/80 dark:border-night-border/80 hover:text-light-text dark:hover:text-night-text'
                }`}
              >
                Not Urgent
              </button>
            </div>
          </div>

          {/* Expandable Details */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 stroke-[2]" />
                  <span>hide extra details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 stroke-[2]" />
                  <span>add note, time or deadline</span>
                </>
              )}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3 pt-3 border-t-2 border-light-border/60 dark:border-night-border/60">
                <div className="flex items-start gap-2 bg-light-bg dark:bg-night-elevated p-3 rounded-2xl border-2 border-light-border dark:border-night-border">
                  <AlignLeft className="w-4 h-4 text-light-muted dark:text-night-muted mt-1 shrink-0 stroke-[2]" />
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="add notes or context..."
                    rows={2}
                    className="w-full bg-transparent text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-light-bg dark:bg-night-elevated px-3.5 py-2.5 rounded-2xl border-2 border-light-border dark:border-night-border">
                    <Clock className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="est. time (e.g. 20 min)"
                      className="w-full bg-transparent text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-light-bg dark:bg-night-elevated px-3.5 py-2.5 rounded-2xl border-2 border-light-border dark:border-night-border">
                    <Calendar className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="deadline (e.g. Friday)"
                      className="w-full bg-transparent text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg transition-colors btn-clean"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all btn-clean ${
                title.trim()
                  ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-md hover:opacity-90'
                  : 'opacity-40 bg-light-muted/30 dark:bg-night-muted/30 text-light-muted dark:text-night-muted cursor-not-allowed'
              }`}
            >
              save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
