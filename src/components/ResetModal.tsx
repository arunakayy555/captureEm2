import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const ResetModal: React.FC = () => {
  const { isResetOpen, setIsResetOpen, settings, setPage } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isResetOpen) {
      setSecondsRemaining(120);
      setIsRunning(true);
      setIsFinished(false);
    }
  }, [isResetOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      if (settings.soundEnabled) {
        sound.playComplete();
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining, settings.soundEnabled]);

  if (!isResetOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progressPercent = ((120 - secondsRemaining) / 120) * 100;

  const handleStartFocus = () => {
    setIsResetOpen(false);
    setPage('focus');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsResetOpen(false)}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {!isFinished ? (
          <div>
            <div className="inline-flex p-3 rounded-2xl bg-light-bg dark:bg-night-elevated text-pastel-yellow-ink dark:text-pastel-yellow mb-4 border-2 border-light-border dark:border-night-border">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>

            <h2 className="font-serif italic font-semibold text-4xl text-light-text dark:text-night-text tracking-tight mb-2">
              reset
            </h2>
            <p className="font-serif italic font-medium text-xl text-pastel-lavender-ink dark:text-pastel-lavender mb-6">
              let's make your workspace ready
            </p>

            {/* Step list */}
            <div className="space-y-3.5 text-left bg-light-bg dark:bg-night-elevated/80 p-5 rounded-2xl border-2 border-light-border/80 dark:border-night-border/80 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pastel-yellow/20 text-pastel-yellow-ink dark:text-pastel-yellow text-xs font-bold flex items-center justify-center border border-pastel-yellow/40">
                  1
                </span>
                <span className="text-sm font-medium text-light-text dark:text-night-text">
                  Clear the working surface
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pastel-blue/20 text-pastel-blue-ink dark:text-pastel-blue text-xs font-bold flex items-center justify-center border border-pastel-blue/40">
                  2
                </span>
                <span className="text-sm font-medium text-light-text dark:text-night-text">
                  Keep today's essentials nearby
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-pastel-pink/20 text-pastel-pink-ink dark:text-pastel-pink text-xs font-bold flex items-center justify-center border border-pastel-pink/40">
                  3
                </span>
                <span className="text-sm font-medium text-light-text dark:text-night-text">
                  Put everything else away
                </span>
              </div>
            </div>

            {/* Timer countdown */}
            <div className="my-6">
              <div className="font-mono text-5xl font-light tracking-widest text-light-text dark:text-night-text">
                {formattedTime}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-light-border dark:bg-night-border rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-pastel-yellow transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3.5 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all btn-clean shadow-sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>resume</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSecondsRemaining(120);
                  setIsRunning(false);
                }}
                className="p-2.5 rounded-full text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-bg border border-transparent hover:border-light-border dark:hover:border-night-border transition-colors btn-clean"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-pastel-sage/20 text-pastel-sage-ink dark:text-pastel-sage mx-auto flex items-center justify-center mb-4 border-2 border-pastel-sage/40">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h2 className="font-serif italic font-semibold text-4xl text-light-text dark:text-night-text mb-2">
              ready
            </h2>
            <p className="font-serif italic font-medium text-xl text-pastel-yellow-ink dark:text-pastel-yellow mb-8">
              let's begin
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleStartFocus}
                className="w-full py-3.5 rounded-2xl bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-sm font-semibold hover:opacity-90 transition-all shadow-md btn-clean"
              >
                start focus
              </button>
              <button
                onClick={() => setIsResetOpen(false)}
                className="w-full py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text transition-colors btn-clean"
              >
                return to home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
