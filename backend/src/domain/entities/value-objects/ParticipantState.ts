export class ParticipantState {
  constructor(
    public isArchived: boolean = false,
    public isMuted: boolean = false,
    public isBlocked: boolean = false,
    public isDeleted: boolean = false,
    public isPinned: boolean = false,
    public lastReadAt: Date | null = null,
  ) {}

  archive(): void {
    this.isArchived = true;
  }

  unarchive(): void {
    this.isArchived = false;
  }

  mute(): void {
    this.isMuted = true;
  }

  unmute(): void {
    this.isMuted = false;
  }

  block(): void {
    this.isBlocked = true;
  }

  unblock(): void {
    this.isBlocked = false;
  }

  markRead(at?: Date): void {
    this.lastReadAt = at ?? new Date();
  }

  pin(): void {
    this.isPinned = true;
  }

  unpin(): void {
    this.isPinned = false;
  }

  toJSON(): Record<string, unknown> {
    return {
      isArchived: this.isArchived,
      isMuted: this.isMuted,
      isBlocked: this.isBlocked,
      isDeleted: this.isDeleted,
      isPinned: this.isPinned,
      lastReadAt: this.lastReadAt?.toISOString() ?? null,
    };
  }

  static fromJSON(data: Record<string, unknown>): ParticipantState {
    return new ParticipantState(
      (data.isArchived as boolean) ?? false,
      (data.isMuted as boolean) ?? false,
      (data.isBlocked as boolean) ?? false,
      (data.isDeleted as boolean) ?? false,
      (data.isPinned as boolean) ?? false,
      data.lastReadAt ? new Date(data.lastReadAt as string) : null,
    );
  }
}
