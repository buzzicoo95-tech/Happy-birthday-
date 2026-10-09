import {
  BIRTHDAY_AUDIO_FILE,
  BIRTHDAY_SOUND,
  SOUND_CLICK,
  SOUND_POP,
  SOUND_SUCCESS
} from '../config';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgAudio: HTMLAudioElement | null = null;
  private hasStartedBg: boolean = false;
  private hasPlayedCelebration: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('soulsync_music_muted');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      } catch {
        // ignore
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('soulsync_music_muted', String(muted));
    } catch {
      // ignore
    }

    if (this.bgAudio) {
      if (muted) {
        this.bgAudio.pause();
      } else if (this.hasStartedBg) {
        this.bgAudio.play().catch(() => {});
      }
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  /**
   * Initializes and starts the background music softly (volume ~0.28)
   * Designed to be called upon first user click (e.g. "Start Surprise ❤️")
   */
  public startBackgroundMusic() {
    this.hasStartedBg = true;
    if (this.isMuted) return;

    if (typeof window === 'undefined') return;

    try {
      if (!this.bgAudio) {
        const audio = new Audio();
        audio.src = BIRTHDAY_AUDIO_FILE.startsWith('/') ? BIRTHDAY_AUDIO_FILE : '/' + BIRTHDAY_AUDIO_FILE;
        audio.loop = true;
        audio.volume = 0.30; // exactly 0.30 as requested

        audio.addEventListener('error', () => {
          // If file not found, synthesize ambient melodic chimes as peaceful fallback
          this.playSynthesizedAmbientLoop();
        });

        this.bgAudio = audio;
      }

      this.bgAudio.play().catch(() => {
        // Autoplay policy or missing file fallback
        this.playSynthesizedAmbientLoop();
      });
    } catch {
      this.playSynthesizedAmbientLoop();
    }
  }

  private playAudioFile(src: string, fallbackFn: () => void, volume = 0.4) {
    if (this.isMuted) return;
    try {
      const audio = new Audio();
      audio.src = src.startsWith('/') ? src : '/' + src;
      audio.volume = volume;
      audio.play().catch(() => {
        fallbackFn();
      });
    } catch {
      fallbackFn();
    }
  }

  // Soft click (Next button, nav)
  public playClick() {
    if (this.isMuted) return;
    this.playAudioFile(SOUND_CLICK, () => {
      this.synthSoftClick();
    }, 0.25);
  }

  // Soft pop (Option selection)
  public playPop() {
    if (this.isMuted) return;
    this.playAudioFile(SOUND_POP, () => {
      this.synthSoftPop();
    }, 0.3);
  }

  // Sparkle / High match chime
  public playMatchChime() {
    if (this.isMuted) return;
    this.playAudioFile(SOUND_SUCCESS, () => {
      this.synthMatchChime();
    }, 0.35);
  }

  // Gift open fanfare (magical reveal)
  public playGiftFanfare() {
    if (this.isMuted) return;
    this.synthGiftFanfare();
  }

  // Final birthday reveal celebration sound (Plays only ONCE)
  public playCelebrationSound() {
    if (this.isMuted || this.hasPlayedCelebration) return;
    this.hasPlayedCelebration = true;

    this.playAudioFile(BIRTHDAY_SOUND, () => {
      this.synthCelebrationFanfare();
    }, 0.45);
  }

  // ==========================================
  // Web Audio Fallbacks & Sound Generators
  // ==========================================

  private synthSoftClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // ignore
    }
  }

  private synthSoftPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.075);
    } catch {
      // ignore
    }
  }

  private synthMatchChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [587.33, 659.25, 880, 1046.5]; // D5, E5, A5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = this.ctx.currentTime + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch {
      // ignore
    }
  }

  private synthGiftFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Magical harp glissando
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = this.ctx.currentTime + idx * 0.05;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.55);
      });
    } catch {
      // ignore
    }
  }

  private synthCelebrationFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Joyous celebration chords
      const chords = [
        [523.25, 659.25, 783.99],   // C major
        [587.33, 739.99, 880.0],    // D major
        [659.25, 830.61, 987.77],   // E major
        [783.99, 987.77, 1174.66, 1567.98] // G chord triumph
      ];

      chords.forEach((chord, step) => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + step * 0.16;
        chord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.55);
        });
      });
    } catch {
      // ignore
    }
  }

  private playSynthesizedAmbientLoop() {
    // Plays soft musical box chimes if external mp3 is not present
    this.playBirthdayMelody();
  }

  public playBirthdayMelody() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const song = [
        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 440.0, d: 0.5, pause: 0.05 },
        { f: 392.0, d: 0.5, pause: 0.05 },
        { f: 523.25, d: 0.6, pause: 0.05 },
        { f: 493.88, d: 0.8, pause: 0.15 },

        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 440.0, d: 0.5, pause: 0.05 },
        { f: 392.0, d: 0.5, pause: 0.05 },
        { f: 587.33, d: 0.6, pause: 0.05 },
        { f: 523.25, d: 0.8, pause: 0.15 },

        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 392.0, d: 0.3, pause: 0.05 },
        { f: 783.99, d: 0.6, pause: 0.05 },
        { f: 659.25, d: 0.6, pause: 0.05 },
        { f: 523.25, d: 0.6, pause: 0.05 },
        { f: 493.88, d: 0.5, pause: 0.05 },
        { f: 440.0, d: 0.7, pause: 0.15 },

        { f: 698.46, d: 0.3, pause: 0.05 },
        { f: 698.46, d: 0.3, pause: 0.05 },
        { f: 659.25, d: 0.6, pause: 0.05 },
        { f: 523.25, d: 0.6, pause: 0.05 },
        { f: 587.33, d: 0.6, pause: 0.05 },
        { f: 523.25, d: 1.0, pause: 0.2 }
      ];

      let start = this.ctx.currentTime + 0.05;
      song.forEach(note => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + note.d + 0.05);

        start += note.d + note.pause;
      });
    } catch {
      // ignore
    }
  }

  // Alias for backward compatibility
  public playTap() {
    this.playPop();
  }
}

export const sound = new SoundEngine();
