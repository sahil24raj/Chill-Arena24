import { Howl, Howler } from 'howler';
import { AudioSettings } from './types';

class SoundEngine {
  private static instance: SoundEngine;
  private sfxMap: Map<string, Howl> = new Map();
  private currentBGM: Howl | null = null;
  private webAudioCtx: AudioContext | null = null;

  public settings: AudioSettings = {
    muted: false,
    masterVolume: 0.8,
    sfxVolume: 0.8,
    bgmVolume: 0.5,
  };

  public get isMuted(): boolean {
    return this.settings.muted;
  }

  public set isMuted(val: boolean) {
    this.setMuted(val);
  }

  private constructor() {
    this.loadSettings();
    this.setupAutoplayUnlock();
  }

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('chill_arena_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch {
      // Ignore JSON error
    }
    this.applySettings();
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('chill_arena_audio_settings', JSON.stringify(this.settings));
    } catch {
      // Ignore storage error
    }
  }

  private applySettings() {
    if (typeof window === 'undefined') return;
    Howler.mute(this.settings.muted);
    Howler.volume(this.settings.masterVolume);
    if (this.currentBGM) {
      this.currentBGM.volume(this.settings.bgmVolume * this.settings.masterVolume);
    }
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      if (this.webAudioCtx && this.webAudioCtx.state === 'suspended') {
        this.webAudioCtx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private initWebAudio() {
    if (!this.webAudioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.webAudioCtx = new AudioContextClass();
      }
    }
    if (this.webAudioCtx && this.webAudioCtx.state === 'suspended') {
      this.webAudioCtx.resume();
    }
  }

  // --- Dynamic Procedural Sound Synthesizers (Web Audio Fallback) ---
  private synthTone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15) {
    if (this.settings.muted) return;
    this.initWebAudio();
    if (!this.webAudioCtx) return;

    try {
      const now = this.webAudioCtx.currentTime;
      const osc = this.webAudioCtx.createOscillator();
      const gain = this.webAudioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), now + duration);
      }

      const effectiveGain = gainVal * this.settings.sfxVolume * this.settings.masterVolume;
      gain.gain.setValueAtTime(effectiveGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.webAudioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context error
    }
  }

  // --- Standardized SFX Methods ---
  public playClick() {
    this.synthTone(800, 400, 0.05, 'sine', 0.12);
  }

  public playJump() {
    this.synthTone(150, 600, 0.15, 'square', 0.1);
  }

  public playCoin() {
    this.synthTone(987.77, 1318.51, 0.12, 'sine', 0.15); // B5 to E6
  }

  public playCorrect() {
    if (this.settings.muted) return;
    this.initWebAudio();
    if (!this.webAudioCtx) return;
    const now = this.webAudioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => this.synthTone(freq, freq, 0.08, 'triangle', 0.12), i * 60);
    });
  }

  public playWrong() {
    if (this.settings.muted) return;
    this.initWebAudio();
    if (!this.webAudioCtx) return;
    [250, 200, 150].forEach((freq, i) => {
      setTimeout(() => this.synthTone(freq, freq * 0.8, 0.12, 'sawtooth', 0.15), i * 80);
    });
  }

  public playLevelUp() {
    if (this.settings.muted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.synthTone(freq, freq, 0.1, 'sine', 0.15), i * 80);
    });
  }

  public playGameOver() {
    if (this.settings.muted) return;
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.synthTone(freq, freq * 0.9, 0.2, 'sawtooth', 0.18), i * 140);
    });
  }

  public playVictory() {
    if (this.settings.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      setTimeout(() => this.synthTone(freq, freq, 0.18, 'triangle', 0.2), i * 100);
    });
  }

  public playCombo(count: number) {
    const baseFreq = 400 + Math.min(count * 50, 800);
    this.synthTone(baseFreq, baseFreq * 1.5, 0.1, 'triangle', 0.15);
  }

  public playFlip() {
    this.synthTone(300, 700, 0.12, 'triangle', 0.12);
  }

  public playThrow() {
    this.synthTone(600, 150, 0.18, 'sine', 0.15);
  }

  public playHit() {
    this.synthTone(220, 80, 0.1, 'square', 0.18);
  }

  public playSpin() {
    this.synthTone(400, 800, 0.08, 'sine', 0.1);
  }

  public playBuzzer() {
    this.synthTone(150, 80, 0.25, 'sawtooth', 0.2);
  }

  // --- Background Music (BGM) Management ---
  public playBGM(src: string | string[], loop = true) {
    if (typeof window === 'undefined') return;
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM.unload();
    }

    const sources = Array.isArray(src) ? src : [src];
    this.currentBGM = new Howl({
      src: sources,
      html5: true,
      loop: loop,
      volume: this.settings.bgmVolume * this.settings.masterVolume,
      autoplay: !this.settings.muted,
    });
    this.currentBGM.play();
  }

  public stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM.unload();
      this.currentBGM = null;
    }
  }

  // --- Volume & Setting Controls ---
  public toggleMute(): boolean {
    this.settings.muted = !this.settings.muted;
    this.applySettings();
    this.saveSettings();
    return this.settings.muted;
  }

  public setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.applySettings();
    this.saveSettings();
  }

  public setMasterVolume(vol: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, vol));
    this.applySettings();
    this.saveSettings();
  }

  public setSFXVolume(vol: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public setBGMVolume(vol: number) {
    this.settings.bgmVolume = Math.max(0, Math.min(1, vol));
    this.applySettings();
    this.saveSettings();
  }
}

export const audioManager = SoundEngine.getInstance();
// Compatibility alias with existing soundFx
export const soundFx = audioManager;
