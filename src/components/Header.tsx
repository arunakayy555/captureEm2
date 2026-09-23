import React, { useState, useEffect } from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentFormattedDate } from '../utils/date';

export const Header: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen, setIsQuickAddOpen, setIsResetOpen, page } = useApp();
  const [today, setToday] = useState(() => getCurrentFormattedDate());

  // Automatically update the date when the calendar day changes
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(getCurrentFormattedDate());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (page) {
      case 'home':
        return 'my space';
      case 'focus':
        return 'focus';
      case 'tasks':
        return 'things i got to do';
      case 'projects':
        return 'things i\'m making';
      case 'purchases':
        return 'purchase list';
      case 'body':
        return 'body';
      case 'for_fun':
        return 'for fun';
      case 'review':
        return 'calendar & so far';
      default:
        return 'my space';
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 bg-light-bg/90 dark:bg-night-bg/90 border-b-2 border-light-border dark:border-night-border transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Single menu button and Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="app-header-menu-btn"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            aria-label="Open navigation menu"
            className="p-2.5 -ml-2 rounded-xl text-light-text dark:text-night-text hover:bg-light-surface dark:hover:bg-night-surface border-2 border-transparent hover:border-light-border dark:hover:border-night-border transition-all duration-200 btn-clean focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <span
            id="app-header-title"
            className="font-serif italic font-semibold text-2xl sm:text-3xl tracking-tight text-light-text dark:text-night-text select-none"
          >
            {getPageTitle()}
          </span>
        </div>

        {/* Right actions: Subtle Date, Workspace reset & Quick add */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Persistent Current Date Display */}
          <div className="hidden md:flex flex-col items-end mr-1 select-none pointer-events-none text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-light-muted/80 dark:text-night-muted/80 leading-none">
              {today.dayName}
            </span>
            <span className="font-serif italic text-xs sm:text-sm text-light-text/90 dark:text-night-text/90 mt-0.5 leading-tight">
              {today.dateStr}
            </span>
          </div>

          {/* Workspace reset button */}
          <button
            onClick={() => setIsResetOpen(true)}
            title="2-minute workspace reset"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-surface dark:hover:bg-night-surface border-2 border-light-border dark:border-night-border transition-all duration-150 btn-clean"
          >
            <Sparkles className="w-3.5 h-3.5 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
            <span>reset</span>
          </button>

          {/* Quick capture button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg hover:opacity-90 transition-all duration-150 btn-clean shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">thing to do</span>
            <span className="xs:hidden">add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
