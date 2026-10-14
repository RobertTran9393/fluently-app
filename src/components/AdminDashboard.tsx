'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEN_LEVELS } from '../data/levelsData';
import {
  Users,
  Award,
  Flame,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Lock,
  Unlock,
  HelpCircle,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    currentUser,
    getAllStudents,
    deleteStudent,
    updateStudentRole,
    assignStudentLevel,
    promoteStudentLevel,
    switchUserRoleDemo,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // ----------------------------------------------------
  // 1. GIAO DIỆN HỌC VIÊN: CHỈ XEM ĐƯỢC CỦA CHÍNH MÌNH
  // ----------------------------------------------------
  if (currentUser?.role !== 'admin') {
    const student = currentUser;
    if (!student) {
      return (
        <div className="py-12 text-center text-slate-500 text-sm">
          Vui lòng đăng nhập để xem tiến độ học tập cá nhân.
        </div>
      );
    }

    return (
      <div className="space-y-8 py-6 max-w-5xl mx-auto">
        {/* Student Personal Banner */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/15">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Tiến Độ Học Tập Cá Nhân</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {student.name}!
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
              Dưới đây là hồ sơ học tập và lộ trình 10 cấp độ của riêng bạn. Bạn chỉ có thể xem các thông tin thuộc về tài khoản của mình.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-2 shrink-0">
            <span className="text-[11px] text-indigo-200 font-medium block">
              Thử nghiệm chế độ Quản Trị Viên:
            </span>
            <button
              onClick={() => switchUserRoleDemo('admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Xem Bảng Quản Trị (Admin)</span>
            </button>
          </div>
        </div>

        {/* Student Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Cấp độ hiện tại</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700">
              Cấp {student.currentLevel} / 10
            </div>
            <p className="text-[11px] text-slate-500">
              Đã mở {student.unlockedLevels.length} cấp độ
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Điểm XP tích lũy</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{student.xp} XP</div>
            <p className="text-[11px] text-emerald-600 font-medium">
              Chăm chỉ học mỗi ngày
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Chuỗi chuyên cần</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{student.streak} ngày</div>
            <p className="text-[11px] text-slate-500">Giữ vững đà học tập</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Test xếp lớp</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-cyan-600">
              {student.placementTestTaken ? `${student.placementScore}%` : 'Chưa thi'}
            </div>
            <p className="text-[11px] text-slate-500">
              {student.placementTestTaken ? 'Đã xếp lớp thành công' : 'Chưa kiểm tra đầu vào'}
            </p>
          </div>
        </div>

        {/* 10-Level Personal Progress Roadmap */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Tiến Trình 10 Cấp Độ Của Bạn
              </h3>
              <p className="text-xs text-slate-500">
                Các cấp độ bạn đã mở khóa và các cấp độ cần thi đỗ bài kiểm tra để tiếp tục.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
              Đã mở {student.unlockedLevels.length}/10 cấp
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {TEN_LEVELS.map((lvl) => {
              const isUnlocked = student.unlockedLevels.includes(lvl.level);
              const isPassed = student.passedExams.includes(lvl.level);
              const isCurrent = student.currentLevel === lvl.level;

              return (
                <div
                  key={lvl.level}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    !isUnlocked
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : isCurrent
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{lvl.badge.split(' ')[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">
                          CẤP {lvl.level}
                        </span>
                        {isPassed && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Đã đỗ bài thi
                          </span>
                        )}
                        {isCurrent && !isPassed && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded animate-pulse">
                            Đang học
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                        {lvl.titleVi}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {lvl.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isUnlocked ? (
                      <Unlock className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. GIAO DIỆN QUẢN TRỊ TỔNG THỂ (DÀNH CHO ADMIN)
  // ----------------------------------------------------
  const students = getAllStudents();

  // Metrics
  const totalStudents = students.length;
  const placementTakenCount = students.filter((s) => s.placementTestTaken).length;
  const avgLevel =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + s.currentLevel, 0) / totalStudents).toFixed(1)
      : '1.0';
  const totalXpAll = students.reduce((acc, s) => acc + s.xp, 0);

  // Filtered list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || s.currentLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in fade-in flex items-center justify-between">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-linear-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/20">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Quyền Quản Trị Viên (Super Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Trị Tổng Thể: Học Viên & Cấp Quyền Đào Tạo
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Xem toàn bộ học viên, phân quyền tài khoản, trực tiếp xếp lớp ban đầu và chuyển cấp độ khi học viên hoàn thành bài kiểm tra.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-2 shrink-0">
          <span className="text-xs text-purple-200 font-medium block">
            Chuyển góc nhìn thử nghiệm:
          </span>
          <button
            onClick={() => switchUserRoleDemo('student')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/30 flex items-center justify-center gap-1.5"
          >
            <span>Xem góc nhìn Học Viên</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards with clear XP explanations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số học viên</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Quản lý danh sách toàn trường
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Đã làm bài xếp lớp</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {placementTakenCount} / {totalStudents}
          </div>
          <p className="text-[11px] text-slate-500">
            {totalStudents > 0
              ? Math.round((placementTakenCount / totalStudents) * 100)
              : 0}
            % học viên đã hoàn thành test
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cấp độ trung bình</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">Cấp {avgLevel}</div>
          <p className="text-[11px] text-slate-500">Thang điểm 10 cấp độ</p>
        </div>

        {/* Detailed Explanation for "Tổng XP toàn khóa" */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs space-y-2 relative group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <span>Tổng XP toàn khóa</span>
              <span
                title="Tổng điểm kinh nghiệm tích lũy của toàn bộ học viên khi học bài, lật thẻ, nói chuyện với AI và làm bài kiểm tra."
                className="text-purple-600 cursor-help"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">{totalXpAll} XP</div>
          <p className="text-[11px] text-purple-700 font-medium">
            Tổng điểm tích lũy của tất cả học viên
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email học viên..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) =>
                setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả cấp độ (1 - 10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Cấp độ {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Table with Admin controls */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Cấp quyền (Vai trò)</th>
                <th className="py-3 px-4">Xếp lớp (Cấp độ)</th>
                <th className="py-3 px-4">Duyệt thăng cấp</th>
                <th className="py-3 px-4">Tiến độ mở khóa</th>
                <th className="py-3 px-4">Điểm XP & Chuỗi</th>
                <th className="py-3 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-xl flex items-center justify-center shrink-0 border border-purple-100">
                          {std.avatar}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{std.name}</span>
                          <span className="text-[11px] text-slate-400">{std.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cấp Quyền (Vai trò) */}
                    <td className="py-3.5 px-4">
                      <select
                        value={std.role}
                        onChange={(e) => {
                          const newRole = e.target.value as 'student' | 'admin';
                          updateStudentRole(std.id, newRole);
                          showNotification(`Đã đổi quyền cho ${std.name} thành ${newRole === 'admin' ? 'Quản Trị Viên' : 'Học Viên'}`);
                        }}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border focus:outline-hidden ${
                          std.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="student">🎓 Học viên</option>
                        <option value="admin">👨‍🏫 Quản trị viên</option>
                      </select>
                    </td>

                    {/* Xếp Lớp Cho Học Viên */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={std.currentLevel}
                          onChange={(e) => {
                            const targetLvl = Number(e.target.value);
                            assignStudentLevel(std.id, targetLvl);
                            showNotification(`Đã xếp lớp ${std.name} vào Cấp ${targetLvl}`);
                          }}
                          className="text-xs font-black py-1 px-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 focus:outline-hidden"
                          title="Trực tiếp xếp lớp học cho học viên này"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                            <option key={l} value={l}>
                              Cấp {l}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({std.placementTestTaken ? `${std.placementScore}% test` : 'chưa test'})
                        </span>
                      </div>
                    </td>

                    {/* Chuyển Cấp Độ / Duyệt Thăng Cấp */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          if (std.currentLevel < 10) {
                            promoteStudentLevel(std.id, std.currentLevel);
                            showNotification(`Đã duyệt thăng cấp cho ${std.name} lên Cấp ${std.currentLevel + 1}! (+100 XP)`);
                          } else {
                            alert(`${std.name} đã hoàn thành Cấp 10 cao nhất!`);
                          }
                        }}
                        disabled={std.currentLevel >= 10}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-40 transition-colors flex items-center gap-1"
                        title="Duyệt hoàn thành bài thi và mở khóa cấp tiếp theo"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lên Cấp {Math.min(10, std.currentLevel + 1)}</span>
                      </button>
                    </td>

                    {/* Unlocked Levels Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600">
                          Đã mở {std.unlockedLevels.length} / 10 cấp
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${(std.unlockedLevels.length / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* XP & Streak */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600">{std.xp} XP</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {std.streak}d
                        </span>
                      </div>
                    </td>

                    {/* Actions: Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa học viên ${std.name}?`)) {
                            deleteStudent(std.id);
                            showNotification(`Đã xóa học viên ${std.name}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa học viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    Không tìm thấy học viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
