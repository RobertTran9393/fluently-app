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

  // Helper: Calculate Levenshtein distance between two strings
  private static levenshtein(a: string, b: string): number {
    const an = a.length;
    const bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;

    const matrix: number[][] = [];
    for (let i = 0; i <= bn; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= an; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= bn; i++) {
      for (let j = 1; j <= an; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[bn][an];
  }

  // Helper: Similarity ratio between 0.0 and 1.0
  private static calculateWordSimilarity(w1: string, w2: string): number {
    if (w1 === w2) return 1.0;
    const maxLen = Math.max(w1.length, w2.length);
    if (maxLen === 0) return 1.0;
    const dist = SpeechService.levenshtein(w1, w2);
    return Math.max(0, 1 - dist / maxLen);
  }

  // Score pronunciation accuracy between spoken text and target
  public static calculateAccuracy(spoken: string, target: string): {
    score: number;
    feedback: string;
    details: { word: string; matched: boolean }[];
    isCorrect: boolean;
    statusText: string;
  } {
    const cleanSpoken = spoken
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanTarget = target
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

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

    // EXACT DIRECT MATCH
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

    // -------------------------------------------------------------------
    // CASE 1: TARGET IS A SINGLE WORD (e.g. "pleasure", "comfortable")
    // -------------------------------------------------------------------
    if (targetWords.length === 1) {
      const tWord = targetWords[0];

      // Did user say the exact target word anywhere in spoken words?
      if (spokenWords.includes(tWord)) {
        return {
          score: 100,
          feedback: `🎉 Hoàn hảo! Bạn đã phát âm chính xác từ "${tWord}"!`,
          details: [{ word: tWord, matched: true }],
          isCorrect: true,
          statusText: 'ĐÃ ĐỌC CHÍNH XÁC',
        };
      }

      // Find the highest similarity between any spoken word and the target
      let bestSimilarity = 0;
      let closestSpokenWord = spokenWords[0] || '';
      for (const sWord of spokenWords) {
        const sim = SpeechService.calculateWordSimilarity(sWord, tWord);
        if (sim > bestSimilarity) {
          bestSimilarity = sim;
          closestSpokenWord = sWord;
        }
      }

      const score = Math.round(bestSimilarity * 100);

      // Strict threshold for single words: must be at least 88% to count as correct
      // For instance: "pleasure" vs "please" has similarity ~62% -> isCorrect is strictly FALSE!
      const isCorrect = bestSimilarity >= 0.88;

      let feedback = '';
      let statusText = '';

      if (isCorrect) {
        feedback = `🎉 Xuất sắc! Phát âm từ "${tWord}" rất chuẩn xác!`;
        statusText = 'ĐÃ ĐỌC CHÍNH XÁC';
      } else if (score >= 60) {
        feedback = `⚠️ Bạn vừa đọc là "${closestSpokenWord}", chưa khớp với từ mẫu "${tWord}". Hãy nghe lại mẫu và chú ý phát âm rõ âm đuôi nhé!`;
        statusText = `CHƯA CHÍNH XÁC (${score}%)`;
      } else {
        feedback = `🎯 Chưa chính xác: Bạn vừa đọc là "${closestSpokenWord}", khác với từ mẫu "${tWord}". Bấm nghe mẫu và thử đọc lại nhé!`;
        statusText = `CHƯA ĐẠT CHUẨN (${score}%)`;
      }

      return {
        score,
        feedback,
        details: [{ word: tWord, matched: isCorrect }],
        isCorrect,
        statusText,
      };
    }

    // -------------------------------------------------------------------
    // CASE 2: TARGET IS A SENTENCE OR PHRASE (e.g. "It is a pleasure to meet you")
    // -------------------------------------------------------------------
    let totalWordSim = 0;
    const details = targetWords.map((tWord) => {
      let bestSim = 0;
      for (const sWord of spokenWords) {
        const sim = SpeechService.calculateWordSimilarity(sWord, tWord);
        if (sim > bestSim) bestSim = sim;
      }
      totalWordSim += bestSim;
      // Word is matched if similarity is at least 0.80
      const isMatched = bestSim >= 0.80;
      return { word: tWord, matched: isMatched };
    });

    const averageSim = totalWordSim / targetWords.length;
    const matchedCount = details.filter((d) => d.matched).length;
    const matchRatio = matchedCount / targetWords.length;

    const score = Math.min(100, Math.round(averageSim * 100));

    // A sentence is correct if overall similarity >= 82% AND at least 80% of words matched
    const isCorrect = score >= 82 && matchRatio >= 0.80;

    let feedback = '';
    let statusText = '';

    if (isCorrect) {
      feedback = '🎉 Xuất sắc! Phát âm cả câu rất chuẩn xác và trôi chảy!';
      statusText = 'ĐÃ ĐỌC CHÍNH XÁC';
    } else if (score >= 50) {
      const missedWords = details.filter((d) => !d.matched).map((d) => d.word);
      feedback = `⚠️ Bạn phát âm đúng ${matchedCount}/${targetWords.length} từ.${
        missedWords.length > 0 ? ` Cần phát âm rõ hơn các từ: ${missedWords.join(', ')}.` : ''
      }`;
      statusText = `CẦN LUYỆN THÊM (${score}%)`;
    } else {
      feedback = '🎯 Chưa chính xác. Hãy nghe lại phát âm mẫu và luyện đọc lại từng từ nhé!';
      statusText = `CHƯA ĐẠT CHUẨN (${score}%)`;
    }

    return { score, feedback, details, isCorrect, statusText };
  }
}
