import path from 'path';
import { buildFormatSelector } from '../core/format-selector.js';
import { createPlaylistBar } from '../core/progress-bar.js';
import { ensureDir } from '../utils/paths.js';
import { PRIVACY_FLAGS, getVideoMergeFlags, getAudioFlags } from '../core/constants.js';
import { ffmpegPath } from '../core/binary.js';
import type { YTDlpInstance } from '../core/binary.js';
import type { VideoQuality, DownloadConfig } from '../core/types.js';

export function downloadPlaylist(
  ytDlp: YTDlpInstance,
  url: string,
  quality: VideoQuality,
  outputDir: string,
  totalCount: number,
  config: DownloadConfig,
): Promise<void> {
  ensureDir(outputDir);
  const total = totalCount > 0 ? totalCount : 100;

  const args: string[] = [
    url,
    '-f', buildFormatSelector(quality),
    '-o', path.join(outputDir, '%(playlist_index)s - %(title)s.%(ext)s'),
    '--concurrent-fragments', String(config.concurrentFragments),
    '--ignore-errors',
    ...PRIVACY_FLAGS,
    ...(quality === 'audio' ? getAudioFlags(ffmpegPath) : getVideoMergeFlags(ffmpegPath)),
  ];

  return new Promise<void>((resolve, reject) => {
    const bar = createPlaylistBar(total);
    bar.start(total, 0);
    let completed = 0;
    const emitter = ytDlp.exec(args);

    // yt-dlp emits a 'Destination:' line each time a file is fully written
    emitter.on('ytDlpEvent', (type: string, data: string) => {
      if (type === 'download' && data.trimStart().startsWith('Destination:')) {
        bar.update(Math.min(++completed, total));
      }
    });
    emitter.on('error', (err: Error) => { bar.stop(); reject(new Error(`yt-dlp: ${err.message}`)); });
    emitter.on('close', () => { bar.update(total); bar.stop(); resolve(); });
  });
}