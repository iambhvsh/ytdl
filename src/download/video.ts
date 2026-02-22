import path from 'path';
import { buildFormatSelector } from '../core/format-selector.js';
import { createVideoBar, INITIAL_VIDEO_PAYLOAD, DONE_VIDEO_PAYLOAD } from '../core/progress-bar.js';
import { ensureDir } from '../utils/paths.js';
import { clampPercent } from '../utils/format.js';
import { PRIVACY_FLAGS, getVideoMergeFlags, getAudioFlags } from '../core/constants.js';
import { ffmpegPath } from '../core/binary.js';
import type { YTDlpInstance } from '../core/binary.js';
import type { VideoQuality, YtDlpProgress, DownloadConfig } from '../core/types.js';

export function downloadVideo(
  ytDlp: YTDlpInstance,
  url: string,
  quality: VideoQuality,
  outputDir: string,
  config: DownloadConfig,
): Promise<void> {
  ensureDir(outputDir);

  const args: string[] = [
    url,
    '-f', buildFormatSelector(quality),
    '-o', path.join(outputDir, '%(title)s.%(ext)s'),
    '--concurrent-fragments', String(config.concurrentFragments),
    ...PRIVACY_FLAGS,
    ...(quality === 'audio' ? getAudioFlags(ffmpegPath) : getVideoMergeFlags(ffmpegPath)),
  ];

  return new Promise<void>((resolve, reject) => {
    const bar = createVideoBar();
    bar.start(100, 0, INITIAL_VIDEO_PAYLOAD);
    const emitter = ytDlp.exec(args);

    emitter.on('progress', (p: YtDlpProgress) => {
      if (typeof p.percent === 'number') {
        bar.update(clampPercent(p.percent), { speed: p.currentSpeed ?? '...', size: p.totalSize ?? '?' });
      }
    });
    emitter.on('error', (err: Error) => { bar.stop(); reject(new Error(`yt-dlp: ${err.message}`)); });
    emitter.on('close', () => { bar.update(100, DONE_VIDEO_PAYLOAD); bar.stop(); resolve(); });
  });
}