export interface MessageAttachmentSnapshot {
  id: number;
  messageId: number;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  createdAt: string;
}

export class MessageAttachment {
  private constructor(
    public readonly id: number,
    public readonly messageId: number,
    public readonly fileUrl: string,
    public readonly fileType: string,
    public readonly fileSize: number,
    public readonly thumbnailUrl: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: number;
    messageId: number;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl?: string | null;
  }): MessageAttachment {
    return new MessageAttachment(
      props.id,
      props.messageId,
      props.fileUrl,
      props.fileType,
      props.fileSize,
      props.thumbnailUrl ?? null,
      new Date(),
    );
  }

  static fromSnapshot(s: MessageAttachmentSnapshot): MessageAttachment {
    return new MessageAttachment(
      s.id,
      s.messageId,
      s.fileUrl,
      s.fileType,
      s.fileSize,
      s.thumbnailUrl,
      new Date(s.createdAt),
    );
  }

  snapshot(): MessageAttachmentSnapshot {
    return {
      id: this.id,
      messageId: this.messageId,
      fileUrl: this.fileUrl,
      fileType: this.fileType,
      fileSize: this.fileSize,
      thumbnailUrl: this.thumbnailUrl,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
