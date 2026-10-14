'use client';

import React, { useState } from 'react';
import { TEN_LEVELS } from '../data/levelsData';
import { LevelInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { SpeechService } from '../services/speechService';
import {
  Lock,
  Unlock,
  CheckCircle,
  Sparkles,
  Volume2,
  X,
  FileCheck2,
} from 'lucide-react';

export function TenLevelsView() {
  const { currentUser, recordPassedExam } = useAuth();
  const { state, triggerCelebration } = useProgress();

  const [activeLevel, setActiveLevel] = useState<LevelInfo>(TEN_LEVELS[0]);
  const [examModalLevel, setExamModalLevel] = useState<LevelInfo | null>(null);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [resultFilter, setResultFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [examResult, setExamResult] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    total: number;
    wrongCount: number;
  } | null>(null);

  const unlockedLevels = currentUser?.unlockedLevels || [1];
  const passedExams = currentUser?.passedExams || [];

  const handleSpeak = (text: string) => {
    SpeechService.speak(text, {
      rate: state.voiceSpeed,
      voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
    });
  };

  const handleStartExam = (lvl: LevelInfo) => {
    setExamModalLevel(lvl);
    setExamAnswers({});
    setExamResult(null);
  };

  const handleSubmitExam = () => {
    if (!examModalLevel) return;

    let correct = 0;
    examModalLevel.exam.forEach((q, idx) => {
      if (examAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / examModalLevel.exam.length) * 100);
    const passed = scorePercent >= examModalLevel.requiredScorePercent;
    const wrongCount = examModalLevel.exam.length - correct;

    setResultFilter('all');
    setExamResult({
      scorePercent,
      passed,
      correctCount: correct,
      total: examModalLevel.exam.length,
      wrongCount,
    });

    if (passed) {
      recordPassedExam(examModalLevel.level);
      triggerCelebration();
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/15 text-emerald-300">
              Lộ Trình Chuẩn Hóa Quốc Tế (A0 ➔ C1)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hệ Thống 10 Cấp Độ & Bài Thi Thăng Cấp
            </h1>
            <p className="text-teal-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Mỗi cấp độ được thiết kế chặt chẽ. Học viên <strong>bắt buộc phải vượt qua bài kiểm tra cuối cấp (đạt từ 70% trở lên)</strong> mới được mở khóa cấp độ tiếp theo!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center min-w-[140px]">
            <div className="text-xs text-teal-200 font-semibold">Cấp hiện tại của bạn</div>
            <div className="text-2xl font-black text-emerald-300">
              Cấp {currentUser?.currentLevel || 1} / 10
            </div>
            <div className="text-[11px] text-teal-300 mt-1">
              Đã mở {unlockedLevels.length}/10 cấp
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 10 Levels Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TEN_LEVELS.map((lvl) => {
          const isUnlocked = unlockedLevels.includes(lvl.level);
          const isPassed = passedExams.includes(lvl.level);
          const isSelected = activeLevel.level === lvl.level;
          const isCurrent = (currentUser?.currentLevel || 1) === lvl.level;

          return (
            <button
              key={lvl.level}
              onClick={() => {
                if (isUnlocked) setActiveLevel(lvl);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                !isUnlocked
                  ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-500">
                    CẤP {lvl.level}
                  </span>
                  {isPassed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : isUnlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div className="text-lg mt-1">{lvl.badge.split(' ')[0]}</div>
                <h4 className="font-extrabold text-slate-900 text-xs mt-1 line-clamp-1">
                  {lvl.titleVi.split(':')[1] || lvl.titleVi}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-semibold">{lvl.lessons.length} bài học</span>
                {isPassed && (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Đã đỗ
                  </span>
                )}
                {isCurrent && !isPassed && (
                  <span className="font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded animate-pulse">
                    Đang học
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail of Selected Unlocked Level */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeLevel.badge.split(' ')[0]}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeLevel.titleVi}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">{activeLevel.description}</p>
            <div className="pt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 inline-block">
              🎯 Mục tiêu đầu ra: <strong>{activeLevel.outcome}</strong>
            </div>
          </div>

          {/* Exam Trigger Button */}
          <div className="shrink-0">
            <button
              onClick={() => handleStartExam(activeLevel)}
              className="px-5 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:scale-103"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {passedExams.includes(activeLevel.level)
                  ? `Thi lại bài kiểm tra Cấp ${activeLevel.level}`
                  : `Làm Bài Kiểm Tra Thăng Cấp ${activeLevel.level}`}
              </span>
            </button>
          </div>
        </div>

        {/* Lessons List in this Level */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Nội dung bài học trọng tâm ({activeLevel.lessons.length} bài)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLevel.lessons.map((lesson, lIdx) => (
              <div
                key={lesson.id}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Bài 0{lIdx + 1}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {lesson.wordsCount} từ vựng
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{lesson.title}</h4>
                <p className="text-xs text-slate-600">{lesson.desc}</p>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Cụm từ then chốt:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lesson.keyPhrases.map((phrase, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSpeak(phrase)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1"
                      >
                        <span>{phrase}</span>
                        <Volume2 className="w-3 h-3 text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level Exam Modal */}
      {examModalLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase">
                  Bài Thi Thăng Cấp {examModalLevel.level}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {examModalLevel.titleVi}
                </h3>
                <p className="text-xs text-slate-500">
                  Cần đạt tối thiểu <strong>{examModalLevel.requiredScorePercent}%</strong> để mở khóa Cấp độ tiếp theo!
                </p>
              </div>
              <button
                onClick={() => setExamModalLevel(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!examResult ? (
              /* Exam questions */
              <div className="space-y-6">
                {examModalLevel.exam.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3"
                  >
                    <div className="text-xs font-bold text-indigo-900">
                      Câu {qIdx + 1}: {q.question}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = examAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() =>
                              setExamAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                            }
                            className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                              isChosen
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitExam}
                    disabled={Object.keys(examAnswers).length < examModalLevel.exam.length}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition-all"
                  >
                    Nộp Bài & Chấm Điểm
                  </button>
                </div>
              </div>
            ) : (
              /* Exam Result View */
              <div className="space-y-6 animate-in fade-in">
                {/* Score summary banner */}
                <div className="text-center py-4 space-y-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-3xl font-black shadow-lg ${
                      examResult.passed
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-rose-500 text-white shadow-rose-200'
                    }`}
                  >
                    {examResult.scorePercent}%
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {examResult.passed
                        ? '🎉 Chúc Mừng Bạn Đã Vượt Qua Kỳ Thi!'
                        : 'Chưa Đạt Điểm Yêu Cầu'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Bạn trả lời đúng <strong>{examResult.correctCount}/{examResult.total}</strong> câu hỏi.
                      {examResult.wrongCount > 0 && (
                        <span className="text-rose-600 font-bold ml-1">
                          (Sai {examResult.wrongCount} câu)
                        </span>
                      )}
                    </p>
                  </div>

                  {examResult.passed ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1 max-w-md mx-auto">
                      <p className="font-bold">
                        🔓 Cấp độ {Math.min(10, examModalLevel.level + 1)} đã được mở khóa!
                      </p>
                      <p>Bạn nhận được <strong>+100 XP</strong> và chính thức thăng cấp thành công.</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium space-y-1 max-w-md mx-auto">
                      <p className="font-bold">Cần tối thiểu 70% để mở khóa Cấp tiếp theo.</p>
                      <p>Hãy xem kỹ các câu làm sai bên dưới để ôn tập lại và thi lại nhé!</p>
                    </div>
                  )}
                </div>

                {/* Filter tabs for review */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>Chi tiết bài làm & Các câu trả lời sai:</span>
                    </h4>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setResultFilter('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          resultFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Tất cả ({examResult.total})
                      </button>
                      <button
                        onClick={() => setResultFilter('wrong')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                          resultFilter === 'wrong'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <span>❌ Câu làm sai ({examResult.wrongCount})</span>
                      </button>
                      <button
                        onClick={() => setResultFilter('correct')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                          resultFilter === 'correct'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <span>✅ Câu đúng ({examResult.correctCount})</span>
                      </button>
                    </div>
                  </div>

                  {/* Questions review list */}
                  <div className="space-y-4">
                    {examModalLevel.exam.map((q, qIdx) => {
                      const userChoice = examAnswers[qIdx];
                      const isCorrect = userChoice === q.correctAnswer;

                      if (resultFilter === 'wrong' && isCorrect) return null;
                      if (resultFilter === 'correct' && !isCorrect) return null;

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
                                Câu {qIdx + 1}
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

                            {/* Detailed explanation */}
                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-1">
                              <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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

                {/* Footer action buttons */}
                <div className="pt-4 border-t border-slate-200 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setExamAnswers({});
                      setExamResult(null);
                    }}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Thi lại bài này
                  </button>
                  <button
                    onClick={() => setExamModalLevel(null)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
