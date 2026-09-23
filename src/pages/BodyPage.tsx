import React, { useState } from 'react';
import {
  Zap,
  Moon,
  Activity,
  Droplets,
  Plus,
  Circle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Edit3,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SleepQuality, MovementStatus, WaterStatus, BodyWellness } from '../types';
import { formatReadableDate, toDateKey } from '../utils/date';

export const BodyPage: React.FC = () => {
  const {
    body,
    bodyEntries,
    updateBody,
    updateBodyForDate,
    toggleBodyTask,
    addBodyTask,
    deleteBodyTask,
  } = useApp();

  const todayKey = toDateKey(new Date());

  // Adding today's body task
  const [newBodyTaskTitle, setNewBodyTaskTitle] = useState('');
  const [isAddingBodyTask, setIsAddingBodyTask] = useState(false);

  // Editing historical entry state
  const [editingDateKey, setEditingDateKey] = useState<string | null>(null);
  const [editEnergy, setEditEnergy] = useState(7);
  const [editSleep, setEditSleep] = useState<SleepQuality>('Good');
  const [editMovement, setEditMovement] = useState<MovementStatus>('Planned');
  const [editWater, setEditWater] = useState<WaterStatus>('Good');
  const [editNotes, setEditNotes] = useState('');

  const handleAddBodyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBodyTaskTitle.trim()) {
      addBodyTask(newBodyTaskTitle.trim(), todayKey);
      setNewBodyTaskTitle('');
      setIsAddingBodyTask(false);
    }
  };

  const handleStartEdit = (entry: BodyWellness) => {
    setEditingDateKey(entry.date);
    setEditEnergy(entry.energy);
    setEditSleep(entry.sleep);
    setEditMovement(entry.movement);
    setEditWater(entry.water);
    setEditNotes(entry.notes || '');
  };

  const handleSaveEdit = (dateKey: string) => {
    updateBodyForDate(dateKey, {
      energy: editEnergy,
      sleep: editSleep,
      movement: editMovement,
      water: editWater,
      notes: editNotes.trim() || undefined,
    });
    setEditingDateKey(null);
  };

  // Past historical entries (excluding today if today is active at top)
  const pastEntries = bodyEntries.filter((e) => e.date !== todayKey);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-5xl sm:text-6xl text-light-text dark:text-night-text tracking-tight">
            body
          </h1>
          <p className="font-serif italic font-medium text-2xl sm:text-3xl text-light-muted dark:text-night-muted mt-1.5">
            physical wellbeing and gentle daily care
          </p>
        </div>
      </div>

      {/* SECTION 1: TODAY'S CHECK-IN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-pastel-lavender-ink dark:text-pastel-lavender">
              today's check-in
            </span>
            <span className="text-sm font-serif italic text-light-muted dark:text-night-muted">
              · {formatReadableDate(todayKey)}
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-pastel-sage-ink dark:text-pastel-sage flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pastel-sage" />
            saved in cloud
          </span>
        </div>

        <div className="bg-light-surface/70 dark:bg-night-surface/70 border-2 border-light-border/80 dark:border-night-border/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Energy scale 1-10 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-light-text dark:text-night-text flex items-center gap-2">
                <Zap className="w-4 h-4 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
                daily energy level
              </span>
              <span className="text-sm font-mono font-bold text-light-text dark:text-night-text">
                {body.energy} / 10
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateBody({ energy: num })}
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all btn-clean ${
                    body.energy === num
                      ? 'bg-pastel-yellow text-light-text font-bold shadow-xs border border-amber-500/50 dark:border-pastel-yellow dark:text-night-bg'
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text border border-light-border/60 dark:border-night-border/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Body Metrics: Sleep, Movement, Water */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sleep */}
            <div className="p-4 rounded-2xl bg-light-bg/80 dark:bg-night-elevated/80 border-2 border-light-border/60 dark:border-night-border/60 space-y-2.5">
              <span className="text-xs font-semibold text-light-muted dark:text-night-muted flex items-center gap-1.5 uppercase tracking-wider">
                <Moon className="w-4 h-4 text-pastel-lavender-ink dark:text-pastel-lavender stroke-[2]" />
                sleep
              </span>
              <div className="flex gap-1.5">
                {(['Good', 'Okay', 'Needs care'] as SleepQuality[]).map((sq) => (
                  <button
                    key={sq}
                    onClick={() => updateBody({ sleep: sq })}
                    className={`flex-1 py-1.5 rounded-xl text-xs transition-all btn-clean ${
                      body.sleep === sq
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-semibold shadow-xs'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
                    }`}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Movement */}
            <div className="p-4 rounded-2xl bg-light-bg/80 dark:bg-night-elevated/80 border-2 border-light-border/60 dark:border-night-border/60 space-y-2.5">
              <span className="text-xs font-semibold text-light-muted dark:text-night-muted flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-pastel-sage-ink dark:text-pastel-sage stroke-[2]" />
                movement
              </span>
              <div className="flex gap-1.5">
                {(['Done', 'Planned'] as MovementStatus[]).map((ms) => (
                  <button
                    key={ms}
                    onClick={() => updateBody({ movement: ms })}
                    className={`flex-1 py-1.5 rounded-xl text-xs transition-all btn-clean ${
                      body.movement === ms
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-semibold shadow-xs'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
                    }`}
                  >
                    {ms}
                  </button>
                ))}
              </div>
            </div>

            {/* Water */}
            <div className="p-4 rounded-2xl bg-light-bg/80 dark:bg-night-elevated/80 border-2 border-light-border/60 dark:border-night-border/60 space-y-2.5">
              <span className="text-xs font-semibold text-light-muted dark:text-night-muted flex items-center gap-1.5 uppercase tracking-wider">
                <Droplets className="w-4 h-4 text-pastel-blue-ink dark:text-pastel-blue stroke-[2]" />
                water
              </span>
              <div className="flex gap-1.5">
                {(['Good', 'More'] as WaterStatus[]).map((ws) => (
                  <button
                    key={ws}
                    onClick={() => updateBody({ water: ws })}
                    className={`flex-1 py-1.5 rounded-xl text-xs transition-all btn-clean ${
                      body.water === ws
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-semibold shadow-xs'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text'
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Body Care Tasks */}
          <div className="space-y-4 pt-4 border-t-2 border-light-border/60 dark:border-night-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted">
                daily body care checklist
              </span>
              {!isAddingBodyTask && (
                <button
                  onClick={() => setIsAddingBodyTask(true)}
                  className="text-xs font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text flex items-center gap-1 transition-colors btn-clean"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>add item</span>
                </button>
              )}
            </div>

            {body.tasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {body.tasks.map((bt) => (
                  <div
                    key={bt.id}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all ${
                      bt.completed
                        ? 'bg-light-bg/40 dark:bg-night-elevated/40 border-light-border/50 dark:border-night-border/50 text-light-muted dark:text-night-muted line-through'
                        : 'bg-light-bg dark:bg-night-elevated border-light-border dark:border-night-border text-light-text dark:text-night-text hover:border-pastel-lavender'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleBodyTask(bt.id, todayKey)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left btn-clean"
                    >
                      {bt.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-pastel-sage-ink dark:text-pastel-sage shrink-0 stroke-[2.2]" />
                      ) : (
                        <Circle className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                      )}
                      <span className="truncate">{bt.title}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteBodyTask(bt.id, todayKey)}
                      className="opacity-0 group-hover:opacity-100 text-light-muted dark:text-night-muted hover:text-red-400 p-1 transition-opacity btn-clean"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingBodyTask && (
                <div className="py-8 text-center border-2 border-dashed border-light-border/60 dark:border-night-border/60 rounded-2xl">
                  <p className="text-sm font-serif italic text-light-muted dark:text-night-muted">
                    no daily body care items added yet · add items like "walk 15 mins", "rest eyes", or "drink herbal tea".
                  </p>
                </div>
              )
            )}

            {isAddingBodyTask && (
              <form onSubmit={handleAddBodyTask} className="flex gap-2 pt-2 animate-fadeIn max-w-xl">
                <input
                  type="text"
                  value={newBodyTaskTitle}
                  onChange={(e) => setNewBodyTaskTitle(e.target.value)}
                  placeholder="e.g. walk 15 mins, stretch, drink tea..."
                  autoFocus
                  className="flex-1 px-4 py-2.5 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none focus:ring-1 focus:ring-pastel-lavender"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs font-semibold btn-clean"
                >
                  add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingBodyTask(false)}
                  className="px-3.5 py-2.5 text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
                >
                  cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: BODY HISTORY (Chronological, Newest First) */}
      <section className="space-y-4 pt-4 border-t-2 border-light-border/80 dark:border-night-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg uppercase tracking-widest font-bold text-pastel-lavender-ink dark:text-pastel-lavender">
              body history
            </h2>
            <p className="text-sm sm:text-base font-serif italic text-light-muted dark:text-night-muted">
              past physical check-ins and wellbeing record
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-pastel-lavender/20 text-pastel-lavender-ink dark:text-pastel-lavender border border-pastel-lavender/40">
            {bodyEntries.length} {bodyEntries.length === 1 ? 'day recorded' : 'days recorded'}
          </span>
        </div>

        {pastEntries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastEntries.map((entry) => {
              const isEditingThis = editingDateKey === entry.date;

              return (
                <div
                  key={entry.date}
                  className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm"
                >
                  {/* History Entry Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-light-border/60 dark:border-night-border/60">
                    <div className="flex items-center gap-2.5">
                      <CalendarIcon className="w-4 h-4 text-pastel-lavender-ink dark:text-pastel-lavender stroke-[2]" />
                      <h3 className="font-serif italic font-semibold text-xl sm:text-2xl text-light-text dark:text-night-text">
                        {formatReadableDate(entry.date)}
                      </h3>
                    </div>

                    {!isEditingThis ? (
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border transition-colors btn-clean"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                        <span>edit</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDateKey(null)}
                          className="px-3 py-1 rounded-xl text-xs font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>cancel</span>
                        </button>
                        <button
                          onClick={() => handleSaveEdit(entry.date)}
                          className="px-3.5 py-1 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs font-semibold btn-clean flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>save</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingThis ? (
                    /* VIEW MODE FOR PAST ENTRY */
                    <div className="space-y-3">
                      {/* Metric Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-pastel-yellow/20 border border-pastel-yellow/40 flex items-center gap-1.5 text-xs font-semibold text-light-text dark:text-pastel-yellow">
                          <Zap className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Energy: {entry.energy}/10</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-pastel-lavender/20 border border-pastel-lavender/40 flex items-center gap-1.5 text-xs font-semibold text-light-text dark:text-pastel-lavender">
                          <Moon className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Sleep: {entry.sleep}</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-pastel-sage/20 border border-pastel-sage/40 flex items-center gap-1.5 text-xs font-semibold text-light-text dark:text-pastel-sage">
                          <Activity className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Movement: {entry.movement}</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-pastel-blue/20 border border-pastel-blue/40 flex items-center gap-1.5 text-xs font-semibold text-light-text dark:text-pastel-blue">
                          <Droplets className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Water: {entry.water}</span>
                        </div>
                      </div>

                      {/* Care tasks completed on that date */}
                      {entry.tasks && entry.tasks.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-night-muted block mb-1.5">
                            body care items:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {entry.tasks.map((t) => (
                              <div
                                key={t.id}
                                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border ${
                                  t.completed
                                    ? 'bg-pastel-sage/20 border-pastel-sage/40 text-pastel-sage-ink dark:text-pastel-sage'
                                    : 'bg-light-bg dark:bg-night-elevated border-light-border/60 text-light-muted dark:text-night-muted'
                                }`}
                              >
                                <span>{t.completed ? '✓' : '○'}</span>
                                <span>{t.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.notes && (
                        <p className="text-xs font-serif italic text-light-text dark:text-night-text pt-1">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  ) : (
                    /* EDIT MODE FOR PAST ENTRY */
                    <div className="space-y-4 pt-1 animate-fadeIn">
                      {/* Edit Energy */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-light-muted dark:text-night-muted block">
                          Energy: {editEnergy}/10
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setEditEnergy(n)}
                              className={`flex-1 py-1 rounded text-xs font-mono ${
                                editEnergy === n
                                  ? 'bg-pastel-yellow text-black font-bold'
                                  : 'bg-light-bg dark:bg-night-elevated text-light-muted'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Edit Sleep, Movement, Water */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted block mb-1">
                            Sleep
                          </label>
                          <select
                            value={editSleep}
                            onChange={(e) => setEditSleep(e.target.value as SleepQuality)}
                            className="w-full p-2 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs"
                          >
                            <option value="Good">Good</option>
                            <option value="Okay">Okay</option>
                            <option value="Needs care">Needs care</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted block mb-1">
                            Movement
                          </label>
                          <select
                            value={editMovement}
                            onChange={(e) => setEditMovement(e.target.value as MovementStatus)}
                            className="w-full p-2 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs"
                          >
                            <option value="Done">Done</option>
                            <option value="Planned">Planned</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted block mb-1">
                            Water
                          </label>
                          <select
                            value={editWater}
                            onChange={(e) => setEditWater(e.target.value as WaterStatus)}
                            className="w-full p-2 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs"
                          >
                            <option value="Good">Good</option>
                            <option value="More">More</option>
                          </select>
                        </div>
                      </div>

                      {/* Edit Notes */}
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-light-muted block mb-1">
                          Notes / Feeling
                        </label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="how your body felt on this day..."
                          className="w-full p-2.5 rounded-xl bg-light-bg dark:bg-night-elevated border border-light-border dark:border-night-border text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-light-border/60 dark:border-night-border/60 rounded-3xl">
            <p className="font-serif italic text-lg sm:text-xl text-light-muted dark:text-night-muted">
              No previous body history recorded yet. Daily check-ins will build your timeline here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
