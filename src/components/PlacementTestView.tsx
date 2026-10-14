'use client';

import React, { useState } from 'react';
import { PLACEMENT_QUESTIONS, evaluatePlacementScore } from '../data/placementTestData';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import {
  Compass,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

interface PlacementTestViewProps {
  onGoToLevels: () => void;
}

export function PlacementTestView({ onGoToLevels }: PlacementTestViewProps) {
  const { currentUser, applyPlacementTestResult } = useAuth();
  const { triggerCelebration } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultData, setResultData] = useState<
    (ReturnType<typeof evaluatePlacementScore> & { correctCount: number; wrongCount: number }) | null
  >(null);

  const currentQ = PLACEMENT_QUESTIONS[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleNext = () => {
    if (currentIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      PLACEMENT_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correct++;
        }
      });

      const evaluated = evaluatePlacementScore(correct, PLACEMENT_QUESTIONS.length);
      setReviewFilter('all');
      setResultData({
        ...evaluated,
        correctCount: correct,
        wrongCount: PLACEMENT_QUESTIONS.length - correct,
      });
      setIsCompleted(true);
      applyPlacementTestResult(evaluated.scorePercent, evaluated.assignedLevel);
      triggerCelebration();
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setReviewFilter('all');
    setIsCompleted(false);
    setResultData(null);
  };

  return (
    <div className="space-y-8 py-6 max-w-3xl mx-auto">
      {/* Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/20 mb-3">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Đánh Giá Ban Đầu Năng Lực Tiếng Anh</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Bài Kiểm Tra Xếp Lớp Chuẩn Hóa
        </h1>
        <p className="text-indigo-200 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
          Chỉ mất 5 phút với 10 câu hỏi để xác định chính xác bạn đang ở đâu trong thang 10 Cấp độ. Hệ thống sẽ tự động xếp bạn vào lớp học phù hợp nhất!
        </p>

        {currentUser?.placementTestTaken && !isCompleted && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-cyan-200 font-semibold">
              Học viên: <strong>{currentUser.name}</strong> • Đã từng test: <strong>{currentUser.placementScore}%</strong> (Cấp {currentUser.currentLevel})
            </span>
            <button
              onClick={handleRetake}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20"
            >
              Làm lại bài kiểm tra
            </button>
          </div>
        )}
      </div>

      {!isCompleted ? (
        /* Quiz questions card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Câu hỏi {currentIndex + 1} / {PLACEMENT_QUESTIONS.length}</span>
              <span className="text-indigo-600">
                {Math.round(((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Dạng bài: {currentQ.category === 'pronunciation' ? 'Ngữ âm' : currentQ.category === 'situation' ? 'Tình huống thực tế' : currentQ.category === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30"
            >
              Câu trước
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentIndex] === undefined}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
            >
              <span>{currentIndex < PLACEMENT_QUESTIONS.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả xếp lớp'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation & Placement Result Card */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6 text-center animate-in fade-in">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Kết quả xếp lớp chính thức
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Bạn Đã Được Xếp Vào: {resultData?.levelTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Đạt <strong>{resultData?.scorePercent}%</strong> điểm trong bài kiểm tra. Toàn bộ các cấp độ từ Cấp 1 đến Cấp {resultData?.assignedLevel} đã được mở khóa tự động cho bạn!
            </p>
          </div>

          {/* Detailed Feedback */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 text-left space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Đánh giá từ chuyên gia:</span>
            </div>
            <p className="text-xs text-indigo-950/80 leading-relaxed font-medium">
              {resultData?.feedbackVi}
            </p>
          </div>

          {/* Detailed Question by Question Review */}
          <div className="pt-4 space-y-4 max-w-2xl mx-auto text-left">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Xem lại bài làm & Các câu trả lời sai:</span>
              </h4>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reviewFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({PLACEMENT_QUESTIONS.length})
                </button>
                <button
                  onClick={() => setReviewFilter('wrong')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    reviewFilter === 'wrong'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <span>❌ Câu làm sai ({resultData?.wrongCount || 0})</span>
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    reviewFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>✅ Câu đúng ({resultData?.correctCount || 0})</span>
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              {PLACEMENT_QUESTIONS.map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const isCorrect = userChoice === q.correctAnswer;

                if (reviewFilter === 'wrong' && isCorrect) return null;
                if (reviewFilter === 'correct' && !isCorrect) return null;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl p-5 border space-y-3 transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Câu {qIdx + 1} • {q.category === 'pronunciation' ? 'Ngữ âm' : q.category === 'situation' ? 'Tình huống' : q.category === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 leading-snug">
                          {q.question}
                        </h5>
                      </div>

                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {isCorrect ? '✅ Trả lời đúng' : '❌ Trả lời sai'}
                      </span>
                    </div>

                    {/* Answers comparison */}
                    <div className="space-y-2 pt-1 text-xs">
                      {!isCorrect ? (
                        <>
                          <div className="p-3 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900 font-semibold flex items-start gap-2">
                            <span className="font-black text-rose-700 shrink-0">
                              ❌ Bạn đã chọn:
                            </span>
                            <span>{q.options[userChoice] ?? 'Chưa chọn'}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-900 font-semibold flex items-start gap-2">
                            <span className="font-black text-emerald-700 shrink-0">
                              ✅ Đáp án chính xác:
                            </span>
                            <span>{q.options[q.correctAnswer]}</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-900 font-semibold flex items-start gap-2">
                          <span className="font-black text-emerald-700 shrink-0">
                            ✅ Bạn đã chọn đúng:
                          </span>
                          <span>{q.options[userChoice]}</span>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-1">
                        <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Giải thích chi tiết:
                        </span>
                        <p className="text-xs leading-relaxed text-slate-600">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToLevels}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              <span>Bắt đầu học ngay Cấp {resultData?.assignedLevel}</span>
            </button>

            <button
              onClick={handleRetake}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại bài kiểm tra</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
