'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface FlashcardReviewData {
  box: number; // SRS box 1 -> 5
  lastReviewed: number;
}

interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  masteredIpa: string[];
  savedVocab: string[];
  reviewedFlashcards: Record<string, FlashcardReviewData>;
  voiceSpeed: number;
  preferredVoice: 'US' | 'UK';
  geminiApiKey: string;
}

const STORAGE_KEY = 'fluently_user_progress_v1';

const defaultState: ProgressState = {
  xp: 45, // give small starting boost
  streak: 1,
  lastActiveDate: '2026-10-12',
  completedLessons: [],
  masteredIpa: [],
  savedVocab: [],
  reviewedFlashcards: {},
  voiceSpeed: 0.9,
  preferredVoice: 'US',
  geminiApiKey: '',
};

interface ProgressContextType {
  state: ProgressState;
  level: { level: number; title: string; minXp: number; maxXp: number; progressPercent: number };
  addXp: (amount: number, reason?: string) => void;
  markIpaMastered: (soundId: string) => void;
  completeLesson: (lessonId: string) => void;
  reviewFlashcard: (wordId: string, remembered: boolean) => void;
  toggleSaveWord: (wordId: string) => void;
  updateSettings: (newSettings: Partial<Pick<ProgressState, 'voiceSpeed' | 'preferredVoice' | 'geminiApiKey'>>) => void;
  resetProgress: () => void;
  triggerCelebration: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

function getInitialProgressState(): ProgressState {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      let streak = parsed.streak || 1;

      if (parsed.lastActiveDate) {
        const lastDate = new Date(parsed.lastActiveDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }

      return {
        ...defaultState,
        ...parsed,
        streak,
        lastActiveDate: today,
      };
    }
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e);
  }
  return defaultState;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => getInitialProgressState());

  // Save to local storage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save progress to localStorage:', e);
    }
  }, [state]);

  // Calculate Level details
  const getLevelInfo = (xp: number) => {
    const levels = [
      { level: 1, title: 'Mầm Non Nhập Môn', minXp: 0, maxXp: 100 },
      { level: 2, title: 'Bắt Đầu Tự Tin', minXp: 100, maxXp: 300 },
      { level: 3, title: 'Giao Tiếp Căn Bản', minXp: 300, maxXp: 700 },
      { level: 4, title: 'Tự Nhiên Phản Xạ', minXp: 700, maxXp: 1500 },
      { level: 5, title: 'Lưu Loát Như Tây', minXp: 1500, maxXp: 3000 },
    ];

    const current = levels.find((l) => xp >= l.minXp && xp < l.maxXp) || levels[levels.length - 1];
    const range = current.maxXp - current.minXp;
    const progress = Math.min(100, Math.max(0, Math.round(((xp - current.minXp) / range) * 100)));

    return {
      ...current,
      progressPercent: progress,
    };
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const addXp = (amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      const prevLevel = getLevelInfo(prev.xp).level;
      const nextLevel = getLevelInfo(newXp).level;

      if (nextLevel > prevLevel) {
        triggerCelebration();
      }

      return {
        ...prev,
        xp: newXp,
      };
    });
  };

  const markIpaMastered = (soundId: string) => {
    setState((prev) => {
      if (prev.masteredIpa.includes(soundId)) return prev;
      addXp(15);
      return {
        ...prev,
        masteredIpa: [...prev.masteredIpa, soundId],
      };
    });
  };

  const completeLesson = (lessonId: string) => {
    setState((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      addXp(50);
      triggerCelebration();
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  };

  const reviewFlashcard = (wordId: string, remembered: boolean) => {
    setState((prev) => {
      const current = prev.reviewedFlashcards[wordId] || { box: 1, lastReviewed: 0 };
      const nextBox = remembered ? Math.min(5, current.box + 1) : 1;
      addXp(remembered ? 10 : 3);

      return {
        ...prev,
        reviewedFlashcards: {
          ...prev.reviewedFlashcards,
          [wordId]: {
            box: nextBox,
            lastReviewed: Date.now(),
          },
        },
      };
    });
  };

  const toggleSaveWord = (wordId: string) => {
    setState((prev) => {
      const exists = prev.savedVocab.includes(wordId);
      return {
        ...prev,
        savedVocab: exists ? prev.savedVocab.filter((id) => id !== wordId) : [...prev.savedVocab, wordId],
      };
    });
  };

  const updateSettings = (
    newSettings: Partial<Pick<ProgressState, 'voiceSpeed' | 'preferredVoice' | 'geminiApiKey'>>
  ) => {
    setState((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const resetProgress = () => {
    setState(defaultState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <ProgressContext.Provider
      value={{
        state,
        level: getLevelInfo(state.xp),
        addXp,
        markIpaMastered,
        completeLesson,
        reviewFlashcard,
        toggleSaveWord,
        updateSettings,
        resetProgress,
        triggerCelebration,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
