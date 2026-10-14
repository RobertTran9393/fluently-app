export type LearningStage =
  | 'roadmap'
  | 'daily_vocab'
  | 'levels'
  | 'placement'
  | 'ipa'
  | 'vocab'
  | 'flashcard'
  | 'roleplay'
  | 'admin';

export interface DailyVocabWord extends VocabWord {
  category: string;
  topicVi: string;
}

export interface DailyGoalProgress {
  date: string; // YYYY-MM-DD
  targetCount: 10 | 15 | 20;
  learnedWordIds: string[];
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  avatar: string;
  currentLevel: number; // 1 to 10
  unlockedLevels: number[]; // e.g. [1] or [1, 2, 3]
  placementTestTaken: boolean;
  placementScore?: number; // 0 to 100
  xp: number;
  streak: number;
  completedLessons: string[];
  passedExams: number[]; // list of level numbers passed
  lastActive: string;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'grammar' | 'vocab' | 'pronunciation' | 'situation';
}

export interface LevelInfo {
  level: number;
  title: string;
  titleVi: string;
  badge: string;
  outcome: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    desc: string;
    wordsCount: number;
    keyPhrases: string[];
  }[];
  exam: ExamQuestion[];
  requiredScorePercent: number; // e.g., 70
}

export interface IpaSound {
  id: string;
  symbol: string;
  type: 'vowel' | 'diphthong' | 'consonant';
  category: string;
  description: string;
  vietnameseTip: string;
  examples: {
    word: string;
    ipa: string;
    meaning: string;
    highlight: string;
  }[];
  mouthShape: string;
}

export interface VocabWord {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  type: string;
  exampleEn: string;
  exampleVi: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SentencePattern {
  id: string;
  pattern: string;
  explanation: string;
  examples: {
    en: string;
    vi: string;
  }[];
  practiceQuestion: {
    prompt: string;
    targetSentence: string;
    options: string[];
    correctIndex: number;
  };
}

export interface LessonTopic {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  icon: string;
  level: 'Beginner' | 'Elementary' | 'Pre-Intermediate';
  words: VocabWord[];
  patterns: SentencePattern[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface ScenarioStep {
  id: string;
  aiPrompt: string;
  aiPromptVi: string;
  suggestedAnswers: {
    en: string;
    vi: string;
    pronunciationTip?: string;
  }[];
}

export interface RoleplayScenario {
  id: string;
  title: string;
  titleVi: string;
  role: string;
  aiPersona: string;
  aiAvatar: string;
  description: string;
  situation: string;
  difficulty: 'Cực dễ' | 'Cơ bản' | 'Thực tế';
  openingMessage: string;
  openingMessageVi: string;
  steps: ScenarioStep[];
  goal: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  textVi?: string;
  grammarTip?: string;
  pronunciationTip?: string;
  timestamp: number;
  audioPlayed?: boolean;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  masteredIpa: string[];
  reviewedFlashcards: Record<string, { interval: number; nextReview: number }>;
  badges: string[];
  dailyGoalMinutes: number;
  todayMinutes: number;
  voiceSpeed: number;
  preferredVoice: string;
  geminiApiKey?: string;
}
