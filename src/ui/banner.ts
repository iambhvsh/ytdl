import chalk from 'chalk';
import figlet from 'figlet';

export function showBanner(): void {
  console.clear();
  console.log(chalk.cyan(figlet.textSync('YTDL', { font: 'ANSI Shadow', horizontalLayout: 'full' })));
  console.log(chalk.green.bold('YTDL — YouTube Downloader  V1'));
  console.log(chalk.redBright('Crafted with ♥ by Bhavesh Patil'));
  console.log(chalk.dim('https://ytdl.iambhvsh.in'));
  console.log(chalk.yellow('Ctrl+C to exit\n'));
}