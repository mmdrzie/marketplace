export interface NotificationSnapshot {
  id: number;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export class Notification {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly body: string,
    public readonly data: Record<string, unknown>,
    public isRead: boolean,
    public readAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: number;
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Notification {
    return new Notification(
      props.id,
      props.userId,
      props.type,
      props.title,
      props.body,
      props.data ?? {},
      false,
      null,
      new Date(),
    );
  }

  static fromSnapshot(s: NotificationSnapshot): Notification {
    return new Notification(
      s.id,
      s.userId,
      s.type,
      s.title,
      s.body,
      s.data,
      s.isRead,
      s.readAt ? new Date(s.readAt) : null,
      new Date(s.createdAt),
    );
  }

  snapshot(): NotificationSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      body: this.body,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  markRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }
}
