import cliProgress from 'cli-progress';

export function createVideoBar(): cliProgress.SingleBar {
  return new cliProgress.SingleBar(
    {
      format: '  {bar} {percentage}%  |  ↓ {speed}  |  {size}  |  ETA {eta}s',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
      forceRedraw: true,
    },
    cliProgress.Presets.shades_classic,
  );
}

export function createPlaylistBar(total: number): cliProgress.SingleBar {
  return new cliProgress.SingleBar(
    {
      format: `  [{bar}] {value}/${total} videos  ({percentage}%)`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
      forceRedraw: true,
    },
    cliProgress.Presets.shades_classic,
  );
}

// Custom token keys must be initialised in bar.start() — missing keys render blank
export const INITIAL_VIDEO_PAYLOAD = { speed: 'starting...', size: '?' } as const;
export const DONE_VIDEO_PAYLOAD    = { speed: 'done', size: '✓' } as const;