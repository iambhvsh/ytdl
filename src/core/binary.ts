import YTDlpWrapImport from 'yt-dlp-wrap';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

// CJS interop: yt-dlp-wrap exports { default: class } in CJS
type YTDlpWrapConstructor = typeof YTDlpWrapImport;
const YTDlpWrap = (
  (YTDlpWrapImport as unknown as { default: YTDlpWrapConstructor }).default ?? YTDlpWrapImport
) as YTDlpWrapConstructor;

export type YTDlpInstance = InstanceType<YTDlpWrapConstructor>;

const PLATFORM  = os.platform();
const PREFIX    = process.env['PREFIX'] ?? '';
const IS_WIN    = PLATFORM === 'win32';
const IS_MAC    = PLATFORM === 'darwin';
const IS_TERMUX = PREFIX.includes('com.termux');

// All managed binaries live here — never rely on system PATH for our own binaries
const YTDL_DIR   = path.join(os.homedir(), '.ytdl');
export const YTDLP_PATH = path.join(YTDL_DIR, IS_WIN ? 'yt-dlp.exe' : 'yt-dlp');

// Hardcoded ffmpeg paths per platform from default package manager install locations
const FFMPEG_CANDIDATES: readonly string[] = IS_WIN
  ? [
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
      path.join(os.homedir(), 'scoop', 'shims', 'ffmpeg.exe'),
    ]
  : IS_MAC
    ? ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg']
    : IS_TERMUX
      ? [`${PREFIX}/bin/ffmpeg`, '/data/data/com.termux/files/usr/bin/ffmpeg']
      : ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/snap/bin/ffmpeg', path.join(os.homedir(), '.local', 'bin', 'ffmpeg')];

export let ffmpegPath = 'ffmpeg';

// ─── Termux ───────────────────────────────────────────────────────────────────

function termuxStorageReady(): boolean {
  try { fs.accessSync(path.join(os.homedir(), 'storage', 'downloads')); return true; }
  catch { return false; }
}

function setupTermuxStorage(): void {
  process.stdout.write('📂  Requesting Android storage permission...\n');
  process.stdout.write('    Please tap "Allow" in the dialog that appears.\n\n');
  // Blocks until the user responds to the Android permission dialog
  spawnSync('termux-setup-storage', [], { stdio: 'inherit' });
  // Give Android time to create the ~/storage symlinks after permission grant
  const until = Date.now() + 3000;
  while (Date.now() < until) { /* wait */ }
  if (termuxStorageReady()) {
    process.stdout.write('✅  Storage access granted.\n');
  } else {
    process.stdout.write('⚠️  Storage symlinks not detected. Downloads may go to internal storage.\n');
  }
}

// ─── ffmpeg ───────────────────────────────────────────────────────────────────

function findFfmpeg(): string | null {
  for (const p of FFMPEG_CANDIDATES) {
    try { fs.accessSync(p, fs.constants.X_OK); return p; } catch { /* next */ }
  }
  // PATH fallback catches WinGet, custom, and other non-standard installs
  const r = spawnSync(IS_WIN ? 'where' : 'which', ['ffmpeg'], { encoding: 'utf-8' });
  if (r.status === 0 && r.stdout) {
    const first = r.stdout.split(/\r?\n/)[0]?.trim();
    if (first) return first;
  }
  return null;
}

function installFfmpeg(): boolean {
  // winget and brew require interactive TTY — cannot auto-install silently
  if (IS_WIN || IS_MAC) return false;

  let cmd: string;
  if (IS_TERMUX) {
    cmd = 'pkg install ffmpeg -y';
  } else {
    const has = (b: string) => spawnSync('which', [b], { encoding: 'utf-8' }).status === 0;
    if (has('apt-get'))     cmd = 'apt-get install -y ffmpeg';
    else if (has('dnf'))    cmd = 'dnf install -y ffmpeg';
    else if (has('pacman')) cmd = 'pacman -S --noconfirm ffmpeg';
    else return false;
  }

  process.stdout.write('⬇️  Installing ffmpeg...\n');
  return spawnSync(cmd, [], { shell: true, stdio: 'inherit' }).status === 0;
}

function ffmpegHint(): string {
  if (IS_WIN)    return 'winget install --id=Gyan.FFmpeg -e';
  if (IS_MAC)    return 'brew install ffmpeg';
  if (IS_TERMUX) return 'pkg install ffmpeg';
  return 'sudo apt install ffmpeg';
}

// ─── yt-dlp ───────────────────────────────────────────────────────────────────

async function ensureYtDlp(): Promise<{ instance: YTDlpInstance; fresh: boolean }> {
  fs.mkdirSync(YTDL_DIR, { recursive: true });
  let fresh = false;

  if (!fs.existsSync(YTDLP_PATH)) {
    process.stdout.write('⬇️  Downloading yt-dlp...\n');
    // First arg is exact destination path per yt-dlp-wrap docs
    await YTDlpWrap.downloadFromGithub(YTDLP_PATH);
    process.stdout.write('✅  yt-dlp downloaded.\n');
    fresh = true;
  }

  // Always pass explicit path — never use PATH lookup for our managed binary
  const instance = new YTDlpWrap(YTDLP_PATH);

  try {
    await instance.getVersion();
  } catch {
    // Binary is corrupt — delete and re-download exactly once, no loop
    process.stdout.write('⚠️  yt-dlp binary corrupt, re-downloading...\n');
    fs.rmSync(YTDLP_PATH, { force: true });
    await YTDlpWrap.downloadFromGithub(YTDLP_PATH);
    await new YTDlpWrap(YTDLP_PATH).getVersion(); // throws if still broken
    process.stdout.write('✅  yt-dlp ready.\n');
    fresh = true;
  }

  return { instance, fresh };
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export async function bootstrapBinary(): Promise<YTDlpInstance> {
  let fresh = false;

  // Termux first-run: request Android storage permission and create ~/storage symlinks
  if (IS_TERMUX && !termuxStorageReady()) {
    setupTermuxStorage();
    fresh = true;
  }

  // Locate ffmpeg; auto-install on Linux/Termux where package managers are non-interactive
  let detected = findFfmpeg();
  if (!detected) {
    if (installFfmpeg()) detected = findFfmpeg();
    if (!detected) {
      throw new Error(`ffmpeg not found.\n\n  Install: ${ffmpegHint()}\n  Then re-run: ytdl`);
    }
    fresh = true;
  }
  ffmpegPath = detected;

  // Ensure yt-dlp binary exists at ~/.ytdl/yt-dlp[.exe]
  const { instance, fresh: ytFresh } = await ensureYtDlp();
  if (ytFresh) fresh = true;

  // After any install, pause briefly then clear so the banner renders clean
  if (fresh) {
    await new Promise<void>((r) => setTimeout(r, 1200));
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  }

  return instance;
}