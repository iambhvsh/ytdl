import inquirer from 'inquirer';
import type { VideoQuality } from '../core/types.js';

interface UrlAnswer      { url: string; }
interface QualityAnswer  { quality: VideoQuality; }
interface ContinueAnswer { again: boolean; }

const HEIGHT_LABELS: Readonly<Record<number, string>> = {
  2160: '2160p  — 4K Ultra HD',
  1440: '1440p  — 2K QHD',
  1080: '1080p  — Full HD',
  720:  '720p   — HD',
  480:  '480p',
  360:  '360p',
  240:  '240p',
  144:  '144p',
};

const ALL_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240, 144];

export async function promptUrl(): Promise<string> {
  const { url } = await inquirer.prompt<UrlAnswer>([{
    type: 'input',
    name: 'url',
    message: '🔗  Enter YouTube URL:',
    validate: (v: string) => v.trim().length > 0 ? true : 'URL cannot be empty',
  }]);
  return url.trim();
}

export async function promptQuality(availableHeights: readonly number[]): Promise<VideoQuality> {
  const heights = availableHeights.length > 0 ? availableHeights : ALL_HEIGHTS;
  const choices: Array<{ name: string; value: VideoQuality }> = [
    ...heights.map((h) => ({ name: HEIGHT_LABELS[h] ?? `${h}p`, value: h as VideoQuality })),
    { name: 'Audio only  — MP3', value: 'audio' },
  ];
  const { quality } = await inquirer.prompt<QualityAnswer>([{
    type: 'select',
    name: 'quality',
    message: '🎬  Select quality:',
    choices,
    default: Math.max(choices.findIndex((c) => c.value === 1080), 0),
    pageSize: choices.length,
  }]);
  return quality;
}

export async function promptContinue(): Promise<boolean> {
  const { again } = await inquirer.prompt<ContinueAnswer>([{
    type: 'confirm',
    name: 'again',
    message: '🔄  Download another?',
    default: true,
  }]);
  return again;
}