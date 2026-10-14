'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  ShieldAlert,
  CheckCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { currentUser, login, register, logout, switchUserRoleDemo } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (tab === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập không thành công.');
      } else {
        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(onClose, 600);
      }
    } else {
      const res = register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng ký không thành công.');
      } else {
        setSuccessMessage('Đăng ký tài khoản học viên thành công!');
        setTimeout(onClose, 600);
      }
    }
  };

  const handleQuickDemo = (role: 'student' | 'admin') => {
    switchUserRoleDemo(role);
    setSuccessMessage(`Đã chuyển sang tài khoản ${role === 'admin' ? 'Quản Trị Viên' : 'Học Viên Demo'}!`);
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile view when logged in */
          <div className="space-y-6 text-center py-2">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-4xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
              {currentUser.avatar}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-xl">{currentUser.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Học Viên'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Cấp độ</span>
                <p className="font-black text-indigo-700 text-base">Cấp {currentUser.currentLevel}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Điểm XP</span>
                <p className="font-black text-emerald-600 text-base">{currentUser.xp}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Chuỗi ngày</span>
                <p className="font-black text-amber-600 text-base">{currentUser.streak} ngày</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  logout();
                  setSuccessMessage('Đã đăng xuất.');
                }}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register tabs when not logged in */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-2xl text-gray-900">
                {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Học Viên'}
              </h3>
              <p className="text-xs text-gray-500">
                Lưu giữ tiến độ học 10 cấp độ & bảng xếp hạng cá nhân
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'login' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'register' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký mới</span>
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Họ và tên học viên</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all mt-2"
              >
                {tab === 'login' ? 'Đăng Nhập Vào Học' : 'Hoàn Tất Đăng Ký'}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 block text-center uppercase tracking-wider">
                ⚡ Đăng nhập nhanh tài khoản thử nghiệm
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>👦 Học viên An</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>👨‍🏫 Quyền Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
