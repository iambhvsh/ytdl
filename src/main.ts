import chalk from 'chalk';
import { bootstrapBinary } from './core/binary.js';
import { resolveMediaInfo } from './core/info-resolver.js';
import { DEFAULT_DOWNLOAD_CONFIG } from './core/types.js';
import { downloadVideo } from './download/video.js';
import { downloadAudio } from './download/audio.js';
import { downloadPlaylist } from './download/playlist.js';
import { showBanner } from './ui/banner.js';
import { promptUrl, promptQuality, promptContinue } from './ui/prompts.js';
import { displayMediaInfo, displayError, displaySuccess } from './ui/display.js';
import { isValidYouTubeUrl } from './utils/validate.js';
import { getOutputPaths } from './utils/paths.js';
import { qualityLabel } from './utils/format.js';

const cols = () => Math.min(Math.max(process.stdout.columns ?? 54, 40), 80);

// Inquirer v10 throws ExitPromptError on Ctrl+C — catch it for a clean exit
function isUserExit(err: unknown): boolean {
  return (
    err instanceof Error && (
      err.message.includes('SIGINT') ||
      err.message.toLowerCase().includes('force closed') ||
      err.constructor?.name === 'ExitPromptError'
    )
  );
}

async function run(): Promise<void> {
  showBanner();

  const ytDlp  = await bootstrapBinary();
  const paths  = getOutputPaths();
  const config = DEFAULT_DOWNLOAD_CONFIG;

  console.log(chalk.dim(`📁  Downloads folder: ${paths.base}\n`));

  while (true) {
    console.log(chalk.gray('─'.repeat(cols())));

    const url = await promptUrl();

    if (!isValidYouTubeUrl(url)) {
      displayError('Invalid YouTube URL. Please try again.');
      continue;
    }

    console.log(chalk.yellow('\n🔍  Fetching info...\n'));

    let info;
    try {
      info = await resolveMediaInfo(ytDlp, url);
    } catch (err: unknown) {
      displayError(`Could not fetch info: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    displayMediaInfo(info);

    const availableHeights = info.type === 'video' ? info.availableHeights : [];
    const quality   = await promptQuality(availableHeights);
    const label     = qualityLabel(quality);
    const outputDir = info.type === 'playlist'
      ? paths.playlists
      : quality === 'audio' ? paths.audio : paths.videos;

    console.log(chalk.green(`\n🚀  Starting download — ${label}\n`));

    try {
      if (info.type === 'playlist') {
        await downloadPlaylist(ytDlp, url, quality, outputDir, info.count, config);
      } else if (quality === 'audio') {
        await downloadAudio(ytDlp, url, outputDir, config);
      } else {
        await downloadVideo(ytDlp, url, quality, outputDir, config);
      }
      displaySuccess(outputDir);
    } catch (err: unknown) {
      displayError(`Download failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    const again = await promptContinue();
    if (!again) break;
  }

  console.log(chalk.cyan('\n✨  Thanks for using YTDL!'));
  console.log(chalk.dim('   https://github.com/iambhvsh\n'));
}

run().catch((err: unknown) => {
  if (isUserExit(err)) {
    process.stdout.write(chalk.cyan('\n\n✨ See you soon!\n'));
    process.exit(0);
  }
  process.stderr.write(chalk.red(`\n💥  Fatal: ${err instanceof Error ? err.message : String(err)}\n`));
  process.exit(1);
});