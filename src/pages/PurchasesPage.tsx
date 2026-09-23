import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  FileText,
  RotateCcw,
  Ban,
  Archive,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem } from '../types';
import {
  getPurchaseAgeInfo,
  getCompactPurchaseStyles,
  getPurchasedCompactStyles,
  getDiscardedCompactStyles,
} from '../utils/purchaseColors';
import { formatReadableDate, toDateKey } from '../utils/date';

export const PurchasesPage: React.FC = () => {
  const {
    purchases,
    addPurchaseItem,
    updatePurchaseItem,
    togglePurchaseStatus,
    discardPurchaseItem,
    restorePurchaseItem,
    deletePurchaseItem,
    settings,
  } = useApp();

  const theme = settings.theme;

  // Quick Add State
  const [isAddingExpanded, setIsAddingExpanded] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Expanded Notes for viewing
  const [expandedNotesIds, setExpandedNotesIds] = useState<Record<string, boolean>>({});

  // History sub-filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'purchased' | 'discarded'>('all');

  // Active vs History Items
  const activeItems = purchases.filter((p) => p.status === 'active');
  const purchasedItems = purchases.filter((p) => p.status === 'purchased');
  const discardedItems = purchases.filter((p) => p.status === 'discarded');
  const historyItems = purchases.filter((p) => p.status === 'purchased' || p.status === 'discarded');

  const filteredHistoryItems = historyItems.filter((item) => {
    if (historyFilter === 'purchased') return item.status === 'purchased';
    if (historyFilter === 'discarded') return item.status === 'discarded';
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPurchaseItem(name.trim(), notes.trim() || undefined);
    setName('');
    setNotes('');
    setIsAddingExpanded(false);
  };

  const handleStartEdit = (item: PurchaseItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updatePurchaseItem(id, {
      name: editName.trim(),
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const toggleExpandNote = (id: string) => {
    setExpandedNotesIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b-2 border-light-border/70 dark:border-night-border/70 pb-4">
        <div>
          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight flex items-center gap-2">
            <span>purchase list</span>
            <span className="text-pastel-yellow-ink dark:text-pastel-yellow not-italic text-2xl">✦</span>
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-light-muted dark:text-night-muted mt-0.5">
            things i want to acquire
          </p>
        </div>

        {/* Small count indicator */}
        <span className="font-serif italic text-xs sm:text-sm text-light-muted dark:text-night-muted">
          {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} waiting
        </span>
      </div>

      {/* Main Grid: 2 columns on desktop (Active items on left, History archive on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Quick-add & Active Purchase checklist */}
        <div className="lg:col-span-7 space-y-6">

      {/* Compact Quick-Add Bar */}
      <form
        onSubmit={handleAddSubmit}
        className="bg-light-surface/90 dark:bg-night-surface/90 border-2 border-light-border dark:border-night-border rounded-2xl p-2.5 sm:p-3 shadow-xs transition-all space-y-2"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsAddingExpanded(true)}
            placeholder="add something to purchase list..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm sm:text-base font-medium text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg disabled:opacity-30 transition-all btn-clean shrink-0"
            title="Add item"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Expandable note field */}
        {isAddingExpanded && (
          <div className="pt-2 border-t border-light-border/60 dark:border-night-border/60 space-y-2 animate-fadeIn">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional notes (specs, budget, link...)"
              rows={2}
              className="w-full bg-light-bg/70 dark:bg-night-elevated/70 px-3 py-1.5 text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border border-light-border dark:border-night-border rounded-xl focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif italic text-light-muted/70 dark:text-night-muted/70">
                press enter or click + to save
              </span>
              <button
                type="button"
                onClick={() => {
                  setName('');
                  setNotes('');
                  setIsAddingExpanded(false);
                }}
                className="text-light-muted hover:text-light-text dark:hover:text-night-text px-2 py-0.5 btn-clean"
              >
                cancel
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Active Purchases List (Compact Checklist Style) */}
      <div className="space-y-1.5">
        {activeItems.map((item) => {
          const ageInfo = getPurchaseAgeInfo(item.created_at);
          const styles = getCompactPurchaseStyles(ageInfo.ageDays, theme);
          const isEditing = editingId === item.id;
          const isNoteExpanded = !!expandedNotesIds[item.id];
          const formattedDate = formatReadableDate(toDateKey(item.created_at));

          if (isEditing) {
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border-2 space-y-2 transition-all shadow-xs ${styles.rowClass}`}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-light-bg/90 dark:bg-night-elevated/90 text-light-text dark:text-night-text border border-light-border dark:border-night-border rounded-xl text-sm font-semibold focus:outline-none"
                  autoFocus
                />
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="optional notes..."
                  rows={2}
                  className="w-full px-3 py-1.5 bg-light-bg/90 dark:bg-night-elevated/90 text-light-text dark:text-night-text border border-light-border dark:border-night-border rounded-xl text-xs focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-serif italic opacity-70">
                    added {formattedDate} (date preserved)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium hover:opacity-75 btn-clean"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-3 py-1 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-lg text-xs font-bold btn-clean shadow-xs"
                    >
                      save
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`group px-3 py-2 sm:py-2.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 ${styles.rowClass}`}
            >
              <div className="flex items-center justify-between gap-2.5">
                {/* Left side: Accent Pill + Checkbox + Title */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  {/* Subtle vertical age accent pill */}
                  <span
                    className={`w-1 h-4 sm:h-5 rounded-full shrink-0 ${styles.pillClass}`}
                    title={ageInfo.ageLabel}
                  />

                  {/* Mark as Purchased Toggle Circle */}
                  <button
                    onClick={() => togglePurchaseStatus(item.id)}
                    className="text-light-muted/80 dark:text-night-muted/80 hover:text-green-600 dark:hover:text-green-400 transition-colors btn-clean shrink-0 p-0.5"
                    title="Mark as purchased"
                  >
                    <Circle className="w-4 h-4 stroke-[2]" />
                  </button>

                  {/* Item Name */}
                  <span
                    className={`text-sm sm:text-base font-sans font-medium tracking-tight truncate flex-1 min-w-0 ${styles.titleClass}`}
                    title={item.name}
                  >
                    {item.name}
                  </span>

                  {/* Note toggle indicator if notes exist */}
                  {item.notes && (
                    <button
                      onClick={() => toggleExpandNote(item.id)}
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all btn-clean shrink-0 ${
                        isNoteExpanded
                          ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg'
                          : 'bg-light-bg/80 dark:bg-night-elevated/80 text-light-muted dark:text-night-muted border-light-border dark:border-night-border hover:text-light-text dark:hover:text-night-text'
                      }`}
                      title={isNoteExpanded ? 'Hide notes' : 'View notes'}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="hidden sm:inline">notes</span>
                    </button>
                  )}
                </div>

                {/* Right side: Age Badge + Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Compact Age Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold uppercase tracking-wider shrink-0 ${styles.badgeClass}`}
                    title={`${ageInfo.ageLabel} (${formattedDate})`}
                  >
                    {ageInfo.badgeLabel}
                  </span>

                  {/* Discard Action (Decided not to buy) */}
                  <button
                    onClick={() => discardPurchaseItem(item.id)}
                    className="p-1 rounded-md text-light-muted dark:text-night-muted hover:text-amber-600 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                    title="Decided not to buy (move to discarded history)"
                  >
                    <Ban className="w-3.5 h-3.5 stroke-[2]" />
                  </button>

                  {/* Edit Action */}
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1 rounded-md text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 stroke-[2]" />
                  </button>

                  {/* Delete Action */}
                  <button
                    onClick={() => deletePurchaseItem(item.id)}
                    className="p-1 rounded-md text-light-muted dark:text-night-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>

              {/* Expandable note content */}
              {item.notes && isNoteExpanded && (
                <div className="pl-8 pr-2 py-1.5 text-xs leading-relaxed border-t border-black/5 dark:border-white/5 animate-fadeIn">
                  <p className={`whitespace-pre-wrap font-sans ${styles.notesClass}`}>
                    {item.notes}
                  </p>
                  <span className={`text-[10px] font-serif italic ${styles.timeClass}`}>
                    {ageInfo.ageLabel} · {formattedDate}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeItems.length === 0 && (
        <div className="p-8 text-center bg-light-surface/50 dark:bg-night-surface/50 rounded-2xl border-2 border-dashed border-light-border dark:border-night-border space-y-1">
          <p className="font-serif italic text-xl text-light-muted dark:text-night-muted">
            no items on your purchase list
          </p>
          <p className="font-serif italic text-xs text-light-muted/70 dark:text-night-muted/70">
            capture things you want to buy · watch them age before deciding
          </p>
        </div>
      )}
        </div>

        {/* Right Column (5 cols): History Archive & Decision Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-light-surface/70 dark:bg-night-surface/70 border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b-2 border-light-border/70 dark:border-night-border/70">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-pastel-mauve-ink dark:text-pastel-mauve stroke-[2]" />
                <h2 className="text-xs uppercase tracking-widest font-bold text-pastel-mauve-ink dark:text-pastel-mauve">
                  purchase history
                </h2>
              </div>
              {/* Quick stats pills */}
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-light-muted dark:text-night-muted">
                <span className="text-green-600 dark:text-green-400">{purchasedItems.length} bought</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400">{discardedItems.length} saved</span>
              </div>
            </div>

            {historyItems.length > 0 ? (
              <div className="space-y-3">
                {/* History Sub-filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-light-bg/70 dark:bg-night-elevated/70 border border-light-border/70 dark:border-night-border/70 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('all')}
                    className={`flex-1 py-1 px-2 rounded-lg font-sans text-xs transition-all btn-clean ${
                      historyFilter === 'all'
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs font-semibold'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text font-medium'
                    }`}
                  >
                    all ({historyItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('purchased')}
                    className={`flex-1 py-1 px-2 rounded-lg font-sans text-xs transition-all btn-clean ${
                      historyFilter === 'purchased'
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs font-semibold'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text font-medium'
                    }`}
                  >
                    bought ({purchasedItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('discarded')}
                    className={`flex-1 py-1 px-2 rounded-lg font-sans text-xs transition-all btn-clean ${
                      historyFilter === 'discarded'
                        ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg shadow-xs font-semibold'
                        : 'text-light-muted dark:text-night-muted hover:text-light-text font-medium'
                    }`}
                  >
                    discarded ({discardedItems.length})
                  </button>
                </div>

                {/* History Items List */}
                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
                  {filteredHistoryItems.map((item) => {
                    const isPurchased = item.status === 'purchased';
                    const styles = isPurchased
                      ? getPurchasedCompactStyles(theme)
                      : getDiscardedCompactStyles(theme);

                    const addedDate = formatReadableDate(toDateKey(item.created_at));
                    const actionDate = isPurchased
                      ? (item.purchased_at ? formatReadableDate(toDateKey(item.purchased_at)) : 'recently')
                      : (item.discarded_at ? formatReadableDate(toDateKey(item.discarded_at)) : 'recently');

                    return (
                      <div
                        key={item.id}
                        className={`group px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${styles.rowClass}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isPurchased ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 stroke-[2]" />
                          ) : (
                            <Ban className="w-3.5 h-3.5 text-amber-600/80 dark:text-amber-400/80 shrink-0 stroke-[2]" />
                          )}

                          <span
                            className={`truncate flex-1 min-w-0 font-medium ${styles.titleClass}`}
                            title={item.name}
                          >
                            {item.name}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider shrink-0 ${
                              isPurchased
                                ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {isPurchased ? 'bought' : 'discarded'}
                          </span>

                          <span className={`text-[11px] font-serif italic shrink-0 hidden sm:inline ${styles.timeClass}`}>
                            {isPurchased ? 'bought' : 'discarded'} {actionDate} · added {addedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => restorePurchaseItem(item.id)}
                            className="p-1 text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                            title="Restore to active purchase list"
                          >
                            <RotateCcw className="w-3 h-3 stroke-[2]" />
                          </button>
                          <button
                            onClick={() => deletePurchaseItem(item.id)}
                            className="p-1 text-light-muted dark:text-night-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity btn-clean"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3 h-3 stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredHistoryItems.length === 0 && (
                    <p className="text-center py-4 text-xs font-serif italic text-light-muted dark:text-night-muted">
                      no {historyFilter === 'all' ? 'history' : historyFilter} items found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs font-serif italic text-light-muted dark:text-night-muted py-3 text-center">
                as you purchase or discard items, they will be archived here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
