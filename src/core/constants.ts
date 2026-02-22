export const PRIVACY_FLAGS: readonly string[] = [
  '--no-warnings',
  '--no-cache-dir',
  '--no-write-info-json',
  '--no-write-comments',
  '--no-write-thumbnail',
  '--no-mtime',
  '--geo-bypass',
] as const;

// --ffmpeg-location ensures yt-dlp uses our detected binary, not whatever is on PATH.
// AAC re-encode (-c:a aac) guarantees playback on Windows, macOS, Android, iOS.
export function getVideoMergeFlags(ffmpegPath: string): readonly string[] {
  return ['--ffmpeg-location', ffmpegPath, '--merge-output-format', 'mp4', '--postprocessor-args', 'ffmpeg:-c:a aac -b:a 192k'];
}

export function getAudioFlags(ffmpegPath: string): readonly string[] {
  return ['--ffmpeg-location', ffmpegPath, '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0'];
}

export const YOUTUBE_URL_PATTERNS: readonly RegExp[] = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^&]*&)*v=[\w-]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?(?:[^&]*&)*list=[\w-]+/,
  /(?:https?:\/\/)?youtu\.be\/[\w-]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@[\w-]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/[\w-]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/[\w-]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]+/,
] as const;

export const TERMUX_PREFIX_MARKER = '/com.termux/';
export const DIR_NAMES = { VIDEOS: 'Videos', AUDIO: 'Audio', PLAYLISTS: 'Playlists' } as const;