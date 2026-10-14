'use client';

import React, { useState, useMemo, useRef } from 'react';
import { DAILY_VOCAB_PACKS } from '../data/dailyVocabBank';
import { DailyVocabWord } from '../types';
import { SpeechService } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Layers,
  ListChecks,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'fluently_daily_vocab_progress_v1';

function getInitialDailyVocabState() {
  if (typeof window === 'undefined') {
    return {
      selectedPackIndex: 0,
      targetCount: 15 as 10 | 15 | 20,
      learnedWordIds: [] as string[],
      goalCelebrated: false,
    };
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const targetCount = (data.targetCount === 10 || data.targetCount === 15 || data.targetCount === 20)
        ? data.targetCount
        : 15;
      const packIndex = (typeof data.packIndex === 'number' && data.packIndex < DAILY_VOCAB_PACKS.length)
        ? data.packIndex
        : 0;
      const learned = (data.date === today && Array.isArray(data.learnedWordIds))
        ? data.learnedWordIds
        : [];
      const celebrated = (data.date === today && !!data.isCompleted);

      return {
        selectedPackIndex: packIndex,
        targetCount,
        learnedWordIds: learned,
        goalCelebrated: celebrated,
      };
    }
  } catch (err) {
    console.warn('Failed to parse daily vocab progress from localStorage:', err);
  }
  return {
    selectedPackIndex: 0,
    targetCount: 15 as 10 | 15 | 20,
    learnedWordIds: [] as string[],
    goalCelebrated: false,
  };
}

