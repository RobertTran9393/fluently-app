'use client';

import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { SpeechService } from '../services/speechService';
import { X, Volume2, Key, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, updateSettings, resetProgress } = useProgress();
  const [apiKey, setApiKey] = useState(state.geminiApiKey || '');
  const [voiceSpeed, setVoiceSpeed] = useState(state.voiceSpeed);
  const [preferredVoice, setPreferredVoice] = useState<'US' | 'UK'>(state.preferredVoice);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  if (!isOpen) return null;

  const handleTestAudio = () => {
    setIsPlayingTest(true);
    SpeechService.speak(
      'Hello there! Welcome to Fluently. Speaking English every day makes you confident!',
      {
        rate: voiceSpeed,
        voiceLang: preferredVoice === 'UK' ? 'en-GB' : 'en-US',
        onEnd: () => setIsPlayingTest(false),
      }
    );
  };

  const handleSave = () => {
    updateSettings({
      geminiApiKey: apiKey.trim(),
      voiceSpeed,
      preferredVoice,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleConfirmReset = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học (XP, Streak, Lịch sử ôn tập)?')) {
      resetProgress();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Cài đặt ứng dụng</h3>
              <p className="text-xs text-gray-500">Tùy biến giọng đọc & kết nối AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Speed */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
            <span>Tốc độ đọc của AI / Audio</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {voiceSpeed}x ({voiceSpeed <= 0.8 ? 'Chậm cho người mới' : voiceSpeed >= 1.1 ? 'Nhanh tự nhiên' : 'Chuẩn vừa'})
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0.75, 0.9, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setVoiceSpeed(speed)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  voiceSpeed === speed
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Voice Accent */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Chất giọng ưu tiên (Accent)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPreferredVoice('US')}
              className={`py-2.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                preferredVoice === 'US'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🇺🇸 Giọng Anh - Mỹ (US)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredVoice('UK')}
              className={`py-2.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                preferredVoice === 'UK'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🇬🇧 Giọng Anh - Anh (UK)</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleTestAudio}
            disabled={isPlayingTest}
            className="w-full mt-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingTest ? 'Đang phát âm thanh...' : 'Nghe thử giọng mẫu'}</span>
          </button>
        </div>

        {/* Google Gemini API Key */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Google Gemini API Key (Tùy chọn)</span>
            </label>
            <span className="text-[11px] text-gray-400">Miễn phí tại Google AI Studio</span>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <p className="text-[11px] text-gray-500">
            Ứng dụng đã có sẵn <strong>Bộ não AI Hội thoại Nội bộ</strong> phản hồi ngay lập tức không cần key. Nếu bạn điền thêm Gemini API Key, AI sẽ trả lời linh hoạt và sáng tạo vô hạn!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleConfirmReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại tiến độ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lưu cài đặt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
