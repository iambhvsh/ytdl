import type { YTDlpInstance } from './binary.js';
import type { MediaInfo, RawMediaInfo, RawFormat, RawPlaylistEntry, PlaylistEntry } from './types.js';

const KNOWN_HEIGHTS: readonly number[] = [2160, 1440, 1080, 720, 480, 360, 240, 144];

export function isPlaylistUrl(url: string): boolean {
  return (
    /[?&]list=/.test(url) ||
    /youtube\.com\/@/.test(url) ||
    /youtube\.com\/channel\//.test(url) ||
    /youtube\.com\/user\//.test(url)
  );
}

function extractHeights(formats: readonly RawFormat[]): readonly number[] {
  const seen = new Set<number>();
  for (const f of formats) {
    if (f.vcodec !== 'none' && f.height) seen.add(f.height);
  }
  return KNOWN_HEIGHTS.filter((h) => seen.has(h));
}

function parseEntries(entries: readonly RawPlaylistEntry[]): readonly PlaylistEntry[] {
  return entries.map((e, i) => ({
    index: i + 1,
    id: e.id ?? e.url ?? `track-${i}`,
    title: e.title ?? 'Unknown',
    duration: e.duration ?? 0,
  }));
}

// Must use --flat-playlist --dump-single-json for playlists.
// getVideoInfo() passes -f best internally which errors on playlist URLs.
async function fetchPlaylist(ytDlp: YTDlpInstance, url: string): Promise<MediaInfo> {
  const raw = JSON.parse(
    await ytDlp.execPromise([url, '--flat-playlist', '--dump-single-json', '--no-warnings']),
  ) as RawMediaInfo;
  const entries = raw.entries ? parseEntries(raw.entries) : [];
  return {
    type: 'playlist',
    title: raw.title ?? 'Unknown Playlist',
    uploader: raw.uploader ?? raw.channel ?? 'Unknown',
    count: entries.length,
    entries,
  };
}

async function fetchVideo(ytDlp: YTDlpInstance, url: string): Promise<MediaInfo> {
  const raw = (await ytDlp.getVideoInfo(url)) as RawMediaInfo;
  return {
    type: 'video',
    title: raw.title ?? 'Unknown Video',
    uploader: raw.uploader ?? raw.channel ?? 'Unknown',
    duration: raw.duration ?? 0,
    availableHeights: raw.formats ? extractHeights(raw.formats) : KNOWN_HEIGHTS,
  };
}

export async function resolveMediaInfo(ytDlp: YTDlpInstance, url: string): Promise<MediaInfo> {
  return isPlaylistUrl(url) ? fetchPlaylist(ytDlp, url) : fetchVideo(ytDlp, url);
}