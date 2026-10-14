'use client';

import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { LearningStage } from '../types';
import {
  Mic,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Volume2,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

interface RoadmapViewProps {
  onNavigate: (tab: LearningStage) => void;
}

export function RoadmapView({ onNavigate }: RoadmapViewProps) {
  const { state, level } = useProgress();

  const stages = [
    {
      id: 'ipa' as LearningStage,
      number: '01',
      title: 'Chặng 1: Xóa Mù Phát Âm Chuẩn IPA',
      subtitle: 'Nắm chắc 44 âm quốc tế, âm đuôi (-s, -ed) & nối âm',
      desc: 'Người mất gốc hay sợ nói vì không biết phát âm chuẩn. Khi bạn phát âm đúng, người Tây sẽ hiểu bạn 100% và bạn sẽ nghe kịp họ nói.',
      icon: Mic,
      gradient: 'from-blue-500 to-indigo-600',
      badge: `${state.masteredIpa.length}/44 âm đã thuần thục`,
      progressPercent: Math.round((state.masteredIpa.length / 44) * 100),
      tag: 'Cực kỳ quan trọng',
      actionText: 'Bắt đầu luyện phát âm',
    },
    {
      id: 'vocab' as LearningStage,
      number: '02',
      title: 'Chặng 2: Nạp Từ Vựng & Mẫu Câu Phản Xạ',
      subtitle: '500+ từ vựng cốt lõi & mẫu câu ghép sẵn',
      desc: 'Đừng học ngữ pháp hàn lâm! Hãy học các mẫu câu ghép sẵn "Sentence Blocks" để mở miệng nói ngay trong 2 giây mà không cần dịch ngầm trong đầu.',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-600',
      badge: `${state.completedLessons.length}/6 chủ đề hoàn thành`,
      progressPercent: Math.round((state.completedLessons.length / 6) * 100),
      tag: 'Nền tảng giao tiếp',
      actionText: 'Học bài học & Mẫu câu',
    },
    {
      id: 'flashcard' as LearningStage,
      number: '03',
      title: 'Chặng 3: Thẻ Nhớ Thông Minh Spaced Repetition',
      subtitle: 'Ghi nhớ từ vựng vĩnh viễn vào phản xạ tiềm thức',
      desc: 'Học trước quên sau là nỗi ám ảnh lớn nhất. Phương pháp lặp lại ngắt quãng (SRS) giúp bạn nhớ từ vựng sâu sắc kèm phát âm và câu ví dụ sinh động.',
      icon: Layers,
      gradient: 'from-amber-500 to-orange-600',
      badge: `${Object.keys(state.reviewedFlashcards).length} thẻ đã ôn luyện`,
      progressPercent: Math.min(100, Object.keys(state.reviewedFlashcards).length * 10),
      tag: 'Ghi nhớ dài hạn',
      actionText: 'Mở thẻ Flashcard ôn tập',
    },
    {
      id: 'roleplay' as LearningStage,
      number: '04',
      title: 'Chặng 4: Luyện Nói Thực Chiến Cùng Tây AI',
      subtitle: 'Nhập vai tình huống thực tế: Đi cafe, sân bay, hỏi đường...',
      desc: 'Không cần thuê giáo viên Tây đắt đỏ hay ngại ngùng xấu hổ. Bạn sẽ đối thoại bằng giọng nói với AI Tây kiên nhẫn, được sửa phát âm và ngữ pháp tức thì!',
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-600',
      badge: 'Trợ lý AI 24/7',
      progressPercent: 100,
      tag: 'Đột phá lưu loát',
      actionText: 'Vào phòng nói chuyện với AI',
    },
  ];

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Phương pháp học dành riêng cho người Việt mất căn bản</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Từ Con Số 0 Đến Tự Tin Nói Chuyện Với Người Nước Ngoài
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Học đúng lộ trình 4 bước: <strong>Phát âm chuẩn IPA ➔ Mẫu câu phản xạ ➔ Nhớ sâu SRS ➔ Thực chiến nói chuyện với Tây AI</strong>. Không học vẹt ngữ pháp khô khan!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('placement')}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-indigo-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Làm bài Test Xếp Lớp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('levels')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Lộ trình 10 Cấp độ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('roleplay')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Thử nói chuyện với Tây AI</span>
            </button>
          </div>
        </div>

        {/* Level & Streak Stats Card in Banner */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-indigo-200">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Chuỗi học</span>
            </div>
            <div className="text-xl font-black text-white mt-1">{state.streak} ngày liên tiếp</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-indigo-200">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Điểm XP</span>
            </div>
            <div className="text-xl font-black text-cyan-300 mt-1">{state.xp} XP</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-indigo-200">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Cấp bậc</span>
            </div>
            <div className="text-base font-bold text-white mt-1">Cấp {level.level}: {level.title}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-indigo-200">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Mục tiêu ngày</span>
            </div>
            <div className="text-base font-bold text-white mt-1">10-20 từ/ngày</div>
          </div>
        </div>
      </div>

      {/* Daily Vocab Goal Mission Card */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhiệm vụ hàng ngày • Tối thiểu 10 - 20 từ</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Nạp 10 - 20 Từ Vựng Giao Tiếp Mỗi Ngày
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Học từ vựng theo chủ đề đời sống, nghe phát âm chuẩn bản xứ, thực hành nói qua Micro có chấm điểm tức thì và nhận ngay <strong>+100 XP</strong> khi hoàn thành mục tiêu!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-100 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Phát âm chuẩn IPA
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Chấm điểm nói qua Micro
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Thử thách phản xạ nhanh
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('daily_vocab')}
          className="z-10 px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0 flex items-center gap-2 group cursor-pointer"
        >
          <span>Học 10-20 từ hôm nay</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-700" />
        </button>

        {/* Decorative ambient light */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-cyan-300/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stages Detailed Stepper */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Lộ trình 4 Chặng Tự Tin Nói Tiếng Anh
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Mỗi chặng được thiết kế từng bước nhỏ (Micro-learning) giúp bạn không bị nản lòng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${stage.gradient} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                          {stage.number}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base">{stage.title}</h3>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {stage.tag}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-indigo-900/80 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100/60">
                    {stage.subtitle}
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed">{stage.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">{stage.badge}</span>
                    <span className="font-bold text-indigo-600">{stage.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-linear-to-r ${stage.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(5, stage.progressPercent)}%` }}
                    />
                  </div>

                  <button
                    onClick={() => onNavigate(stage.id)}
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200 group-hover:border-indigo-600"
                  >
                    <span>{stage.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mindset / Tips for Beginners Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-300/40">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <h4 className="font-black text-amber-900 text-base sm:text-lg">
            3 Lời Khuyên Vàng Cho Người Bắt Đầu Từ Con Số 0
          </h4>
          <ul className="text-xs sm:text-sm text-amber-900/90 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Đừng sợ nói sai:</strong> Người nước ngoài cực kỳ trân trọng nỗ lực giao tiếp của bạn. Họ luôn kiên nhẫn lắng nghe!
            </li>
            <li>
              <strong>Bắt chước khẩu hình và âm thanh:</strong> Hãy mở to khẩu hình miệng và dùng nút Micro trong app để luyện tập mỗi ngày 10 phút.
            </li>
            <li>
              <strong>Học theo cụm từ (Chunks):</strong> Đừng học từng từ đơn lẻ rời rạc. Học cả cụm câu như <em>&quot;Could I have...&quot;</em> bạn sẽ phản xạ ngay tức thì.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
