import chalk from 'chalk';
import { formatDuration } from '../utils/format.js';
import type { MediaInfo, PlaylistEntry } from '../core/types.js';

const cols = () => Math.min(Math.max(process.stdout.columns ?? 54, 40), 80);
const divider = () => chalk.gray('─'.repeat(cols()));

function displayVideo(info: Extract<MediaInfo, { type: 'video' }>): void {
  console.log(chalk.cyan(`\n🎬  Title     : ${info.title}`));
  console.log(chalk.green(`👤  Channel   : ${info.uploader}`));
  console.log(chalk.blue(`⏱   Duration  : ${formatDuration(info.duration)}`));
}

function displayPlaylist(info: Extract<MediaInfo, { type: 'playlist' }>): void {
  console.log(chalk.cyan(`\n📋  Playlist  : ${info.title}`));
  console.log(chalk.green(`👤  Channel   : ${info.uploader}`));
  console.log(chalk.blue(`📹  Videos    : ${info.count}\n`));

  if (info.entries.length > 0) {
    const w = cols() - 4;
    console.log(chalk.dim('  #    Duration   Title'));
    console.log(chalk.dim('  ' + '─'.repeat(w)));
    info.entries.forEach((e: PlaylistEntry) => {
      const num   = chalk.yellow(`  ${String(e.index).padStart(3, ' ')}.`);
      const dur   = chalk.dim(`[${formatDuration(e.duration)}]`.padEnd(12));
      const max   = w - 20;
      const title = chalk.white(e.title.length > max ? e.title.slice(0, max - 3) + '...' : e.title);
      console.log(`${num}  ${dur}  ${title}`);
    });
  }
}

export function displayMediaInfo(info: MediaInfo): void {
  info.type === 'playlist' ? displayPlaylist(info) : displayVideo(info);
  console.log(`\n${divider()}\n`);
}

export function displayError(message: string): void {
  console.log(chalk.red(`\n❌  ${message}`));
}

export function displaySuccess(outputDir: string): void {
  console.log(chalk.green('\n✅  Download complete!'));
  console.log(chalk.dim(`📁  Saved to: ${outputDir}`));
}