export function DailyVocabView() {
  const { state: progressState, addXp, toggleSaveWord, triggerCelebration } = useProgress();
  const { updateUserXp } = useAuth();

  // Selected Day Pack (0 to 4)
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(() => getInitialDailyVocabState().selectedPackIndex);
  
  // Daily Target: 10, 15, or 20 words
  const [targetCount, setTargetCount] = useState<10 | 15 | 20>(() => getInitialDailyVocabState().targetCount);

  // Active view tab inside Daily Vocab
  const [activeTab, setActiveTab] = useState<'cards' | 'list' | 'quiz'>('cards');

  // Learned word IDs for today
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>(() => getInitialDailyVocabState().learnedWordIds);
  
  // Card navigation
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  // Pronunciation practice state
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

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<{
    word: DailyVocabWord;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Track if daily celebration already shown today
  const [goalCelebrated, setGoalCelebrated] = useState(() => getInitialDailyVocabState().goalCelebrated);

  const activePack = DAILY_VOCAB_PACKS[selectedPackIndex] || DAILY_VOCAB_PACKS[0];
  
  // Visible words based on user target (first 10, 15, or all 20)
  const targetWords = useMemo(() => {
    return activePack.words.slice(0, targetCount);
  }, [activePack, targetCount]);

  const currentWord: DailyVocabWord | undefined = targetWords[currentWordIndex] || targetWords[0];

  // Save progress whenever target, learned words or pack change
  const saveProgressToStorage = (updatedLearned: string[], target: number, packIdx: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isCompleted = updatedLearned.length >= target;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: today,
          targetCount: target,
          packIndex: packIdx,
          learnedWordIds: updatedLearned,
          isCompleted,
        })
      );
    } catch (e) {
      console.warn('Could not save daily vocab progress:', e);
    }
  };

  // Toggle learned status for a word
  const handleToggleLearned = (wordId: string) => {
    let updated: string[];
    const isAlreadyLearned = learnedWordIds.includes(wordId);
    
    if (isAlreadyLearned) {
      updated = learnedWordIds.filter((id) => id !== wordId);
    } else {
      updated = [...learnedWordIds, wordId];
      // Small XP for learning each word
      addXp(5, `Học từ vựng: ${wordId}`);
      updateUserXp(5);
    }
    
    setLearnedWordIds(updated);
    saveProgressToStorage(updated, targetCount, selectedPackIndex);

    // Check goal completion
    if (!isAlreadyLearned && updated.length >= targetCount && !goalCelebrated) {
      setGoalCelebrated(true);
      triggerCelebration();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
      // Daily Goal bonus +100 XP
      addXp(100, `Hoàn thành mục tiêu ${targetCount} từ vựng hôm nay!`);
      updateUserXp(100);
    }
  };

  // Change daily target (10, 15, or 20)
  const handleChangeTarget = (newTarget: 10 | 15 | 20) => {
    setTargetCount(newTarget);
    if (currentWordIndex >= newTarget) {
      setCurrentWordIndex(0);
    }
    saveProgressToStorage(learnedWordIds, newTarget, selectedPackIndex);
  };

  // Change active pack
  const handleSelectPack = (idx: number) => {
    setSelectedPackIndex(idx);
    setCurrentWordIndex(0);
    setSpokenTranscript('');
    setSpeechAccuracy(null);
    saveProgressToStorage(learnedWordIds, targetCount, idx);
  };

  // Pronunciation Speech TTS
  const handleSpeak = (text: string, slow: boolean = false, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    SpeechService.speak(text, {
      rate: slow ? 0.65 : (progressState.voiceSpeed || 0.9),
      voiceLang: progressState.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
    });
  };

  // Microphone Pronunciation Recording STT
  const handleStartSpeaking = () => {
    if (isRecording) {
      if (recognitionStopperRef.current) {
        recognitionStopperRef.current();
        recognitionStopperRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    if (!currentWord) return;

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
            // Auto mark as learned only if pronunciation is truly correct
            if (!learnedWordIds.includes(currentWord.id)) {
              handleToggleLearned(currentWord.id);
            }
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
  };

  // Generate Quiz questions based on current target words
  const initQuiz = () => {
    const questions = targetWords.slice(0, 10).map((w) => {
      // 3 wrong answers from other words
      const otherWords = activePack.words.filter((item) => item.id !== w.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const wrongDistractors = shuffledOthers.slice(0, 3).map((item) => item.meaning);

      const allOptions = [w.meaning, ...wrongDistractors].sort(() => 0.5 - Math.random());
      const correctIdx = allOptions.indexOf(w.meaning);

      return {
        word: w,
        question: `Nghĩa của từ "${w.word}" (${w.ipa}) là gì?`,
        options: allOptions,
        correctAnswer: correctIdx,
        explanation: `"${w.word}" (${w.type}) nghĩa là "${w.meaning}". Ví dụ: "${w.exampleEn}" - ${w.exampleVi}`,
      };
    });

    setQuizQuestions(questions);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Switch to quiz mode and generate test
  const handleOpenQuiz = () => {
    initQuiz();
    setActiveTab('quiz');
  };

  // Select quiz option
  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  // Submit quiz and calculate score
  const handleSubmitQuiz = () => {
    if (quizQuestions.length === 0) return;
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore(scorePercent);
    setQuizSubmitted(true);

    if (scorePercent >= 80) {
      triggerCelebration();
      confetti({ particleCount: 100, spread: 70 });
      addXp(50, 'Hoàn thành xuất sắc bài kiểm tra từ vựng ngày!');
      updateUserXp(50);
    } else {
      addXp(20, 'Luyện tập kiểm tra từ vựng ngày');
      updateUserXp(20);
    }
  };

  // Calculate learned count within current target
  const learnedCount = useMemo(() => {
    const targetWordIdSet = new Set(targetWords.map((w) => w.id));
    return learnedWordIds.filter((id) => targetWordIdSet.has(id)).length;
  }, [learnedWordIds, targetWords]);

  const progressPercent = Math.min(100, Math.round((learnedCount / targetCount) * 100));

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-52 h-52 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nạp từ vựng giao tiếp tự nhiên mỗi ngày</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Học Từ Vựng Mỗi Ngày (10 - 20 Từ)
            </h1>

            <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
              Mỗi ngày tích lũy tối thiểu 10 đến 20 từ cốt lõi. Luyện phát âm chuẩn IPA, nghe giọng bản xứ 
              và chấm điểm giọng nói trực tiếp qua Micro!
            </p>
          </div>

          {/* Goal Selector Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex flex-col items-center md:items-end gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
              <Target className="w-4 h-4 text-emerald-300" />
              <span>Mục tiêu hàng ngày của bạn:</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
              {([10, 15, 20] as const).map((count) => {
                const isActive = targetCount === count;
                return (
                  <button
                    key={count}
                    onClick={() => handleChangeTarget(count)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-400 text-emerald-950 shadow-md scale-105'
                        : 'text-emerald-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {count} từ
                    {count === 10 && ' (Khởi động)'}
                    {count === 15 && ' (Chuẩn)'}
                    {count === 20 && ' (Bứt phá)'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tiến độ hôm nay: {learnedCount}/{targetCount} từ đã thuộc
              </span>
              <span className="text-white text-sm font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {progressPercent >= 100 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/90 text-amber-950 text-xs font-extrabold shadow-md animate-pulse">
                <Trophy className="w-4 h-4 text-amber-900" />
                Mục tiêu hoàn thành! (+100 XP)
              </span>
            ) : (
              <span className="text-xs text-emerald-200 font-medium">
                Còn <strong className="text-white font-bold">{targetCount - learnedCount} từ</strong> nữa để nhận +100 XP hôm nay!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Day Theme Packs Selector Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Chọn Gói Từ Vựng Theo Ngày:
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Có 5 ngày theo chủ đề thực chiến
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {DAILY_VOCAB_PACKS.map((pack, idx) => {
            const isSelected = selectedPackIndex === idx;
            const packLearnedCount = pack.words.slice(0, targetCount).filter((w) => learnedWordIds.includes(w.id)).length;
            const isPackDone = packLearnedCount >= targetCount;

            return (
              <button
                key={pack.dayNumber}
                onClick={() => handleSelectPack(idx)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{pack.icon}</span>
                    {isPackDone && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Đạt mục tiêu
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-xs text-gray-900 line-clamp-1">
                    Ngày {pack.dayNumber}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1 font-medium">
                    {pack.themeTitleVi.replace(/^Ngày \d+: /, '')}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-500">
                  <span>{packLearnedCount}/{targetCount} từ</span>
                  <span className={isSelected ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                    {Math.round((packLearnedCount / targetCount) * 100)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation: Cards vs List vs Quiz */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 gap-2">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'cards'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ Học Tương Tác</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Danh Sách {targetCount} Từ</span>
          </button>

          <button
            onClick={handleOpenQuiz}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'quiz'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kiểm Tra Phản Xạ</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span>Gói hiện tại:</span>
          <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
            {activePack.themeTitleVi}
          </span>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE VOCAB CARD */}
      {activeTab === 'cards' && currentWord && (
        <div className="space-y-6">
          {/* Main Flashcard Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden transition-all">
            {/* Top Card Bar */}
            <div className="bg-slate-50 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2 font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  Từ {currentWordIndex + 1} / {targetWords.length}
                </span>
                <span className="text-gray-400">•</span>
                <span>{currentWord.topicVi}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Save to Notebook */}
                <button
                  onClick={() => toggleSaveWord(currentWord.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    progressState.savedVocab.includes(currentWord.id)
                      ? 'border-amber-300 bg-amber-50 text-amber-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Lưu từ vào sổ tay ôn tập"
                >
                  {progressState.savedVocab.includes(currentWord.id) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đã lưu sổ tay</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Lưu sổ tay</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Word Body */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* English Word & Audio */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
                    {currentWord.word}
                  </span>
                  <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                    {currentWord.type}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-indigo-600 font-mono text-lg sm:text-xl font-bold">
                  <span>{currentWord.ipa}</span>
                </div>

                {/* Audio Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={(e) => handleSpeak(currentWord.word, false, e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition-all shadow-xs"
                    title="Nghe phát âm chuẩn người bản xứ"
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <span>Phát âm chuẩn (Tốc độ thường)</span>
                  </button>

                  <button
                    onClick={(e) => handleSpeak(currentWord.word, true, e)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-bold text-xs transition-all"
                    title="Nghe chậm để phân biệt từng âm"
                  >
                    <span>🐢 Chậm (0.7x)</span>
                  </button>
                </div>
              </div>

              {/* Vietnamese Meaning Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Ý Nghĩa Tiếng Việt:
                </span>
                <p className="text-xl sm:text-2xl font-black text-emerald-950">
                  {currentWord.meaning}
                </p>
              </div>

              {/* Example Sentence Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Câu Ví Dụ Giao Tiếp Thực Tế:
                  </span>
                  <button
                    onClick={(e) => handleSpeak(currentWord.exampleEn, false, e)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe cả câu</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-base sm:text-lg font-semibold text-slate-900">
                    {currentWord.exampleEn}
                  </p>
                  <p className="text-sm text-slate-600 italic">
                    {currentWord.exampleVi}
                  </p>
                </div>
              </div>

              {/* Interactive Speech Recognition & Evaluation Section */}
              <div className="border border-indigo-100 bg-linear-to-b from-indigo-50/50 to-white rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-indigo-600" />
                    Thử Luyện Nói & Chấm Điểm Phát Âm Qua Micro:
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Bấm nút và đọc từ &quot;<strong>{currentWord.word}</strong>&quot;
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleStartSpeaking}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all w-full sm:w-auto shadow-md ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 animate-spin" />
                        <span>Đang lắng nghe... Bấm để dừng</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Bấm để nói từ này</span>
                      </>
                    )}
                  </button>

                  {spokenTranscript && (
                    <div className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl flex-1 w-full sm:w-auto">
                      <span className="text-gray-400 font-medium">Bạn đã nói: </span>
                      <strong className="text-indigo-700 text-sm font-bold">&quot;{spokenTranscript}&quot;</strong>
                    </div>
                  )}
                </div>

                {/* Score feedback display */}
                {speechAccuracy && (
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      speechAccuracy.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : speechAccuracy.score >= 60
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">
                          {speechAccuracy.score}%
                        </span>
                        <span className="font-extrabold text-sm">
                          {speechAccuracy.isCorrect
                            ? '✅ ĐÃ ĐỌC CHÍNH XÁC!'
                            : speechAccuracy.score >= 60
                            ? '⚠️ Cần sửa lại âm'
                            : '❌ Chưa chính xác'}
                        </span>
                      </div>
                      <p className="text-xs">{speechAccuracy.feedback}</p>
                    </div>

                    <div className="text-xs flex items-center gap-1 font-semibold">
                      {speechAccuracy.isCorrect ? (
                        <span className="px-2 py-1 rounded-md bg-emerald-200 text-emerald-900 font-bold">
                          🎉 Đã thuộc từ vựng này!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSpeak(currentWord.word, true)}
                          className="px-2 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          Nghe lại mẫu chậm ➔
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Card Footer Action Bar */}
            <div className="bg-slate-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mark as Learned Toggle Button */}
              <button
                onClick={() => handleToggleLearned(currentWord.id)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  learnedWordIds.includes(currentWord.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                    : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
                }`}
              >
                {learnedWordIds.includes(currentWord.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Đã thuộc từ này (Bấm để hủy)</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-gray-400" />
                    <span>Đánh dấu: Đã thuộc từ này (+5 XP)</span>
                  </>
                )}
              </button>

              {/* Navigation Prev / Next */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  disabled={currentWordIndex === 0}
                  onClick={() => {
                    setCurrentWordIndex((prev) => Math.max(0, prev - 1));
                    setSpokenTranscript('');
                    setSpeechAccuracy(null);
                  }}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Từ trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-gray-600 px-3">
                  {currentWordIndex + 1} / {targetWords.length}
                </span>

                <button
                  disabled={currentWordIndex >= targetWords.length - 1}
                  onClick={() => {
                    setCurrentWordIndex((prev) => Math.min(targetWords.length - 1, prev + 1));
                    setSpokenTranscript('');
                    setSpeechAccuracy(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  title="Từ tiếp theo"
                >
                  <span>Từ kế tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY WORD LIST VIEW */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                Danh Sách {targetCount} Từ Vựng Mục Tiêu
              </h3>
              <p className="text-xs text-gray-500">
                Chủ đề: {activePack.themeTitleVi} • Nhấn vào từ bất kỳ để chuyển sang thẻ học chi tiết
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Đã học {learnedCount}/{targetCount} từ ({progressPercent}%)
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {targetWords.map((w, idx) => {
              const isLearned = learnedWordIds.includes(w.id);
              const isBookmarked = progressState.savedVocab.includes(w.id);

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setCurrentWordIndex(idx);
                    setActiveTab('cards');
                  }}
                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isLearned ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLearned(w.id);
                      }}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isLearned
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-gray-300 hover:border-emerald-500 text-transparent'
                      }`}
                      title={isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-gray-900">
                          {w.word}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600">
                          {w.type}
                        </span>
                        <span className="text-xs font-mono text-indigo-600 hidden sm:inline">
                          {w.ipa}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {w.meaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleSpeak(w.word, false, e)}
                      className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveWord(w.id);
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Lưu sổ tay"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY QUIZ (REFLEX TEST) */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Bài Kiểm Tra Củng Cố Phản Xạ Nhanh
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  10 câu trắc nghiệm nhanh giúp não bộ khắc sâu từ vựng đã học hôm nay.
                </p>
              </div>

              {quizScore !== null && (
                <div
                  className={`px-4 py-2 rounded-2xl border text-sm font-extrabold flex items-center gap-2 ${
                    quizScore >= 80
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Kết quả: {quizScore}% ({quizScore >= 80 ? 'Đạt' : 'Cần ôn thêm'})</span>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => {
                const selectedOption = quizAnswers[qIndex];
                const isAnswered = selectedOption !== undefined;
                const isCorrect = isAnswered && selectedOption === q.correctAnswer;

                return (
                  <div
                    key={qIndex}
                    className={`p-5 rounded-2xl border transition-all ${
                      quizSubmitted
                        ? isCorrect
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-rose-300 bg-rose-50/30'
                        : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400">
                          Câu {qIndex + 1} / {quizQuestions.length}
                        </span>
                        <h4 className="font-bold text-base text-gray-900">
                          {q.question}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleSpeak(q.word.word)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-gray-200 bg-white"
                        title="Nghe phát âm từ này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isChosen = selectedOption === optIndex;
                        const isCorrectOption = optIndex === q.correctAnswer;

                        let btnStyle = 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';

                        if (quizSubmitted) {
                          if (isCorrectOption) {
                            btnStyle = 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold';
                          } else if (isChosen && !isCorrectOption) {
                            btnStyle = 'border-rose-500 bg-rose-100 text-rose-900 font-bold';
                          } else {
                            btnStyle = 'border-gray-200 bg-white/60 text-gray-400';
                          }
                        } else if (isChosen) {
                          btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
                        }

                        return (
                          <button
                            key={optIndex}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuizAnswer(qIndex, optIndex)}
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {quizSubmitted && isChosen && !isCorrectOption && (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submission */}
                    {quizSubmitted && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Giải thích:</strong> {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit or Retry Button */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                onClick={initQuiz}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại bộ đề mới</span>
              </button>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-md shadow-indigo-200"
                >
                  <span>Nộp bài & Chấm điểm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('cards')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md"
                >
                  <span>Quay lại ôn luyện thẻ từ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
