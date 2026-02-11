/**
 * Audio Event System
 *
 * Queues audio events for the audio manager to play.
 * Events: gathering completion, crafting, tech unlock, etc.
 */

export interface AudioEvent {
  type: string;
  resourceType?: string;
  timestamp?: number;
}

let audioEventQueue: AudioEvent[] = [];

export function queueAudioEvent(event: AudioEvent): void {
  audioEventQueue.push({
    ...event,
    timestamp: Date.now(),
  });
}

export function getAudioEvents(): AudioEvent[] {
  const events = [...audioEventQueue];
  audioEventQueue = []; // Clear queue
  return events;
}

export function clearAudioEvents(): void {
  audioEventQueue = [];
}
