'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ROLEPLAY_SCENARIOS } from '../data/scenarios';
import { RoleplayScenario, ChatMessage } from '../types';
import { SpeechService } from '../services/speechService';
import { AiService } from '../services/aiService';
import { useProgress } from '../context/ProgressContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Lightbulb,
  RotateCcw,
  Languages,
} from 'lucide-react';

export function AiRoleplayView() {
  const { state, addXp } = useProgress();
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(ROLEPLAY_SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init_msg',
      sender: 'ai',
      text: ROLEPLAY_SCENARIOS[0].openingMessage,
      textVi: ROLEPLAY_SCENARIOS[0].openingMessageVi,
      timestamp: 0,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showSubtitlesVi, setShowSubtitlesVi] = useState(true);
  const [autoPlayAiVoice, setAutoPlayAiVoice] = useState(true);
  const [activeSession, setActiveSession] = useState<{ stop: () => void } | null>(null);

  // Suggestions for the current step
  const [suggestedReplies, setSuggestedReplies] = useState<{ en: string; vi: string; pronunciationTip?: string }[]>(
    () => ROLEPLAY_SCENARIOS[0].steps[0]?.suggestedAnswers || []
  );

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleSelectScenario = useCallback((sc: RoleplayScenario) => {
    setSelectedScenario(sc);
    SpeechService.stopSpeaking();
    const initialMsg: ChatMessage = {
      id: `init_msg_${sc.id}_${Date.now()}`,
      sender: 'ai',
      text: sc.openingMessage,
      textVi: sc.openingMessageVi,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
    setSuggestedReplies(sc.steps[0]?.suggestedAnswers || []);
    if (autoPlayAiVoice) {
      setTimeout(() => {
        SpeechService.speak(sc.openingMessage, {
          rate: state.voiceSpeed,
          voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
        });
      }, 300);
    }
  }, [autoPlayAiVoice, state.voiceSpeed, state.preferredVoice]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const handleSpeak = (text: string) => {
    SpeechService.speak(text, {
      rate: state.voiceSpeed,
      voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isAiThinking) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);
    addXp(20);

    // Prepare history for AI
    const history = messages.map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      text: m.text,
    }));

    try {
      const aiResult = await AiService.generateResponse(
        trimmed,
        selectedScenario,
        history,
        state.geminiApiKey
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResult.replyEn,
        textVi: aiResult.replyVi,
        grammarTip: aiResult.grammarTip,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAiThinking(false);

      if (aiResult.suggestedNextReplies && aiResult.suggestedNextReplies.length > 0) {
        setSuggestedReplies(aiResult.suggestedNextReplies);
      }

      if (autoPlayAiVoice) {
        SpeechService.speak(aiResult.replyEn, {
          rate: state.voiceSpeed,
          voiceLang: state.preferredVoice === 'UK' ? 'en-GB' : 'en-US',
        });
      }
    } catch (e) {
      console.error(e);
      setIsAiThinking(false);
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: "I didn't quite catch that. Could you please say that again?",
        textVi: "Tôi chưa kịp nhận câu vừa rồi. Bạn có thể nói lại một lần nữa không?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Microphone recording
  const handleToggleRecord = () => {
    if (isRecording) {
      if (activeSession) {
        activeSession.stop();
      }
      setIsRecording(false);
      return;
    }

    SpeechService.stopSpeaking();
    setIsRecording(true);

    const session = SpeechService.startListening({
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
          handleSendMessage(transcript);
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

    setActiveSession(session);
  };

  const handleUseSuggestion = (suggestion: { en: string; vi: string }) => {
    setInputText(suggestion.en);
    handleSpeak(suggestion.en);
  };

  const handleRestartConversation = () => {
    SpeechService.stopSpeaking();
    const initialMsg: ChatMessage = {
      id: 'init_msg_' + Date.now(),
      sender: 'ai',
      text: selectedScenario.openingMessage,
      textVi: selectedScenario.openingMessageVi,
      timestamp: Date.now(),
    };
    setMessages([initialMsg]);
    if (selectedScenario.steps[0]?.suggestedAnswers) {
      setSuggestedReplies(selectedScenario.steps[0].suggestedAnswers);
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-950 via-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/15 text-pink-300">
              Chặng 4: Đột Phá Giao Tiếp Thực Chiến
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Phòng Luyện Nói 1-1 Với Người Bản Xứ AI</h1>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl">
              Thực hành phản xạ nói tiếng Anh tự nhiên. AI luôn kiên nhẫn, phát âm chuẩn Tây, có <strong>gợi ý câu trả lời mẫu</strong> và <strong>sửa lỗi phát âm/ngữ pháp</strong> tức thì!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPlayAiVoice(!autoPlayAiVoice)}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                autoPlayAiVoice
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-white/10 border-white/20 text-gray-300'
              }`}
              title="Tự động phát giọng đọc của AI"
            >
              {autoPlayAiVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Giọng đọc tự động</span>
            </button>

            <button
              onClick={() => setShowSubtitlesVi(!showSubtitlesVi)}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                showSubtitlesVi
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-white/10 border-white/20 text-gray-300'
              }`}
              title="Bật/Tắt phụ đề tiếng Việt"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">Dịch tiếng Việt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLEPLAY_SCENARIOS.map((sc) => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{sc.aiAvatar}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                  {sc.difficulty}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-xs mt-2 line-clamp-1">
                {sc.title}
              </h4>
              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                {sc.aiPersona}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden flex flex-col h-[520px] sm:h-[640px]">
        {/* Scenario Header Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white text-xl flex items-center justify-center shadow-xs">
              {selectedScenario.aiAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-sm">{selectedScenario.aiPersona}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                🎯 Mục tiêu: <strong>{selectedScenario.goal}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleRestartConversation}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-xl"
            title="Bắt đầu lại cuộc hội thoại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 space-y-2 ${
                    isUser
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200 rounded-tr-xs'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className={`p-1 rounded-md shrink-0 transition-colors ${
                        isUser
                          ? 'hover:bg-purple-700 text-purple-200'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Nghe câu này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Vietnamese Subtitle */}
                  {showSubtitlesVi && msg.textVi && (
                    <div
                      className={`text-xs pt-1.5 border-t italic ${
                        isUser
                          ? 'text-purple-100 border-purple-500'
                          : 'text-gray-500 border-gray-100'
                      }`}
                    >
                      {msg.textVi}
                    </div>
                  )}

                  {/* Grammar / Native tip from AI */}
                  {msg.grammarTip && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1 mt-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Góp ý phát âm & cách nói tự nhiên:</span>
                      </div>
                      <p>{msg.grammarTip}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAiThinking && (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic p-2 bg-white rounded-xl border border-gray-100 w-fit">
              <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
              <span>{selectedScenario.aiPersona.split(' ')[0]} đang lắng nghe và suy nghĩ...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Replies Bar (Lifeline for Beginners) */}
        {suggestedReplies.length > 0 && (
          <div className="p-3 bg-indigo-50/70 border-t border-indigo-100 space-y-1.5">
            <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gợi ý câu trả lời cho bạn (Bấm để lấy câu nói):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedReplies.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleUseSuggestion(sug)}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-xl text-xs font-semibold transition-all text-left group"
                >
                  <div className="font-bold flex items-center gap-1">
                    <span>&quot;{sug.en}&quot;</span>
                  </div>
                  <div className="text-[10px] text-gray-500 group-hover:text-indigo-100">
                    {sug.vi}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input & Mic Controls */}
        <div className="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2">
          {/* Pulsing Mic Button */}
          <button
            onClick={handleToggleRecord}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-200 scale-105'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
            }`}
            title={isRecording ? 'Bấm để dừng nói' : 'Bấm micro để nói tiếng Anh'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder={
              isRecording
                ? 'Đang lắng nghe giọng của bạn...'
                : 'Nhấn Micro để nói hoặc gõ câu trả lời...'
            }
            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isAiThinking}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
