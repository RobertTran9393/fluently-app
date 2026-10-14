'use client';

import React, { useState } from 'react';
import { IPA_SOUNDS, PRONUNCIATION_RULES } from '../data/ipaData';
import { IpaSound } from '../types';
import { SpeechService } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BookMarked,
  X,
  Play,
} from 'lucide-react';

export function IpaMastery() {
  const { state, markIpaMastered, triggerCelebration } = useProgress();
  const [activeTab, setActiveTab] = useState<'all' | 'vowel' | 'diphthong' | 'consonant' | 'rules'>('all');
  const [selectedSound, setSelectedSound] = useState<IpaSound | null>(null);

  // Micro practice state
  const [targetWord, setTargetWord] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    details: { word: string; matched: boolean }[];
    isCorrect: boolean;
    statusText: string;
  } | null>(null);
  const [activeListeningSession, setActiveListeningSession] = useState<{ stop: () => void } | null>(null);

  const filteredSounds = IPA_SOUNDS.filter((sound) => {
    if (activeTab === 'all') return true;
    return sound.type === activeTab;
  });

  const handlePlayWord = (word: string, slow: boolean = false) => {
    SpeechService.speak(word, {
      rate: slow ? 0.7 : state.voiceSpeed,
      voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
    });
  };

  const openSoundDetail = (sound: IpaSound) => {
    setSelectedSound(sound);
    setTargetWord(sound.examples[0].word);
    setEvaluation(null);
    setSpokenTranscript('');
    handlePlayWord(sound.examples[0].word);
  };

  const closeSoundDetail = () => {
    if (activeListeningSession) {
      activeListeningSession.stop();
      setActiveListeningSession(null);
    }
    setIsRecording(false);
    setSelectedSound(null);
  };

  const handleStartSpeakingPractice = () => {
    if (isRecording) {
      if (activeListeningSession) {
        activeListeningSession.stop();
      }
      setIsRecording(false);
      return;
    }

    setSpokenTranscript('');
    setEvaluation(null);
    setIsRecording(true);

    const session = SpeechService.startListening({
      onResult: (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal || transcript.length > 0) {
          const result = SpeechService.calculateAccuracy(transcript, targetWord);
          setEvaluation(result);

          if (result.isCorrect && selectedSound) {
            SpeechService.playFeedbackSound('correct');
            markIpaMastered(selectedSound.id);
            if (result.score >= 90) triggerCelebration();
          } else if (isFinal) {
            SpeechService.playFeedbackSound('wrong');
          }
        }
      },
      onError: (err) => {
        alert(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    setActiveListeningSession(session);
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      {/* Title & Introduction Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/15 text-cyan-300">
              Chặng 1: Nền Tảng Cốt Lõi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Bảng 44 Âm IPA & Luyện Phát Âm Chuẩn Tây</h1>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl">
              Nắm chắc khẩu hình miệng, nghe audio mẫu và <strong>bấm nút Micro để nói thử</strong>. Hệ thống sẽ so sánh giọng nói của bạn và chấm điểm độ chính xác ngay lập tức!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center">
            <div className="text-xs text-indigo-200 font-semibold">Đã thuần thục</div>
            <div className="text-2xl font-black text-cyan-300">
              {state.masteredIpa.length} / {IPA_SOUNDS.length} âm
            </div>
            <div className="w-28 h-1.5 bg-white/20 rounded-full mx-auto mt-2 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${Math.round((state.masteredIpa.length / IPA_SOUNDS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {([
          { id: 'all', label: 'Tất cả 44 âm' },
          { id: 'vowel', label: 'Nguyên âm đơn (Monophthongs)' },
          { id: 'diphthong', label: 'Nguyên âm đôi (Diphthongs)' },
          { id: 'consonant', label: 'Phụ âm đặc trưng (Consonants)' },
          { id: 'rules', label: '3 Quy tắc phát âm sống còn' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View: Pronunciation Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {PRONUNCIATION_RULES.map((rule, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{rule.title}</h3>
                  <p className="text-xs text-gray-500">{rule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {rule.rules.map((subRule, sIdx) => (
                  <div key={sIdx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-lg inline-block">
                      {subRule.pattern}
                    </span>
                    <p className="text-xs text-gray-700 font-medium">{subRule.condition}</p>
                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-xs italic text-gray-500">{subRule.examples}</span>
                      <button
                        onClick={() => handlePlayWord(subRule.examples.split('(')[0])}
                        title="Nghe mẫu"
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Sound Grid */}
      {activeTab !== 'rules' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredSounds.map((sound) => {
            const isMastered = state.masteredIpa.includes(sound.id);
            return (
              <div
                key={sound.id}
                onClick={() => openSoundDetail(sound)}
                className={`group relative bg-white rounded-2xl p-4 border text-center cursor-pointer transition-all hover:scale-103 hover:shadow-lg ${
                  isMastered
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-gray-200 hover:border-indigo-400'
                }`}
              >
                {isMastered && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                  </div>
                )}

                <div className="text-2xl sm:text-3xl font-black text-indigo-900 group-hover:text-indigo-600 transition-colors">
                  {sound.symbol}
                </div>

                <div className="text-[11px] font-semibold text-gray-500 mt-1 line-clamp-1">
                  {sound.category}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-bold">
                  <span>{sound.examples[0].word}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayWord(sound.examples[0].word);
                    }}
                    className="p-1 rounded-full hover:bg-indigo-50 text-indigo-600"
                    title="Nghe âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Sound & Speaking Practice Modal */}
      {selectedSound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-200">
                  {selectedSound.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {selectedSound.category}
                    </span>
                    {state.masteredIpa.includes(selectedSound.id) && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã thuần thục (+15 XP)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                    {selectedSound.description}
                  </h3>
                </div>
              </div>
              <button
                onClick={closeSoundDetail}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vietnamese Tip & Mouth Shape */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Mẹo phát âm cho người Việt</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                  {selectedSound.vietnameseTip}
                </p>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Khẩu hình môi & lưỡi</span>
                </div>
                <p className="text-xs text-blue-900/90 leading-relaxed font-medium">
                  {selectedSound.mouthShape}
                </p>
              </div>
            </div>

            {/* Example Words Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Chọn từ ví dụ để luyện phát âm:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedSound.examples.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => {
                      setTargetWord(item.word);
                      setEvaluation(null);
                      setSpokenTranscript('');
                      handlePlayWord(item.word);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetWord === item.word
                        ? 'border-indigo-600 bg-indigo-50 shadow-2xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 text-sm">{item.word}</span>
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium">{item.ipa}</div>
                    <div className="text-[10px] text-gray-500">{item.meaning}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Speaking / Mic Practice Area */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayWord(targetWord, false)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe chuẩn</span>
                  </button>
                  <button
                    onClick={() => handlePlayWord(targetWord, true)}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-indigo-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Nghe chậm 0.7x</span>
                  </button>
                </div>

                {/* Mic Record Button */}
                <button
                  onClick={handleStartSpeakingPractice}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Đang nghe bạn nói... (Bấm dừng)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Bấm để nói từ &quot;{targetWord}&quot;</span>
                    </>
                  )}
                </button>
              </div>

              {/* Realtime voice result & evaluation */}
              {spokenTranscript && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <span>Bạn vừa nói:</span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                      &quot;{spokenTranscript}&quot;
                    </span>
                  </div>

                  {evaluation && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        evaluation.isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : evaluation.score >= 55
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          {evaluation.isCorrect ? (
                            <span className="text-emerald-700 font-extrabold">✅ ĐÃ ĐỌC CHÍNH XÁC!</span>
                          ) : (
                            <span className="text-rose-700 font-extrabold">🎯 CHƯA CHÍNH XÁC</span>
                          )}
                        </span>
                        <span className="text-lg font-black">{evaluation.score}%</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{evaluation.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={closeSoundDetail}
                className="px-5 py-2 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
