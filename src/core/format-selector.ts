import type { VideoQuality } from './types.js';

// No codec constraints on video — they cause silent fallback ignoring height limits.
// Audio constrained to m4a (AAC) for universal device compatibility.
export function buildFormatSelector(quality: VideoQuality): string {
  if (quality === 'audio') {
    return 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best';
  }
  return (
    `bestvideo[height<=${quality}]+bestaudio[ext=m4a]` +
    `/bestvideo[height<=${quality}]+bestaudio` +
    `/best[height<=${quality}]`
  );
}