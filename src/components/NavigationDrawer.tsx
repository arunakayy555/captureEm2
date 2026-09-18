import React, { useEffect, useRef } from 'react';
import {
  Home,
  Timer,
  CheckSquare,
  Layers,
  Activity,
  Smile,
  CalendarCheck,
  Moon,
  Sun,
  X,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../types';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'home', icon: Home, accentColor: 'text-pastel-yellow-ink dark:text-pastel-yellow' },
  { id: 'focus', label: 'focus', icon: Timer, accentColor: 'text-pastel-blue-ink dark:text-pastel-blue' },
  { id: 'tasks', label: 'things i got to do', icon: CheckSquare, accentColor: 'text-pastel-sage-ink dark:text-pastel-sage' },
  { id: 'projects', label: 'projects', icon: Layers, accentColor: 'text-pastel-mauve-ink dark:text-pastel-mauve' },
  { id: 'body', label: 'body', icon: Activity, accentColor: 'text-pastel-lavender-ink dark:text-pastel-lavender' },
  { id: 'for_fun', label: 'for fun', icon: Smile, accentColor: 'text-pastel-pink-ink dark:text-pastel-pink' },
  { id: 'review', label: 'so far', icon: CalendarCheck, accentColor: 'text-pastel-lavender-ink dark:text-pastel-lavender' },
];

export const NavigationDrawer: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen, page, setPage, settings, toggleTheme } = useApp();
  const { user, signOut } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsDrawerOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, setIsDrawerOpen]);

  const handleSelectPage = (targetPage: PageId) => {
    setPage(targetPage);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <aside
        ref={drawerRef}
        aria-label="Navigation drawer"
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-light-surface dark:bg-night-surface border-r-2 border-light-border dark:border-night-border shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-6 border-b-2 border-light-border dark:border-night-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-pastel-yellow-ink dark:text-pastel-yellow text-base font-semibold">✦</span>
            <span className="font-serif italic font-semibold text-3xl text-light-text dark:text-night-text tracking-tight">
              my space
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close drawer"
            className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isCurrent = page === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPage(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-150 btn-clean ${
                  isCurrent
                    ? 'bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text font-semibold border-2 border-light-border dark:border-night-border shadow-xs'
                    : 'text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg/70 dark:hover:bg-night-bg/70 border-2 border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 stroke-[2] ${
                    isCurrent ? item.accentColor : 'text-light-muted dark:text-night-muted'
                  }`}
                />
                <span className="text-base lowercase tracking-wide">{item.label}</span>
                {isCurrent && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-pastel-yellow-ink dark:bg-pastel-yellow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom footer: Light / Night switch & Account Logout */}
        <div className="p-5 border-t-2 border-light-border dark:border-night-border bg-light-bg/60 dark:bg-night-bg/60 space-y-2.5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-light-surface dark:bg-night-elevated border-2 border-light-border dark:border-night-border text-xs text-light-text dark:text-night-text hover:border-pastel-yellow transition-all duration-200 btn-clean"
          >
            <div className="flex items-center gap-2.5">
              {settings.theme === 'night' ? (
                <Moon className="w-4 h-4 text-pastel-lavender-ink dark:text-pastel-lavender stroke-[2]" />
              ) : (
                <Sun className="w-4 h-4 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
              )}
              <span className="lowercase font-sans text-xs font-semibold tracking-wider text-light-muted dark:text-night-muted">
                {settings.theme === 'night' ? 'night mode' : 'light mode'}
              </span>
            </div>
            <span className="font-serif italic font-semibold text-xs text-light-muted dark:text-night-muted">
              {settings.theme === 'night' ? 'ink black' : 'warm cream'}
            </span>
          </button>

          {user && (
            <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-light-surface/60 dark:bg-night-elevated/60 border border-light-border/60 dark:border-night-border/60 text-xs">
              <span className="truncate max-w-[160px] font-sans text-light-muted dark:text-night-muted" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={async () => {
                  setIsDrawerOpen(false);
                  await signOut();
                }}
                className="inline-flex items-center gap-1 text-light-muted dark:text-night-muted hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors btn-clean"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                <span>logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
