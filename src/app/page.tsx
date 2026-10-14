'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { ProgressProvider } from '../context/ProgressContext';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { RoadmapView } from '../components/RoadmapView';
import { DailyVocabView } from '../components/DailyVocabView';
import { TenLevelsView } from '../components/TenLevelsView';
import { PlacementTestView } from '../components/PlacementTestView';
import { IpaMastery } from '../components/IpaMastery';
import { LessonsView } from '../components/LessonsView';
import { FlashcardsView } from '../components/FlashcardsView';
import { AiRoleplayView } from '../components/AiRoleplayView';
import { AdminDashboard } from '../components/AdminDashboard';
import { SettingsModal } from '../components/SettingsModal';
import { AuthModal } from '../components/AuthModal';
import { LearningStage } from '../types';
import {
  Heart,
  Compass,
  BookOpenCheck,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const mobileBottomNavItems = [
  { id: 'roadmap' as const, label: 'Lộ trình', icon: Compass },
  { id: 'daily_vocab' as const, label: 'Từ vựng', icon: BookOpenCheck },
  { id: 'flashcard' as const, label: 'Flashcard', icon: Layers },
  { id: 'roleplay' as const, label: 'Tây AI', icon: Sparkles },
  { id: 'levels' as const, label: '10 Cấp độ', icon: GraduationCap },
];

function MainApp() {
  const [currentTab, setCurrentTab] = useState<LearningStage>('roadmap');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24 md:pb-16">
        {currentTab === 'roadmap' && (
          <RoadmapView onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'daily_vocab' && <DailyVocabView />}
        {currentTab === 'levels' && <TenLevelsView />}
        {currentTab === 'placement' && (
          <PlacementTestView onGoToLevels={() => setCurrentTab('levels')} />
        )}
        {currentTab === 'ipa' && <IpaMastery />}
        {currentTab === 'vocab' && <LessonsView />}
        {currentTab === 'flashcard' && <FlashcardsView />}
        {currentTab === 'roleplay' && <AiRoleplayView />}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Mobile Bottom Navigation Bar (Fixed for quick thumb navigation on phone) */}
      <nav
        aria-label="Điều hướng nhanh điện thoại"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 safe-area-bottom"
      >
        <div className="flex items-center justify-around">
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-indigo-50 scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 pb-24 md:pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-700">Fluently App</span>
            <span>•</span>
            <span>Hệ Thống Đào Tạo Tiếng Anh Chuẩn 10 Cấp Độ</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <span>Thiết kế vì người học Việt Nam</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Mỗi ngày 10 phút để tự tin giao tiếp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const isMounted = useMounted();

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                F
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Fluently<span className="text-indigo-600">.vn</span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Đang khởi chạy Fluently...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ProgressProvider>
        <MainApp />
      </ProgressProvider>
    </AuthProvider>
  );
}
