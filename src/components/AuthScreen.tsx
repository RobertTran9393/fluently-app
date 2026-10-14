'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Volume2,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  Mic,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccessLogin?: () => void;
}

export function AuthScreen({ onSuccessLogin }: AuthScreenProps) {
  const { login, register, switchUserRoleDemo } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      if (tab === 'login') {
        const res = login(email, password);
        setIsLoading(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.');
        } else {
          setSuccessMessage('Đăng nhập thành công! Đang chuyển vào trang học...');
          if (onSuccessLogin) onSuccessLogin();
        }
      } else {
        const res = register(name, email, password);
        setIsLoading(false);
        if (!res.success) {
          setErrorMessage(res.error || 'Đăng ký không thành công.');
        } else {
          setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển vào trang học...');
          if (onSuccessLogin) onSuccessLogin();
        }
      }
    }, 300);
  };

  const handleQuickDemo = (role: 'student' | 'admin') => {
    setErrorMessage('');
    setSuccessMessage(`Đang đăng nhập nhanh với quyền ${role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'}...`);
    setTimeout(() => {
      switchUserRoleDemo(role);
      if (onSuccessLogin) onSuccessLogin();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 -ml-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full border-b border-white/10 bg-black/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white">Fluently</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Zero to Hero
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Học Tiếng Anh Cho Người Mất Gốc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Chưa có tài khoản?</span>
            <button
              onClick={() => {
                setTab(tab === 'login' ? 'register' : 'login');
                setErrorMessage('');
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
            >
              {tab === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-5xl">
          {/* Left Column: Value Proposition & Features */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Nền Tảng Tiếng Anh Toàn Diện 10 Cấp Độ
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Tự Tin Giao Tiếp Tiếng Anh Từ{' '}
              <span className="bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Con Số 0
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Hệ thống đào tạo thông minh được thiết kế chuyên biệt cho người Việt mất căn bản. Đăng nhập để lưu giữ toàn bộ lộ trình, điểm thưởng XP và chuỗi ngày học của riêng bạn!
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">44 Âm Chuẩn IPA</h4>
                  <p className="text-[11px] text-slate-400">Chấm điểm phát âm trực tiếp qua Micro</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Flashcards 3D SRS</h4>
                  <p className="text-[11px] text-slate-400">Lặp lại ngắt quãng ghi nhớ sâu tiềm thức</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Đối Thoại Cùng Tây AI</h4>
                  <p className="text-[11px] text-slate-400">Phản xạ tự nhiên theo ngữ cảnh đời thực</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Khung Chuẩn 10 Cấp Độ</h4>
                  <p className="text-[11px] text-slate-400">Bài thi thăng hạng và chứng chỉ tiến độ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100 relative">
              {/* Card Header & Tabs */}
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      tab === 'login'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      tab === 'register'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký mới</span>
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {tab === 'login' ? 'Chào Mừng Trở Lại!' : 'Tạo Tài Khoản Học Viên'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {tab === 'login'
                      ? 'Nhập email và mật khẩu của bạn để tiếp tục lộ trình học'
                      : 'Đăng ký miễn phí trong 10 giây để bắt đầu hành trình'}
                  </p>
                </div>
              </div>

              {/* Notifications */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                {tab === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Họ và tên của bạn</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ban@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                    {tab === 'login' && (
                      <span className="text-[10px] text-slate-400">Mặc định: 123 (nếu dùng demo)</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>{tab === 'login' ? 'Đăng Nhập Vào Học' : 'Tạo Tài Khoản & Bắt Đầu Học'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Switcher */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 block text-center uppercase tracking-wider">
                  ⚡ Dùng thử nhanh tài khoản có sẵn
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👦 Học viên An (Cấp 3)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    <span>👨‍🏫 Quyền Admin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/20 py-4 text-center text-xs text-slate-400 relative z-10">
        <p>Fluently.vn • Hệ thống học tiếng Anh cho người mất gốc • Mỗi ngày 10 phút để tự tin giao tiếp</p>
      </footer>
    </div>
  );
}
