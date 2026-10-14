// Utility for Text-to-Speech (TTS) and Speech Recognition (STT)

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

interface IWindowWithSpeech {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export class SpeechService {
  private static synth: SpeechSynthesis | null = null;

  private static getSynth(): SpeechSynthesis | null {
    if (typeof window === 'undefined') return null;
    if (!SpeechService.synth && 'speechSynthesis' in window) {
      SpeechService.synth = window.speechSynthesis;
    }
    return SpeechService.synth;
  }

  // Get available English voices
  public static getEnglishVoices(): SpeechSynthesisVoice[] {
    const synth = SpeechService.getSynth();
    if (!synth) return [];
    const all = synth.getVoices();
    return all.filter((v) => v.lang.startsWith('en'));
  }

  // Speak a phrase in English
  public static speak(
    text: string,
    options?: {
      rate?: number; // 0.75 to 1.25
      pitch?: number;
      voiceLang?: 'en-US' | 'en-GB';
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): void {
    const synth = SpeechService.getSynth();
    if (!synth) {
      console.warn('SpeechSynthesis is not supported on this device/browser.');
      if (options?.onEnd) options.onEnd();
      return;
    }

    // Cancel any previous utterance to avoid queue buildup
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.voiceLang || 'en-US';
    utterance.rate = options?.rate ?? 0.9; // Default slightly friendly pace
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = synth.getVoices();
    const targetLang = options?.voiceLang || 'en-US';
    const preferredVoice = voices.find(
      (v) =>
        v.lang === targetLang &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('David') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      // 'canceled' or 'interrupted' is normal when audio is re-triggered or switched
      if (e.error === 'canceled' || e.error === 'interrupted') {
        if (options?.onEnd) options.onEnd();
        return;
      }
      if (e.error !== 'not-allowed') {
        console.warn('TTS status:', e.error);
      }
      if (options?.onError) options.onError(e);
      else if (options?.onEnd) options.onEnd();
    };

    // Small timeout prevents Chromium cancel-race bug
    setTimeout(() => {
      try {
        synth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis speak failed:', err);
      }
    }, 15);
  }

  public static stopSpeaking(): void {
    const synth = SpeechService.getSynth();
    if (synth) synth.cancel();
  }

  // Check if speech recognition is supported
  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindowWithSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  // Start listening to user voice via Web Speech API
  public static startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): { stop: () => void } {
    if (!SpeechService.isRecognitionSupported()) {
      callbacks.onError('Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Bạn vui lòng sử dụng Chrome, Edge hoặc Safari.');
      callbacks.onEnd();
      return { stop: () => {} };
    }

    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      callbacks.onError('Trình duyệt chưa hỗ trợ ghi âm trực tiếp.');
      callbacks.onEnd();
      return { stop: () => {} };
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalSpoken = '';

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpoken += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      callbacks.onResult(finalSpoken || interim, !!finalSpoken);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      let message = 'Lỗi nhận diện âm thanh.';
      if (event.error === 'not-allowed') {
        message = 'Bạn chưa cấp quyền truy cập Micro. Hãy bấm biểu tượng Micro trên thanh địa chỉ để cấp quyền nhé.';
      } else if (event.error === 'no-speech') {
        message = 'Chưa nhận thấy tiếng nói. Hãy thử bấm lại và nói to hơn nhé!';
      }
      callbacks.onError(message);
    };

    recognition.onend = () => {
      callbacks.onEnd();
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  }

  // Play pleasant acoustic feedback chime using standard Web Audio API
  public static playFeedbackSound(type: 'correct' | 'wrong'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
        // High upbeat two-tone chime (C5 -> G5)
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
      } else {
        // Gentle neutral low tone
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext autoplay restrictions are handled silently
    }
  }

  // Score pronunciation accuracy between spoken text and target
  public static calculateAccuracy(spoken: string, target: string): {
    score: number;
    feedback: string;
    details: { word: string; matched: boolean }[];
    isCorrect: boolean;
    statusText: string;
  } {
    const cleanSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();

    if (!cleanSpoken) {
      return {
        score: 0,
        feedback: 'Chưa phát hiện giọng nói. Hãy bấm nút micro và thử đọc to, rõ ràng hơn nhé!',
        details: [],
        isCorrect: false,
        statusText: 'Chưa nghe thấy giọng',
      };
    }

    const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
    const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

    // Exact direct match
    if (cleanSpoken === cleanTarget) {
      const details = targetWords.map((w) => ({ word: w, matched: true }));
      return {
        score: 100,
        feedback: '🎉 Hoàn hảo! Bạn đã phát âm chính xác 100%!',
        details,
        isCorrect: true,
        statusText: 'ĐÃ ĐỌC CHÍNH XÁC 100%',
      };
    }

    let matchedCount = 0;
    const details = targetWords.map((tWord) => {
      const isMatched = spokenWords.some((sWord) => {
        if (sWord === tWord) return true;
        // Check near match
        if (sWord.length > 3 && tWord.length > 3) {
          return sWord.startsWith(tWord.slice(0, 3)) || tWord.startsWith(sWord.slice(0, 3));
        }
        return false;
      });
      if (isMatched) matchedCount++;
      return { word: tWord, matched: isMatched };
    });

    const score = Math.min(100, Math.round((matchedCount / Math.max(1, targetWords.length)) * 100));
    const isCorrect = score >= 75;

    let feedback = '';
    let statusText = '';
    if (isCorrect) {
      feedback = '🎉 Xuất sắc! Phát âm rất chuẩn xác và rõ ràng!';
      statusText = 'ĐÃ ĐỌC CHÍNH XÁC';
    } else if (score >= 50) {
      feedback = '👍 Khá tốt! Bạn phát âm tương đối giống, hãy chú ý nhấn âm và phát âm rõ âm đuôi nhé!';
      statusText = 'CẦN CẢI THIỆN ÂM ĐUÔI';
    } else {
      feedback = '🎯 Chưa chính xác. Hãy bấm nút nghe mẫu chậm rồi đọc lại nhé!';
      statusText = 'CHƯA ĐẠT CHUẨN';
    }

    return { score, feedback, details, isCorrect, statusText };
  }
}
