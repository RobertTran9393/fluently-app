'use client';

import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  applyPlacementTestResult: (scorePercent: number, assignedLevel: number) => void;
  recordPassedExam: (levelNumber: number) => void;
  updateUserXp: (amount: number) => void;
  getAllStudents: () => User[];
  deleteStudent: (studentId: string) => void;
  updateStudentRole: (userId: string, newRole: 'student' | 'admin') => void;
  assignStudentLevel: (userId: string, targetLevel: number) => void;
  promoteStudentLevel: (userId: string, levelToPass: number) => void;
  switchUserRoleDemo: (role: 'student' | 'admin') => void;
}

const USERS_STORAGE_KEY = 'fluently_users_db_v2';
const SESSION_STORAGE_KEY = 'fluently_session_user_v2';

// Seed demo users so admin and student features are immediately functional
const DEFAULT_SEED_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'Quản Trị Viên (Admin)',
    email: 'admin@fluently.edu.vn',
    password: 'admin',
    role: 'admin',
    avatar: '👨‍🏫',
    currentLevel: 10,
    unlockedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    placementTestTaken: true,
    placementScore: 100,
    xp: 3500,
    streak: 45,
    completedLessons: ['l1_1', 'l1_2', 'l1_3', 'l2_1', 'l3_1', 'l4_1'],
    passedExams: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lastActive: '2026-10-12T08:00:00Z',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'student_1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    password: '123',
    role: 'student',
    avatar: '👦',
    currentLevel: 3,
    unlockedLevels: [1, 2, 3],
    placementTestTaken: true,
    placementScore: 55,
    xp: 450,
    streak: 7,
    completedLessons: ['l1_1', 'l1_2', 'l1_3', 'l2_1', 'l2_2'],
    passedExams: [1, 2],
    lastActive: '2026-10-12T08:00:00Z',
    createdAt: '2026-09-20T10:15:00Z',
  },
  {
    id: 'student_2',
    name: 'Trần Thị Mai',
    email: 'mai.tran@gmail.com',
    password: '123',
    role: 'student',
    avatar: '👩',
    currentLevel: 1,
    unlockedLevels: [1],
    placementTestTaken: false,
    placementScore: undefined,
    xp: 90,
    streak: 2,
    completedLessons: ['l1_1'],
    passedExams: [],
    lastActive: '2026-10-11T08:00:00Z',
    createdAt: '2026-10-02T14:30:00Z',
  },
  {
    id: 'student_3',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@gmail.com',
    password: '123',
    role: 'student',
    avatar: '🧑‍💻',
    currentLevel: 5,
    unlockedLevels: [1, 2, 3, 4, 5],
    placementTestTaken: true,
    placementScore: 85,
    xp: 1280,
    streak: 14,
    completedLessons: ['l1_1', 'l2_1', 'l3_1', 'l4_1', 'l5_1'],
    passedExams: [1, 2, 3, 4],
    lastActive: '2026-10-12T08:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
  },
];

