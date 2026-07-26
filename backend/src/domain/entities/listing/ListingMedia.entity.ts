export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | '360' | 'AUDIO' | 'PDF';

export class ListingMedia {
  constructor(
    public readonly id: number | undefined,
    public readonly url: string,
    public readonly type: MediaType,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
    public readonly thumbnailUrl: string | null,
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly size: number | null,
    public readonly mimeType: string | null,
  ) {}

  static primary(url: string, type: MediaType = 'IMAGE'): ListingMedia {
    return new ListingMedia(undefined, url, type, true, 0, null, null, null, null, null);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id, url: this.url, type: this.type,
      isPrimary: this.isPrimary, sortOrder: this.sortOrder,
    };
  }
}
