import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Check,
  Plus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const FocusPage: React.FC = () => {
  const {
    activeFocusTask,
    setActiveFocusTask,
    activeFocusDuration,
    setActiveFocusDuration,
    nextTasks,
    setTaskAsRightNow,
    addTask,
    logFocusSession,
    settings,
    updateSettings,
    setPage,
  } = useApp();

  // State: 'setup' | 'active' | 'completed'
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'completed'>('setup');
  const [secondsRemaining, setSecondsRemaining] = useState(activeFocusDuration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [lastActualSeconds, setLastActualSeconds] = useState(0);

  // Quick capture during active focus state
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedThought, setCapturedThought] = useState('');
  const [justSavedNotice, setJustSavedNotice] = useState(false);
  const [sessionThoughts, setSessionThoughts] = useState<string[]>([]);
  const sessionLoggedRef = useRef(false);
  const captureInputRef = useRef<HTMLInputElement>(null);

  // Refs for tracking during unmount / early exit
  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;
  const secondsRemainingRef = useRef(secondsRemaining);
  secondsRemainingRef.current = secondsRemaining;
  const plannedDurationRef = useRef(activeFocusDuration);
  plannedDurationRef.current = activeFocusDuration;
  const taskTitleRef = useRef(activeFocusTask);
  taskTitleRef.current = activeFocusTask;

  // Focus duration presets
  const DURATION_PRESETS = [15, 25, 45, 60];

  // Sync duration with seconds when in setup
  useEffect(() => {
    if (sessionState === 'setup') {
      setSecondsRemaining(activeFocusDuration * 60);
      sessionLoggedRef.current = false;
    }
  }, [activeFocusDuration, sessionState]);

  // Active timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'active' && !isPaused && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (sessionState === 'active' && secondsRemaining === 0) {
      handleCompleteSession();
    }
    return () => clearInterval(interval);
  }, [sessionState, isPaused, secondsRemaining]);

  // Auto-record focused time if user navigates away or unmounts during active focus
  useEffect(() => {
    return () => {
      if (sessionStateRef.current === 'active' && !sessionLoggedRef.current) {
        const plannedSecs = plannedDurationRef.current * 60;
        const elapsed = plannedSecs - secondsRemainingRef.current;
        if (elapsed >= 5) {
          sessionLoggedRef.current = true;
          const actualMins = Math.max(1, Math.round(elapsed / 60));
          logFocusSession(
            taskTitleRef.current,
            actualMins,
            true,
            undefined,
            undefined,
            undefined,
            plannedDurationRef.current,
            elapsed
          );
        }
      }
    };
  }, []);

  // Focus input when capturing
  useEffect(() => {
    if (isCapturing) {
      setTimeout(() => {
        captureInputRef.current?.focus();
      }, 50);
    }
  }, [isCapturing]);

  const handleStartSession = () => {
    setSecondsRemaining(activeFocusDuration * 60);
    setSessionState('active');
    setIsPaused(false);
    setSessionThoughts([]);
    sessionLoggedRef.current = false;
    if (settings.soundEnabled) {
      sound.playStart();
    }
  };

  const handleCompleteSession = () => {
    if (sessionLoggedRef.current) return;
    sessionLoggedRef.current = true;
    setSessionState('completed');

    // Calculate ACTUAL elapsed focused duration (accounting for early exit / finish)
    const plannedSecs = activeFocusDuration * 60;
    const elapsedSecs = secondsRemaining === 0
      ? plannedSecs
      : Math.max(1, plannedSecs - secondsRemaining);

    setLastActualSeconds(elapsedSecs);

    const actualDurationMinutes = secondsRemaining === 0
      ? activeFocusDuration
      : Math.max(1, Math.round(elapsedSecs / 60));

    const notes = sessionThoughts.length > 0 ? sessionThoughts.join('; ') : undefined;

    logFocusSession(
      activeFocusTask,
      actualDurationMinutes,
      true,
      notes,
      undefined,
      undefined,
      activeFocusDuration,
      elapsedSecs
    );

    if (settings.soundEnabled) {
      sound.playComplete();
    }
  };

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    const thought = capturedThought.trim();
    if (!thought) return;

    addTask({
      title: thought,
      section: 'later',
    });

    setSessionThoughts((prev) => [...prev, thought]);
    setCapturedThought('');
    setIsCapturing(false);
    setJustSavedNotice(true);
    setTimeout(() => {
      setJustSavedNotice(false);
    }, 2000);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalSeconds = activeFocusDuration * 60;
  const progressRatio = (totalSeconds - secondsRemaining) / (totalSeconds || 1);

  // Render Setup Screen
  if (sessionState === 'setup') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center space-y-12 animate-fadeIn">
        <div className="space-y-2">
          <p className="font-serif italic font-medium text-xl text-pastel-yellow-ink dark:text-pastel-yellow">
            let's begin
          </p>
          <h1 className="text-xs uppercase tracking-widest font-bold text-light-muted dark:text-night-muted">
            current focus
          </h1>
        </div>

        {/* Task Title & Duration */}
        <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <input
            type="text"
            value={activeFocusTask}
            onChange={(e) => setActiveFocusTask(e.target.value)}
            placeholder="what will you focus on?"
            className="w-full text-center font-serif italic font-semibold text-3xl sm:text-4xl text-light-text dark:text-night-text bg-transparent border-b-2 border-light-border dark:border-night-border pb-3 focus:outline-none focus:border-pastel-yellow transition-colors"
          />

          {/* Duration Presets */}
          <div className="space-y-2.5 pt-3 border-t-2 border-light-border/70 dark:border-night-border/70">
            <span className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted">
              duration
            </span>
            <div className="flex items-center justify-center gap-2.5">
              {DURATION_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setActiveFocusDuration(mins)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-mono transition-all btn-clean ${
                    activeFocusDuration === mins
                      ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg font-bold shadow-xs'
                      : 'bg-light-bg dark:bg-night-elevated text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text border-2 border-light-border/80 dark:border-night-border/80'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button & Sound Toggle */}
        <div className="space-y-4">
          <button
            onClick={handleStartSession}
            disabled={!activeFocusTask.trim()}
            className={`w-full sm:w-64 mx-auto py-4 rounded-2xl text-base font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md btn-clean ${
              activeFocusTask.trim()
                ? 'bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg hover:opacity-90'
                : 'opacity-40 bg-light-muted dark:bg-night-muted cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>start focus</span>
          </button>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className="text-xs font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text flex items-center gap-1.5 transition-colors"
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-pastel-yellow-ink dark:text-pastel-yellow stroke-[2]" />
                  <span>subtle sound on</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 stroke-[2]" />
                  <span>sound muted</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Completed Screen
  if (sessionState === 'completed') {
    const upcoming = nextTasks[0];
    const actualText = lastActualSeconds >= 60
      ? `${Math.round(lastActualSeconds / 60)} minutes`
      : `${lastActualSeconds} seconds`;

    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage mx-auto flex items-center justify-center border-2 border-pastel-sage/40">
          <Check className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif italic font-semibold text-5xl text-light-text dark:text-night-text">
            done
          </h1>
          <p className="text-base text-light-muted dark:text-night-muted font-normal">
            session recorded · {actualText} of calm focus
          </p>
        </div>

        {/* What's next preview */}
        {upcoming ? (
          <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 text-left space-y-3 shadow-sm">
            <span className="text-xs uppercase tracking-widest text-pastel-blue-ink dark:text-pastel-blue font-bold">
              what's next
            </span>
            <h3 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text">
              {upcoming.title}
            </h3>
            {upcoming.note && (
              <p className="text-sm text-light-muted dark:text-night-muted">
                {upcoming.note}
              </p>
            )}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveFocusTask(upcoming.title);
                  setTaskAsRightNow(upcoming.id);
                  setSessionState('setup');
                }}
                className="px-5 py-2.5 rounded-xl bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all btn-clean shadow-sm"
              >
                focus on this next
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-light-surface/60 dark:bg-night-surface/60 border-2 border-light-border dark:border-night-border">
            <p className="font-serif italic text-xl text-light-muted dark:text-night-muted">
              nothing queued next. enjoy some free time or creative fun.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage('for_fun')}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-light-text dark:text-night-text bg-light-bg dark:bg-night-elevated border-2 border-light-border dark:border-night-border hover:border-pastel-pink transition-all btn-clean"
          >
            do something for fun
          </button>
          <button
            onClick={() => {
              setSessionState('setup');
              setPage('home');
            }}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text transition-colors btn-clean"
          >
            back to home
          </button>
        </div>
      </div>
    );
  }

  // Render Minimal Focus Mode Screen (Show ONLY: Main focus title, Timer, Pause, Finish/Complete, Small "+ save a thought" action)
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-12 relative animate-fadeIn select-none">
      {/* Generous whitespace container */}
      <div className="w-full max-w-lg flex flex-col items-center text-center space-y-10 sm:space-y-12">
        
        {/* Main Focus Title (Dominant element) */}
        <div className="space-y-1.5 px-4">
          <span className="text-xs uppercase tracking-widest font-bold text-pastel-yellow-ink dark:text-pastel-yellow">
            focusing on
          </span>
          <h1 className="font-serif italic font-semibold text-3xl sm:text-4xl md:text-5xl text-light-text dark:text-night-text leading-tight max-w-md mx-auto">
            {activeFocusTask}
          </h1>
        </div>

        {/* Spacious Circular Timer (Dominant element) */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-light-border/60 dark:text-night-border/60 stroke-current"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-pastel-yellow stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="3"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 * (1 - progressRatio)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="font-mono text-5xl sm:text-6xl font-light tracking-widest text-light-text dark:text-night-text">
              {formatTimer(secondsRemaining)}
            </div>
            {isPaused && (
              <span className="font-serif italic font-semibold text-sm text-pastel-lavender-ink dark:text-pastel-lavender mt-2">
                paused
              </span>
            )}
          </div>
        </div>

        {/* Minimal Controls: Pause & Finish */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border text-xs sm:text-sm font-semibold text-light-text dark:text-night-text hover:border-pastel-yellow transition-all btn-clean shadow-xs"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-pastel-yellow-ink dark:text-pastel-yellow" />
                <span>resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>pause</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteSession}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all btn-clean shadow-md"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>finish</span>
          </button>
        </div>

        {/* Small "+ save a thought" inline quick-capture action */}
        <div className="w-full max-w-sm pt-2">
          {!isCapturing ? (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setIsCapturing(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-surface dark:hover:bg-night-surface border-2 border-dashed border-light-border/80 dark:border-night-border/80 transition-all btn-clean"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                <span>+ save a thought</span>
              </button>
              {justSavedNotice && (
                <span className="font-serif italic font-semibold text-xs text-pastel-sage-ink dark:text-pastel-sage mt-2 animate-fadeIn">
                  saved · return to focus
                </span>
              )}
            </div>
          ) : (
            <form onSubmit={handleQuickCapture} className="space-y-2 bg-light-surface dark:bg-night-surface p-3 rounded-2xl border-2 border-light-border dark:border-night-border shadow-xl animate-fadeIn">
              <input
                ref={captureInputRef}
                type="text"
                value={capturedThought}
                onChange={(e) => setCapturedThought(e.target.value)}
                placeholder="what came to mind?..."
                className="w-full px-3 py-2 bg-light-bg dark:bg-night-elevated text-xs text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border border-light-border dark:border-night-border rounded-xl focus:outline-none focus:ring-1 focus:ring-pastel-yellow font-medium"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCapturing(false);
                    setCapturedThought('');
                  }}
                  className="px-2.5 py-1 text-[11px] text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={!capturedThought.trim()}
                  className="px-3.5 py-1 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-[11px] font-semibold disabled:opacity-40 btn-clean shadow-xs"
                >
                  save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
