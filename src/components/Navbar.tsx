'use client';

import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Award,
  Sparkles,
  Settings,
  Volume2,
  Mic,
  BookOpen,
  BookOpenCheck,
  Layers,
  Compass,
  FileSpreadsheet,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { LearningStage } from '../types';

interface NavbarProps {
  currentTab: LearningStage;
  onSelectTab: (tab: LearningStage) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenAuth,
}: NavbarProps) {
  const { state } = useProgress();
  const { currentUser } = useAuth();
  const isStudent = currentUser?.role !== 'admin';

  const navItems = [
    { id: 'roadmap' as const, label: 'Lộ trình', icon: Compass },
    { id: 'daily_vocab' as const, label: 'Từ vựng mỗi ngày', icon: BookOpenCheck, badge: '10-20 từ' },
    { id: 'levels' as const, label: '10 Cấp độ', icon: GraduationCap, badge: 'Mới' },
    { id: 'placement' as const, label: 'Xếp lớp', icon: FileSpreadsheet },
    { id: 'ipa' as const, label: '44 Âm IPA', icon: Mic },
    { id: 'vocab' as const, label: 'Bài học', icon: BookOpen },
    { id: 'flashcard' as const, label: 'Thẻ SRS', icon: Layers },
    { id: 'roleplay' as const, label: 'Tây AI', icon: Sparkles, badge: 'Hot' },
    {
      id: 'admin' as const,
      label: isStudent ? 'Tiến độ cá nhân' : 'Quản trị',
      icon: isStudent ? GraduationCap : ShieldCheck,
      adminOnly: !isStudent,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-100 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('roadmap')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-indigo-700 via-blue-600 to-indigo-900 bg-clip-text text-transparent">
                  Fluently
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                  Zero to Hero
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block whitespace-nowrap">
                Tiếng Anh cho người mất căn bản
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs - Strictly flex-nowrap & whitespace-nowrap so text never breaks */}
          <nav className="hidden xl:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60 flex-nowrap whitespace-nowrap shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isAdminItem = item.adminOnly;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? isAdminItem
                        ? 'bg-purple-700 text-white shadow-xs font-bold'
                        : 'bg-white text-indigo-700 shadow-xs font-bold'
                      : isAdminItem
                      ? 'text-purple-700 hover:bg-purple-50 font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive
                        ? isAdminItem
                          ? 'text-white'
                          : 'text-indigo-600'
                        : isAdminItem
                        ? 'text-purple-600'
                        : 'text-gray-500'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile, Stats & Settings */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
            {/* Streak */}
            <div
              title={`Bạn đã chăm chỉ học ${currentUser?.streak || state.streak} ngày liên tiếp!`}
              className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200/70 px-2.5 py-1.5 rounded-xl text-amber-700 font-bold text-xs whitespace-nowrap"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{currentUser?.streak || state.streak}d</span>
            </div>

            {/* Current Level Pill */}
            <div
              title={`Cấp độ học hiện tại: Cấp ${currentUser?.currentLevel || 1}`}
              className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-xl text-indigo-800 text-xs font-bold whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cấp {currentUser?.currentLevel || 1}</span>
            </div>

            {/* User Account Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl border border-gray-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 transition-all text-xs font-bold text-gray-700 whitespace-nowrap"
              title="Tài khoản học viên / Quản trị"
            >
              <span className="text-sm">{currentUser?.avatar || '🎓'}</span>
              <span className="hidden md:inline max-w-[90px] truncate">
                {currentUser?.name || 'Đăng nhập'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt giọng đọc & API"
              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-colors shrink-0"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scroll Menu - Guaranteed NO LINE BREAK */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-gray-100 flex-nowrap whitespace-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isAdminItem = item.adminOnly;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? isAdminItem
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'bg-indigo-600 text-white font-bold shadow-xs'
                    : isAdminItem
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
