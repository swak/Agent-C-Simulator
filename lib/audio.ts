/**
 * Audio Manager using Howler.js
 * Provides sound effects for game events and exposes lastPlayed for testing
 */

import { Howl } from 'howler';

export type SoundEffect =
  | 'gather-wood'
  | 'gather-stone'
  | 'craft-complete'
  | 'tech-unlock'
  | 'welcome-back';

export class AudioManager {
  private sounds: Map<SoundEffect, Howl> = new Map();
  private volume = 0.7;
  public lastPlayed: SoundEffect | null = null;

  constructor() {
    // Initialize sound effects
    // Using placeholder data URLs for now (would be actual sound files in production)
    this.sounds.set(
      'gather-wood',
      new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: this.volume,
      })
    );

    this.sounds.set(
      'gather-stone',
      new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: this.volume,
      })
    );

    this.sounds.set(
      'craft-complete',
      new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: this.volume,
      })
    );

    this.sounds.set(
      'tech-unlock',
      new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: this.volume,
      })
    );

    this.sounds.set(
      'welcome-back',
      new Howl({
        src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: this.volume,
      })
    );
  }

  play(sound: SoundEffect): void {
    const howl = this.sounds.get(sound);
    if (howl) {
      howl.play();
      this.lastPlayed = sound;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((howl) => {
      howl.volume(this.volume);
    });
  }

  getVolume(): number {
    return this.volume;
  }
}

export const audioManager = new AudioManager();

// Expose to window for test access
if (typeof window !== 'undefined') {
  const gameRef = (window.game ??= {} as NonNullable<typeof window.game>);
  if (gameRef) gameRef.audio = audioManager;
}
