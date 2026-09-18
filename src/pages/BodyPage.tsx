import React, { useState } from 'react';
import {
  Zap,
  Moon,
  Activity,
  Droplets,
  Plus,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SleepQuality, MovementStatus, WaterStatus } from '../types';

export const BodyPage: React.FC = () => {
  const {
    body,
    updateBody,
    toggleBodyTask,
    addBodyTask,
  } = useApp();

  const [newBodyTaskTitle, setNewBodyTaskTitle] = useState('');
  const [isAddingBodyTask, setIsAddingBodyTask] = useState(false);

  const handleAddBodyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBodyTaskTitle.trim()) {
      addBodyTask(newBodyTaskTitle.trim());
      setNewBodyTaskTitle('');
      setIsAddingBodyTask(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight">
            body
          </h1>
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-light-muted dark:text-night-muted mt-1">
            physical wellbeing and gentle daily care
          </p>
        </div>
      </div>

      {/* Main Body Wellbeing Card */}
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
                <button
                  key={bt.id}
                  onClick={() => toggleBodyTask(bt.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all btn-clean ${
                    bt.completed
                      ? 'bg-light-bg/40 dark:bg-night-elevated/40 border-light-border/50 dark:border-night-border/50 text-light-muted dark:text-night-muted line-through'
                      : 'bg-light-bg dark:bg-night-elevated border-light-border dark:border-night-border text-light-text dark:text-night-text hover:border-pastel-lavender'
                  }`}
                >
                  {bt.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-pastel-sage-ink dark:text-pastel-sage shrink-0 stroke-[2.2]" />
                  ) : (
                    <Circle className="w-4 h-4 text-light-muted dark:text-night-muted shrink-0 stroke-[2]" />
                  )}
                  <span className="truncate">{bt.title}</span>
                </button>
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
    </div>
  );
};
