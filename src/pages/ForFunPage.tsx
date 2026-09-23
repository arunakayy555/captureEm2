import React, { useState } from 'react';
import { Plus, Play, Trash2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ForFunPage: React.FC = () => {
  const { forFunItems, addForFunItem, deleteForFunItem, startFocusWithTask } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30 min');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addForFunItem(title.trim(), duration.trim() || undefined);
    setTitle('');
    setIsAdding(false);
  };

  const parseDurationMinutes = (durStr?: string) => {
    if (!durStr) return 30;
    const match = durStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 30;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-5xl sm:text-6xl text-light-text dark:text-night-text tracking-tight">
            for fun
          </h1>
          <p className="font-serif italic font-medium text-2xl sm:text-3xl text-light-muted dark:text-night-muted mt-1.5">
            things i feel like doing
          </p>
        </div>


        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all shadow-sm btn-clean"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>add activity</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 space-y-4 shadow-sm animate-fadeIn"
        >
          <span className="text-xs uppercase tracking-widest font-bold text-pastel-pink-ink dark:text-pastel-pink">
            add something enjoyable
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. sketching, cello, baking, film study..."
              autoFocus
              className="sm:col-span-2 px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-pastel-pink"
            />
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="duration (e.g. 25 min)"
              className="px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-pastel-pink"
            />
          </div>

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
              className="px-5 py-2.5 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 btn-clean shadow-xs"
            >
              save
            </button>
          </div>
        </form>
      )}

      {/* Grid of Fun Activities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {forFunItems.map((item) => (
          <div
            key={item.id}
            className="group p-6 rounded-3xl bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border hover:border-pastel-pink/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text">
                  {item.title}
                </h3>
                {item.duration && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-light-muted dark:text-night-muted mt-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 stroke-[2]" />
                    {item.duration}
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteForFunItem(item.id)}
                className="p-1.5 rounded-lg text-light-muted dark:text-night-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <div className="pt-4 mt-3 flex items-center justify-between border-t-2 border-light-border/70 dark:border-night-border/70">
              <span className="text-xs font-serif italic text-light-muted dark:text-night-muted">
                enjoy at your own pace
              </span>

              <button
                onClick={() =>
                  startFocusWithTask(item.title, parseDurationMinutes(item.duration))
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-light-bg dark:bg-night-elevated text-xs sm:text-sm font-semibold text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-pink transition-all btn-clean"
              >
                <Play className="w-3.5 h-3.5 fill-current text-pastel-pink-ink dark:text-pastel-pink" />
                <span>start timer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {forFunItems.length === 0 && (
        <div className="p-8 text-center bg-light-surface/60 dark:bg-night-surface/60 rounded-3xl border-2 border-dashed border-light-border dark:border-night-border">
          <p className="font-serif italic text-xl text-light-muted dark:text-night-muted">
            no activities added yet. add something you love doing.
          </p>
        </div>
      )}
    </div>
  );
};
