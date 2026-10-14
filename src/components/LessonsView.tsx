'use client';

import React, { useState } from 'react';
import { LESSON_TOPICS } from '../data/vocabLessons';
import { LessonTopic } from '../types';
import { SpeechService } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import {
  Volume2,
  CheckCircle,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Check,
  X,
  ArrowRight,
  Award,
  Lightbulb,
} from 'lucide-react';

export function LessonsView() {
  const { state, completeLesson, toggleSaveWord, addXp, triggerCelebration } = useProgress();
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic>(LESSON_TOPICS[0]);
  const [activeTab, setActiveTab] = useState<'words' | 'patterns' | 'quiz'>('words');

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswersHistory, setUserAnswersHistory] = useState<Record<number, number>>({});

  const handleSpeak = (text: string) => {
    SpeechService.speak(text, {
      rate: state.voiceSpeed,
      voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
    });
  };

  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    setShowExplanation(true);
    setUserAnswersHistory((prev) => ({ ...prev, [currentQuizIndex]: optionIdx }));

    const isCorrect = optionIdx === selectedTopic.quiz[currentQuizIndex].correctAnswer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      addXp(10);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < selectedTopic.quiz.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      completeLesson(selectedTopic.id);
      triggerCelebration();
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
    setUserAnswersHistory({});
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/15 text-emerald-300">
              Chặng 2: Nền Tảng Phản Xạ
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Từ Vựng Thực Chiến & Mẫu Câu Giao Tiếp</h1>
            <p className="text-teal-200 text-xs sm:text-sm max-w-2xl">
              Học theo cụm từ và mẫu câu ghép sẵn <strong>Sentence Building Blocks</strong>. Không học vẹt ngữ pháp, mở miệng là nói được ngay trong các tình huống hàng ngày!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center">
            <div className="text-xs text-teal-200 font-semibold">Chủ đề hoàn thành</div>
            <div className="text-2xl font-black text-emerald-300">
              {state.completedLessons.length} / {LESSON_TOPICS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Topics Selector Horizontal Scroll/Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {LESSON_TOPICS.map((topic) => {
          const isCompleted = state.completedLessons.includes(topic.id);
          const isSelected = selectedTopic.id === topic.id;

          return (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                setActiveTab('words');
                handleResetQuiz();
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                    {topic.level}
                  </span>
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-xs mt-2 line-clamp-1">
                  {topic.title}
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                  {topic.titleVi}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-emerald-700 font-semibold">
                {topic.words.length} từ • {topic.patterns.length} mẫu câu
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Topic Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {selectedTopic.title}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {selectedTopic.titleVi}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{selectedTopic.description}</p>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'words'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Từ vựng ({selectedTopic.words.length})
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'patterns'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mẫu câu ({selectedTopic.patterns.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Thử thách phản xạ ({selectedTopic.quiz.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Words */}
        {activeTab === 'words' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTopic.words.map((item) => {
              const isSaved = state.savedVocab.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-gray-50/70 hover:bg-gray-50 rounded-2xl p-4 border border-gray-200/80 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-gray-900">{item.word}</span>
                        <span className="text-xs text-emerald-700 font-semibold">{item.ipa}</span>
                        <span className="text-[10px] text-gray-400 font-mono italic">({item.type})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleSaveWord(item.id)}
                          title="Lưu vào sổ từ"
                          className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpeak(item.word)}
                          title="Nghe phát âm"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-100 inline-block">
                      👉 {item.meaning}
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-800">{item.exampleEn}</p>
                      <button
                        onClick={() => handleSpeak(item.exampleEn)}
                        title="Nghe câu ví dụ"
                        className="p-1 text-gray-400 hover:text-emerald-700 rounded-md"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 italic">{item.exampleVi}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Patterns (Sentence Building Blocks) */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {selectedTopic.patterns.map((pat) => (
              <div
                key={pat.id}
                className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-200/80 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                      Mẫu câu phản xạ
                    </span>
                    <h3 className="text-lg font-black text-gray-900">{pat.pattern}</h3>
                    <p className="text-xs text-gray-600">{pat.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleSpeak(pat.pattern.replace(/\[.*?\]/g, ''))}
                    className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs hover:bg-emerald-700 shrink-0"
                    title="Nghe đọc mẫu"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Practical Examples */}
                <div className="space-y-2 pt-2 border-t border-emerald-200/50">
                  <div className="text-xs font-bold text-gray-700">Ví dụ ứng dụng thực tế:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pat.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-gray-900">{ex.en}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{ex.vi}</div>
                        </div>
                        <button
                          onClick={() => handleSpeak(ex.en)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Practice Question */}
                <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Luyện phản xạ nhanh: {pat.practiceQuestion.prompt}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {pat.practiceQuestion.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          if (oIdx === pat.practiceQuestion.correctIndex) {
                            alert('Chính xác! Bạn phản xạ rất chuẩn 👏 (+10 XP)');
                            addXp(10);
                          } else {
                            alert('Chưa chính xác, hãy xem lại mẫu câu bên trên nhé!');
                          }
                        }}
                        className="p-2.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-left text-xs font-semibold text-gray-800 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Quiz */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            {!quizFinished ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Câu hỏi {currentQuizIndex + 1} / {selectedTopic.quiz.length}
                  </span>
                  <span className="font-bold text-emerald-700">Điểm: {quizScore}</span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                  <h3 className="text-base font-bold text-gray-900 leading-relaxed">
                    {selectedTopic.quiz[currentQuizIndex].question}
                  </h3>

                  <div className="space-y-2.5">
                    {selectedTopic.quiz[currentQuizIndex].options.map((option, optIdx) => {
                      const isCorrect =
                        optIdx === selectedTopic.quiz[currentQuizIndex].correctAnswer;
                      const isChosen = selectedAnswer === optIdx;

                      let btnStyle = 'border-gray-200 bg-white hover:bg-gray-100 text-gray-800';
                      if (selectedAnswer !== null) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isChosen) {
                          btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={selectedAnswer !== null}
                          onClick={() => handleAnswerSelect(optIdx)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {selectedAnswer !== null && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                          {selectedAnswer !== null && isChosen && !isCorrect && (
                            <X className="w-4 h-4 text-rose-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2 animate-in fade-in">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Giải thích chi tiết:</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {selectedTopic.quiz[currentQuizIndex].explanation}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleNextQuestion}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <span>
                            {currentQuizIndex < selectedTopic.quiz.length - 1
                              ? 'Câu tiếp theo'
                              : 'Xem kết quả'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-950">
                    Chúc mừng bạn đã hoàn thành bài kiểm tra!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800">
                    Bạn trả lời đúng <strong>{quizScore}/{selectedTopic.quiz.length}</strong> câu hỏi và nhận được <strong>+50 XP</strong>!
                    {selectedTopic.quiz.length - quizScore > 0 && (
                      <span className="text-rose-600 font-bold ml-1">
                        (Sai {selectedTopic.quiz.length - quizScore} câu)
                      </span>
                    )}
                  </p>
                </div>

                {/* Detailed Questions Review */}
                <div className="space-y-4 text-left">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Chi tiết đáp án & Các câu trả lời sai:</span>
                  </h4>

                  <div className="space-y-4">
                    {selectedTopic.quiz.map((q, qIdx) => {
                      const userChoice = userAnswersHistory[qIdx];
                      const isCorrect = userChoice === q.correctAnswer;

                      return (
                        <div
                          key={qIdx}
                          className={`rounded-2xl p-5 border space-y-3 ${
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

                            {/* Explanation */}
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

                <div className="pt-2 text-center">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200"
                  >
                    Làm lại bài kiểm tra
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
