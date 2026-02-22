import type { VideoQuality } from '../core/types.js';

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function qualityLabel(quality: VideoQuality): string {
  return quality === 'audio' ? 'Audio (MP3)' : `${quality}p`;
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.floor(value)));
}