'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { LESSON_TOPICS } from '../data/vocabLessons';
import { DAILY_VOCAB_PACKS } from '../data/dailyVocabBank';
import { VocabWord } from '../types';
import { SpeechService } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import {
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Shuffle,
  Layers,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Award,
  Zap,
  BookOpen,
  Calendar,
  RefreshCw,
  Trophy,
  Mic,
  MicOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnifiedVocabWord extends VocabWord {
  sourceType: 'lesson' | 'daily';
  sourceTitle: string;
}

export function FlashcardsView() {
  const { state, reviewFlashcard, toggleSaveWord, addXp, triggerCelebration } = useProgress();

  // Mode and Filter states
  const [sourceMode, setSourceMode] = useState<'all' | 'daily' | 'lessons' | 'saved'>('all');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [sessionLearnedCount, setSessionLearnedCount] = useState(0);
  const [sessionAgainCount, setSessionAgainCount] = useState(0);
  const [showSessionFinished, setShowSessionFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pronunciation check state on Flashcard
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speechAccuracy, setSpeechAccuracy] = useState<{
    score: number;
    feedback: string;
    details: { word: string; matched: boolean }[];
    isCorrect: boolean;
    statusText: string;
  } | null>(null);
  const recognitionStopperRef = useRef<(() => void) | null>(null);

  // 1. Gather all words from both datasets
  const allWordsPool: UnifiedVocabWord[] = useMemo(() => {
    const list: UnifiedVocabWord[] = [];
    const seenIds = new Set<string>();

    // From Daily Vocab Packs
    DAILY_VOCAB_PACKS.forEach((pack) => {
      pack.words.forEach((w) => {
        if (!seenIds.has(w.id)) {
          seenIds.add(w.id);
          list.push({
            ...w,
            sourceType: 'daily',
            sourceTitle: pack.themeTitleVi,
          });
        }
      });
    });

    // From Lesson Topics
    LESSON_TOPICS.forEach((topic) => {
      topic.words.forEach((w) => {
        if (!seenIds.has(w.id)) {
          seenIds.add(w.id);
          list.push({
            ...w,
            sourceType: 'lesson',
            sourceTitle: topic.titleVi,
          });
        }
      });
    });

    return list;
  }, []);

  // 2. Filter list based on selected tab and sub-filter
  const filteredWords = useMemo(() => {
    let list = allWordsPool;

    if (sourceMode === 'saved') {
      list = list.filter((w) => state.savedVocab.includes(w.id));
    } else if (sourceMode === 'daily') {
      list = list.filter((w) => w.sourceType === 'daily');
      if (selectedSubFilter !== 'all') {
        list = list.filter((w) => w.sourceTitle.includes(selectedSubFilter));
      }
    } else if (sourceMode === 'lessons') {
      list = list.filter((w) => w.sourceType === 'lesson');
      if (selectedSubFilter !== 'all') {
        list = list.filter((w) => w.sourceTitle.includes(selectedSubFilter));
      }
    }

    if (isShuffled && shuffleOrder.length > 0) {
      const copy = [...list];
      copy.sort((a, b) => {
        const idxA = shuffleOrder[allWordsPool.indexOf(a)] ?? 0;
        const idxB = shuffleOrder[allWordsPool.indexOf(b)] ?? 0;
        return idxA - idxB;
      });
      return copy;
    }

    return list;
  }, [allWordsPool, sourceMode, selectedSubFilter, state.savedVocab, isShuffled, shuffleOrder]);

  const currentWord = filteredWords[currentIndex] || filteredWords[0];

  // Helper: Speak word with speed control
  const handleSpeak = useCallback(
    (text: string, rate: number = 0.9, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      SpeechService.speak(text, {
        rate,
        voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
      });
    },
    [state.preferredVoice]
  );

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffleOrder([]);
    } else {
      setIsShuffled(true);
      const len = allWordsPool.length;
      const arr = Array.from({ length: len }, (_, i) => i);
      for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffleOrder(arr);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [isShuffled, allWordsPool.length]);

  // Flip card
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    setShowHint(false);
  }, []);

  // Clear microphone state
  const clearSpeechState = useCallback(() => {
    setSpokenTranscript('');
    setSpeechAccuracy(null);
    if (recognitionStopperRef.current) {
      recognitionStopperRef.current();
      recognitionStopperRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    clearSpeechState();
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSessionFinished(true);
      triggerCelebration();
    }
  }, [currentIndex, filteredWords.length, triggerCelebration, clearSpeechState]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    clearSpeechState();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, clearSpeechState]);

  // Pronunciation practice via microphone
  const handleStartSpeaking = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isRecording) {
      if (recognitionStopperRef.current) {
        recognitionStopperRef.current();
        recognitionStopperRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    if (!currentWord) return;

    SpeechService.stopSpeaking();
    setSpokenTranscript('');
    setSpeechAccuracy(null);
    setIsRecording(true);

    const listener = SpeechService.startListening({
      onResult: (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal) {
          setIsRecording(false);
          const evaluation = SpeechService.calculateAccuracy(transcript, currentWord.word);
          setSpeechAccuracy(evaluation);

          if (evaluation.isCorrect) {
            SpeechService.playFeedbackSound('correct');
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
            });
            addXp(10, `Đọc chuẩn xác: ${currentWord.word}`);
            reviewFlashcard(currentWord.id, true);
          } else {
            SpeechService.playFeedbackSound('wrong');
          }
        }
      },
      onError: (err) => {
        setIsRecording(false);
        setSpeechAccuracy({
          score: 0,
          feedback: err,
          details: [],
          isCorrect: false,
          statusText: 'Chưa thu được giọng nói',
        });
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    recognitionStopperRef.current = listener.stop;
  }, [currentWord, isRecording, addXp, reviewFlashcard]);

  // SRS Rating Action: Again, Hard, Good, Easy
  const handleGradeAction = useCallback(
    (quality: 'again' | 'hard' | 'good' | 'easy') => {
      if (!currentWord) return;

      const remembered = quality !== 'again';
      reviewFlashcard(currentWord.id, remembered);

      if (quality === 'again') {
        setSessionAgainCount((c) => c + 1);
      } else {
        setSessionLearnedCount((c) => c + 1);
        const xpEarned = quality === 'easy' ? 15 : 10;
        addXp(xpEarned, `Ôn tập flashcard: ${currentWord.word}`);
      }

      handleNext();
    },
    [currentWord, reviewFlashcard, addXp, handleNext]
  );

  // Auto-play slideshow functionality
  useEffect(() => {
    if (!isAutoPlaying || !currentWord) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    // Auto-play step 1: Speak word -> flip after 2.5s -> next after 5s
    handleSpeak(currentWord.word, 0.85);
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
      if (currentWord.exampleEn) {
        handleSpeak(currentWord.exampleEn, 0.9);
      }
    }, 2800);

    const nextTimer = setTimeout(() => {
      handleNext();
    }, 6000);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(nextTimer);
    };
  }, [isAutoPlaying, currentIndex, currentWord, handleSpeak, handleNext]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleGradeAction('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleGradeAction('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleGradeAction('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleGradeAction('easy');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (currentWord) handleSpeak(currentWord.word);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentWord) toggleSaveWord(currentWord.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleGradeAction, currentWord, handleSpeak, toggleSaveWord]);

  // Restart session
  const handleRestartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSessionFinished(false);
    setSessionLearnedCount(0);
    setSessionAgainCount(0);
  };

  // Safe guard: No words found
  if (!currentWord && !showSessionFinished) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-800">Không tìm thấy thẻ ghi nhớ</h3>
          <p className="text-sm text-slate-500">
            {sourceMode === 'saved'
              ? 'Sổ từ yêu thích của bạn hiện đang trống. Hãy đánh dấu sao vào các từ vựng bạn muốn ôn tập nhé!'
              : 'Hãy chọn danh mục khác hoặc đặt lại bộ lọc để tiếp tục học.'}
          </p>
        </div>
        <button
          onClick={() => {
            setSourceMode('all');
            setSelectedSubFilter('all');
            setCurrentIndex(0);
          }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>Xem tất cả thẻ ({allWordsPool.length})</span>
        </button>
      </div>
    );
  }

  // Session Completion Modal
  if (showSessionFinished) {
    const totalReviewed = sessionLearnedCount + sessionAgainCount;
    const masteryRate = totalReviewed > 0 ? Math.round((sessionLearnedCount / totalReviewed) * 100) : 100;

    return (
      <div className="max-w-xl mx-auto py-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-linear-to-tr from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200 text-white">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              Hoàn thành phiên học!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Xuất sắc! Bạn đã ôn hết bộ thẻ
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Việc lặp lại ngắt quãng hôm nay giúp các tế bào thần kinh củng cố liên kết ghi nhớ sâu vào tiềm thức.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Đã thuộc</div>
              <div className="text-2xl font-black text-emerald-600">+{sessionLearnedCount}</div>
            </div>
            <div className="space-y-1 border-x border-slate-200">
              <div className="text-xs text-slate-400 font-semibold">Tỷ lệ nhớ</div>
              <div className="text-2xl font-black text-indigo-600">{masteryRate}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Cần ôn lại</div>
              <div className="text-2xl font-black text-rose-500">{sessionAgainCount}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRestartSession}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ôn lại bộ thẻ này</span>
            </button>
            <button
              onClick={() => {
                setShowSessionFinished(false);
                setSourceMode('all');
                setCurrentIndex(0);
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Đổi chủ đề khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  const srsData = state.reviewedFlashcards[currentWord.id] || { box: 1 };
  const isSaved = state.savedVocab.includes(currentWord.id);
  const progressPercent = Math.round(((currentIndex + 1) / filteredWords.length) * 100);

  return (
    <div className="space-y-6 py-2 max-w-4xl mx-auto">
      {/* =========================================
          HERO BANNER
      ========================================= */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Spaced Repetition Flashcards
              </span>
              <span className="text-[11px] font-semibold text-indigo-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                Kho {allWordsPool.length} từ vựng
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Thẻ Ghi Nhớ Thông Minh 3D
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Kỹ thuật lặp lại ngắt quãng chuẩn khoa học. Chạm để lật thẻ, nghe phát âm đa tốc độ và tự đánh giá để chuyển hộp ghi nhớ.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 shrink-0 self-stretch md:self-auto justify-around">
            <div className="text-center px-2">
              <div className="text-[11px] font-medium text-slate-300">Tiến độ thẻ</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {currentIndex + 1} <span className="text-xs text-white/50 font-normal">/ {filteredWords.length}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-[11px] font-medium text-slate-300">Đã thuộc</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {sessionLearnedCount}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-[11px] font-medium text-slate-300">Cần ôn</div>
              <div className="text-xl sm:text-2xl font-black text-rose-400">
                {sessionAgainCount}
              </div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-400 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* =========================================
          CONTROLS & FILTER TABS
      ========================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Main Source Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setSourceMode('all');
                setSelectedSubFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                sourceMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({allWordsPool.length})
            </button>
            <button
              onClick={() => {
                setSourceMode('daily');
                setSelectedSubFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                sourceMode === 'daily'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30 Ngày ({DAILY_VOCAB_PACKS.reduce((acc, p) => acc + p.words.length, 0)})</span>
            </button>
            <button
              onClick={() => {
                setSourceMode('lessons');
                setSelectedSubFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                sourceMode === 'lessons'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bài học ({LESSON_TOPICS.reduce((acc, t) => acc + t.words.length, 0)})</span>
            </button>
            <button
              onClick={() => {
                setSourceMode('saved');
                setSelectedSubFilter('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                sourceMode === 'saved'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Đã lưu ({state.savedVocab.length})</span>
            </button>
          </div>

          {/* Action Tools: Shuffle & Auto-play */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleShuffle}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isShuffled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Xáo trộn thứ tự từ"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Trộn thẻ</span>
            </button>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Tự động lật và chuyển thẻ (Rảnh tay)"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAutoPlaying ? 'Tạm dừng' : 'Tự động lật'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          3D FLIP CARD CONTAINER
      ========================================= */}
      <div className="perspective-1000 w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center my-4">
        <div
          onClick={handleFlip}
          className={`relative w-full max-w-2xl min-h-[380px] sm:min-h-[420px] preserve-3d cursor-pointer select-none transition-transform duration-500 ease-out`}
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* =========================================
              FRONT FACE (MẶT TRƯỚC: TỪ VỰNG & IPA)
          ========================================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl p-5 sm:p-8 border-2 border-indigo-100 shadow-xl hover:shadow-2xl hover:border-indigo-300 transition-all flex flex-col justify-between overflow-y-auto scrollbar-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-3 py-1 rounded-full flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {currentWord.sourceTitle}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {currentWord.type}
                </span>
              </div>

              {/* Top Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveWord(currentWord.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                  title="Lưu từ vào sổ tay"
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Center Vocab Presentation */}
            <div className="my-auto text-center space-y-4 py-4">
              <div className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {currentWord.word}
              </div>

              {/* IPA and Audio Controls */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-mono font-bold text-indigo-600 bg-indigo-50/70 px-4 py-1 rounded-xl border border-indigo-100/50">
                  {currentWord.ipa}
                </span>

                {/* Normal Audio (1.0x) */}
                <button
                  onClick={(e) => handleSpeak(currentWord.word, 0.9, e)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1 text-xs font-bold"
                  title="Nghe chuẩn (1.0x)"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chuẩn</span>
                </button>

                {/* Slow Audio (0.75x) */}
                <button
                  onClick={(e) => handleSpeak(currentWord.word, 0.65, e)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Nghe chậm (0.75x) - Luyện âm gió"
                >
                  <span>🐢 Chậm</span>
                </button>

                {/* Microphone Practice Button */}
                <button
                  onClick={handleStartSpeaking}
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-300'
                      : speechAccuracy?.isCorrect
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                  title="Bấm để đọc từ này qua Micro và kiểm tra phát âm"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 animate-spin" />
                      <span>Đang nghe... (Bấm dừng)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-600" />
                      <span>Luyện đọc (Micro)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pronunciation Evaluation Banner */}
              {spokenTranscript && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`p-4 rounded-2xl border text-xs text-left max-w-lg mx-auto space-y-2 transition-all ${
                    speechAccuracy?.isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-md shadow-emerald-100'
                      : speechAccuracy
                      ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">
                      Bạn vừa đọc:{' '}
                      <strong className="text-slate-900 font-bold">&quot;{spokenTranscript}&quot;</strong>
                    </span>
                    {speechAccuracy && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                          speechAccuracy.isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {speechAccuracy.score}%
                      </span>
                    )}
                  </div>

                  {speechAccuracy && (
                    <div className="space-y-1 pt-1 border-t border-black/5">
                      <div className="font-black text-sm flex items-center gap-1.5">
                        {speechAccuracy.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-emerald-800 font-bold">✅ ĐÃ ĐỌC CHÍNH XÁC! (+10 XP)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="text-rose-800 font-bold">🎯 {speechAccuracy.statusText}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        {speechAccuracy.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Hint Context Toggle */}
              {showHint && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-2xl text-xs max-w-md mx-auto animate-in fade-in">
                  💡 <strong>Gợi ý nghĩa:</strong> {currentWord.meaning.slice(0, 15)}...
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Gợi ý</span>
              </button>

              <span className="text-indigo-600 font-bold flex items-center gap-1.5 animate-pulse">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Chạm để lật xem nghĩa (Phím Space)</span>
              </span>

              {/* Current SRS Box Status */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-400">Hộp:</span>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {srsData.box}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================
              BACK FACE (MẶT SAU: NGHĨA & VÍ DỤ CÂU)
          ========================================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-linear-to-b from-slate-50 via-white to-emerald-50/30 rounded-3xl p-5 sm:p-8 border-2 border-emerald-300 shadow-xl flex flex-col justify-between overflow-y-auto scrollbar-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                  Nghĩa Tiếng Việt
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {currentWord.word}
                </span>
              </div>

              <button
                onClick={(e) => handleSpeak(currentWord.word, 0.9, e)}
                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Nghe lại phát âm từ"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Meaning & Examples */}
            <div className="my-auto space-y-5 py-2">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight text-center">
                {currentWord.meaning}
              </div>

              {/* Context Example Box */}
              {currentWord.exampleEn && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-xs space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Ví dụ ngữ cảnh thực tế:
                    </span>
                    <button
                      onClick={(e) => handleSpeak(currentWord.exampleEn, 0.85, e)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Nghe phát âm cả câu"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-[11px]">Nghe câu</span>
                    </button>
                  </div>

                  <p className="text-base font-bold text-slate-900 leading-snug">
                    {currentWord.exampleEn}
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    {currentWord.exampleVi}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Indicator */}
            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
              <span>Đánh giá bên dưới để chuyển thẻ</span>
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <RotateCw className="w-3.5 h-3.5" /> Lật lại mặt trước
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SPACED REPETITION (SRS) 4-LEVEL RATING
      ========================================= */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Bạn nhớ từ này ở mức độ nào?
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Level 1: Again */}
          <button
            onClick={() => handleGradeAction('again')}
            className="group py-3 px-3 bg-white hover:bg-rose-50 border-2 border-rose-200 hover:border-rose-400 rounded-2xl text-left transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-rose-700 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Quên (Phím 1)
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">Về Hộp 1</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Cần ôn lại ngay</div>
          </button>

          {/* Level 2: Hard */}
          <button
            onClick={() => handleGradeAction('hard')}
            className="group py-3 px-3 bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 rounded-2xl text-left transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Hơi khó (Phím 2)
              </span>
              <span className="text-[10px] font-mono text-amber-500 font-bold">+5 XP</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Gặp lại sớm</div>
          </button>

          {/* Level 3: Good */}
          <button
            onClick={() => handleGradeAction('good')}
            className="group py-3 px-3 bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl text-left transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Nhớ tốt (Phím 3)
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">+10 XP</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">+1 Hộp SRS</div>
          </button>

          {/* Level 4: Easy */}
          <button
            onClick={() => handleGradeAction('easy')}
            className="group py-3 px-3 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl text-left transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black text-indigo-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Rất dễ (Phím 4)
              </span>
              <span className="text-[10px] font-mono text-indigo-500 font-bold">+15 XP</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">+2 Hộp SRS</div>
          </button>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center justify-between pt-3 px-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thẻ trước (←)</span>
          </button>

          <span className="text-xs font-semibold text-slate-400">
            Thẻ {currentIndex + 1} trên tổng số {filteredWords.length}
          </span>

          <button
            onClick={handleNext}
            className="px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
          >
            <span>Thẻ kế tiếp (→)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================
          KEYBOARD SHORTCUTS CHEATSHEET
      ========================================= */}
      <div className="max-w-2xl mx-auto pt-2 pb-6 border-t border-slate-200/60">
        <div className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-mono font-bold">Space</kbd>
            <span>Lật thẻ</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-mono font-bold">1 / 2 / 3 / 4</kbd>
            <span>Đánh giá nhớ</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-mono font-bold">R</kbd>
            <span>Nghe lại</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-mono font-bold">S</kbd>
            <span>Lưu từ</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-mono font-bold">← / →</kbd>
            <span>Chuyển thẻ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
