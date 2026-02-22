import os from 'os';
import path from 'path';
import fs from 'fs';
import { TERMUX_PREFIX_MARKER, DIR_NAMES } from '../core/constants.js';
import type { OutputPaths } from '../core/types.js';

function resolveBaseDir(): string {
  const prefix = process.env['PREFIX'] ?? '';
  // Termux: use /sdcard/Download so files are visible in Android file manager
  if (prefix.includes(TERMUX_PREFIX_MARKER)) return '/sdcard/Download/YTDL';
  return path.join(os.homedir(), 'Downloads', 'YTDL');
}

export function getOutputPaths(): OutputPaths {
  const base = resolveBaseDir();
  return {
    base,
    videos:    path.join(base, DIR_NAMES.VIDEOS),
    audio:     path.join(base, DIR_NAMES.AUDIO),
    playlists: path.join(base, DIR_NAMES.PLAYLISTS),
  };
}

export function ensureDir(dirPath: string): void {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err: unknown) {
    throw new Error(`Cannot create directory "${dirPath}": ${err instanceof Error ? err.message : String(err)}`);
  }
}