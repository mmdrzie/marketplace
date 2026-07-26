export class MessageDTO {
  constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly senderId: string,
    public readonly body: string | null,
    public readonly type: string,
    public readonly deliveryStatus: string,
    public readonly createdAt: string,
    public readonly readAt: string | null,
  ) {}
}
