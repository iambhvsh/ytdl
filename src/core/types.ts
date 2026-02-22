export type VideoQuality = 2160 | 1440 | 1080 | 720 | 480 | 360 | 240 | 144 | 'audio';

export interface VideoInfo {
  readonly type: 'video';
  readonly title: string;
  readonly uploader: string;
  readonly duration: number;
  readonly availableHeights: readonly number[];
}

export interface PlaylistEntry {
  readonly index: number;
  readonly title: string;
  readonly duration: number;
  readonly id: string;
}

export interface PlaylistInfo {
  readonly type: 'playlist';
  readonly title: string;
  readonly uploader: string;
  readonly count: number;
  readonly entries: readonly PlaylistEntry[];
}

export type MediaInfo = VideoInfo | PlaylistInfo;

export interface OutputPaths {
  readonly base: string;
  readonly videos: string;
  readonly audio: string;
  readonly playlists: string;
}

export interface YtDlpProgress {
  readonly percent?: number;
  readonly totalSize?: string;
  readonly currentSpeed?: string;
  readonly eta?: string;
}

export interface RawFormat {
  readonly height?: number | null;
  readonly vcodec?: string;
}

export interface RawPlaylistEntry {
  readonly id?: string;
  readonly title?: string;
  readonly duration?: number;
  readonly url?: string;
}

export interface RawMediaInfo {
  readonly _type?: string;
  readonly title?: string;
  readonly uploader?: string;
  readonly channel?: string;
  readonly duration?: number;
  readonly formats?: readonly RawFormat[];
  readonly entries?: readonly RawPlaylistEntry[];
}

export interface DownloadConfig {
  readonly concurrentFragments: number;
}

export const DEFAULT_DOWNLOAD_CONFIG: DownloadConfig = { concurrentFragments: 16 } as const;