function getInitialAuthState(): { users: User[]; currentUser: User | null } {
  if (typeof window === 'undefined') {
    return { users: DEFAULT_SEED_USERS, currentUser: null };
  }
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    let loadedUsers = DEFAULT_SEED_USERS;
    if (storedUsers) {
      loadedUsers = JSON.parse(storedUsers);
    } else {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_USERS));
    }

    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    let current: User | null = null;
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      current = loadedUsers.find((u) => u.id === parsed.id) || parsed;
    }
    return { users: loadedUsers, currentUser: current };
  } catch (e) {
    console.warn('Error loading auth from localStorage:', e);
    return { users: DEFAULT_SEED_USERS, currentUser: null };
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => getInitialAuthState().users);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialAuthState().currentUser);

  // Save users to LocalStorage
  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn(e);
    }
  };

  // Save active session
  const saveSession = (user: User | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'Tài khoản email này chưa tồn tại trong hệ thống.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }

    const updated = { ...user, lastActive: new Date().toISOString() };
    const updatedUsers = users.map((u) => (u.id === user.id ? updated : u));
    saveUsers(updatedUsers);
    saveSession(updated);

    return { success: true };
  };

  const register = (name: string, email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: 'Vui lòng nhập họ và tên.' };
    if (!cleanEmail) return { success: false, error: 'Vui lòng nhập địa chỉ email.' };

    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'Email này đã được đăng ký tài khoản.' };
    }

    const newUser: User = {
      id: `std_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password || '123',
      role: 'student',
      avatar: '🎓',
      currentLevel: 1,
      unlockedLevels: [1],
      placementTestTaken: false,
      xp: 50,
      streak: 1,
      completedLessons: [],
      passedExams: [],
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    saveSession(newUser);

    return { success: true };
  };

  const logout = () => {
    saveSession(null);
  };

  const applyPlacementTestResult = (scorePercent: number, assignedLevel: number) => {
    if (!currentUser) return;

    // Build unlocked levels up to assignedLevel
    const unlocked: number[] = [];
    for (let i = 1; i <= assignedLevel; i++) {
      unlocked.push(i);
    }

    const updated: User = {
      ...currentUser,
      placementTestTaken: true,
      placementScore: scorePercent,
      currentLevel: assignedLevel,
      unlockedLevels: Array.from(new Set([...currentUser.unlockedLevels, ...unlocked])),
      xp: currentUser.xp + 50,
    };

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    saveUsers(updatedUsers);
    saveSession(updated);
  };

  const recordPassedExam = (levelNumber: number) => {
    if (!currentUser) return;

    const nextLevel = Math.min(10, levelNumber + 1);
    const updatedUnlocked = Array.from(new Set([...currentUser.unlockedLevels, nextLevel]));
    const updatedPassed = Array.from(new Set([...currentUser.passedExams, levelNumber]));

    const updated: User = {
      ...currentUser,
      passedExams: updatedPassed,
      unlockedLevels: updatedUnlocked,
      currentLevel: nextLevel,
      xp: currentUser.xp + 100,
    };

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    saveUsers(updatedUsers);
    saveSession(updated);
  };

  const updateUserXp = (amount: number) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, xp: currentUser.xp + amount };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    saveUsers(updatedUsers);
    saveSession(updated);
  };

  const getAllStudents = () => {
    return users.filter((u) => u.role === 'student');
  };

  const deleteStudent = (studentId: string) => {
    const updated = users.filter((u) => u.id !== studentId);
    saveUsers(updated);
  };

  const updateStudentRole = (userId: string, newRole: 'student' | 'admin') => {
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveUsers(updatedUsers);
    if (currentUser?.id === userId) {
      saveSession({ ...currentUser, role: newRole });
    }
  };

  const assignStudentLevel = (userId: string, targetLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(10, targetLevel));
    const newUnlocked: number[] = [];
    for (let i = 1; i <= clampedLevel; i++) {
      newUnlocked.push(i);
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const mergedUnlocked = Array.from(new Set([...u.unlockedLevels, ...newUnlocked]));
        return {
          ...u,
          currentLevel: clampedLevel,
          unlockedLevels: mergedUnlocked,
          placementTestTaken: true,
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
    if (currentUser?.id === userId) {
      saveSession({
        ...currentUser,
        currentLevel: clampedLevel,
        unlockedLevels: Array.from(new Set([...currentUser.unlockedLevels, ...newUnlocked])),
        placementTestTaken: true,
      });
    }
  };

  const promoteStudentLevel = (userId: string, levelToPass: number) => {
    const nextLevel = Math.min(10, levelToPass + 1);

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const updatedPassed = Array.from(new Set([...u.passedExams, levelToPass]));
        const updatedUnlocked = Array.from(new Set([...u.unlockedLevels, nextLevel]));
        return {
          ...u,
          passedExams: updatedPassed,
          unlockedLevels: updatedUnlocked,
          currentLevel: Math.max(u.currentLevel, nextLevel),
          xp: u.xp + 100,
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
    if (currentUser?.id === userId) {
      saveSession({
        ...currentUser,
        passedExams: Array.from(new Set([...currentUser.passedExams, levelToPass])),
        unlockedLevels: Array.from(new Set([...currentUser.unlockedLevels, nextLevel])),
        currentLevel: Math.max(currentUser.currentLevel, nextLevel),
        xp: currentUser.xp + 100,
      });
    }
  };

  const switchUserRoleDemo = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      const admin = users.find((u) => u.role === 'admin') || DEFAULT_SEED_USERS[0];
      saveSession(admin);
    } else {
      const student = users.find((u) => u.role === 'student') || DEFAULT_SEED_USERS[1];
      saveSession(student);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        applyPlacementTestResult,
        recordPassedExam,
        updateUserXp,
        getAllStudents,
        deleteStudent,
        updateStudentRole,
        assignStudentLevel,
        promoteStudentLevel,
        switchUserRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
