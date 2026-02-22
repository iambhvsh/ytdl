# @iambhvsh/ytdl

A privacy-first, cross-platform CLI YouTube downloader backed by [yt-dlp](https://github.com/yt-dlp/yt-dlp).

No ads. No trackers. No data leaves your device.

```
██╗   ██╗████████╗██████╗ ██╗
╚██╗ ██╔╝╚══██╔══╝██╔══██╗██║
 ╚████╔╝    ██║   ██║  ██║██║
  ╚██╔╝     ██║   ██║  ██║██║
   ██║      ██║   ██████╔╝███████╗
   ╚═╝      ╚═╝   ╚═════╝ ╚══════╝
```

---

## Features

- **Privacy-first** — no telemetry, no logs, no history stored anywhere
- **On-device processing** — video/audio merging done locally via ffmpeg
- **Smart quality selection** — detects and displays available video resolution 
- **Universal audio** — outputs AAC audio for playback on all devices and players
- **Playlist support** — lists all entries before downloading, with quality control
- **Auto binary** — downloads dependencies automatically if not found
- **Cross-platform** — Windows, macOS, Linux, Android (Termux)

---

## Requirements

- **Node.js** >= 18.0.0

---

## Installation

```bash
npm install -g @iambhvsh/ytdl
```

Or with pnpm:
```bash
pnpm add -g @iambhvsh/ytdl
```

Or with yarn:
```bash
yarn global add @iambhvsh/ytdl
```

> On first run, if `yt-dlp` is not found on your system, it will be downloaded automatically from the [official GitHub releases](https://github.com/yt-dlp/yt-dlp/releases).

---

## Usage

Simply run:

```bash
ytdl
```

The interactive CLI will guide you through everything:

```
🔗  Enter YouTube URL:  https://www.youtube.com/watch?v=...

🔍  Fetching info...

🎬  Title     : Video Title
👤  Channel   : Artist Name
⏱   Duration  : 4m 1s

──────────────────────────────────────────────────────

🎬  Select quality:
❯ 1080p  — Full HD
  720p   — HD
  480p
  360p
  Audio only  — MP3

🚀  Starting download — 1080p

  ████████████████████ 100%  |  ↓ 3.2MiB/s  |  120.5MiB  |  ETA 0s

✅  Download complete!
📁  Saved to: ~/Downloads/YTDL/Videos
```

---

## Supported URL Types

| Type | Example |
|------|---------|
| Video | `https://youtube.com/watch?v=...` |
| Short URL | `https://youtu.be/...` |
| Shorts | `https://youtube.com/shorts/...` |
| Playlist | `https://youtube.com/playlist?list=...` |
| Channel | `https://youtube.com/@ChannelName` |
| Channel (legacy) | `https://youtube.com/channel/...` |

---

## Quality Options

For single videos, only resolutions that actually exist in the video are shown.

| Quality | Label |
|---------|-------|
| 2160p | 4K Ultra HD |
| 1440p | 2K QHD |
| 1080p | Full HD |
| 720p | HD |
| 480p | — |
| 360p | — |
| 240p | — |
| 144p | — |
| Audio only | MP3 (192kbps VBR) |

---

## Output Folders

Downloads are saved to your system's `Downloads` folder under `YTDL/`:

| Type | Path |
|------|------|
| Videos | `~/Downloads/YTDL/Videos/` |
| Audio | `~/Downloads/YTDL/Audio/` |
| Playlists | `~/Downloads/YTDL/Playlists/` |

**Android (Termux):** files go to `/sdcard/Download/YTDL/` so they're accessible from the device file manager.

---

## Playlist Downloads

When you enter a playlist URL, YTDL fetches all entries and displays them before asking for quality:

```
📋  Playlist  : Lo-fi Beats to Study To
👤  Channel   : ChillHop Music
📹  Videos    : 24

  #    Duration   Title
  ──────────────────────────────────────────────────
    1.  [3m 42s]   Sleepy Fish - Moments
    2.  [4m 11s]   Philanthrope - Moonlight
    3.  [2m 58s]   Idealism - Nostalgia
    ...

🎬  Select quality:
❯ 1080p  — Full HD
  ...
```

Each video in the playlist is downloaded at your selected quality (or the best available if that resolution doesn't exist for a particular video). Unavailable videos are skipped automatically.

---

## Privacy & Security

- Zero telemetry — no analytics, tracking, or usage data of any kind
- No download history stored to disk
- No metadata files written
- All video/audio merging happens locally via ffmpeg — no cloud processing
- The only outbound connections are to YouTube (for the video) and GitHub (only on first run, to fetch the yt-dlp binary if needed)

---

## Development

```bash
# Clone
git clone https://github.com/iambhvsh/ytdl.git
cd ytdl

# Install dependencies
pnpm install

# Run in dev mode (no build needed)
pnpm dev

# Type-check
pnpm typecheck

# Build
pnpm build
```

### Project Structure

```
src/
  core/
    binary.ts          — yt-dlp binary bootstrap & CJS interop
    constants.ts       — all flags and constant values
    format-selector.ts — yt-dlp -f format string builder
    info-resolver.ts   — metadata fetch + playlist detection
    progress-bar.ts    — reusable cli-progress bar factory
    types.ts           — all shared TypeScript types
  download/
    video.ts           — single video downloader
    audio.ts           — audio-only MP3 downloader
    playlist.ts        — full playlist downloader
  ui/
    banner.ts          — ASCII splash screen
    display.ts         — media info and status output
    prompts.ts         — all inquirer prompts
  utils/
    format.ts          — duration and label formatters
    paths.ts           — cross-platform output paths
    validate.ts        — YouTube URL validation
  main.ts              — entry point and download loop
bin/
  ytdl.js              — CLI shebang launcher
```

---

## License

MIT © [Bhavesh Patil](https://github.com/iambhvsh)