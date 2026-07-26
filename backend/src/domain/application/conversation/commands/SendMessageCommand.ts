export class SendMessageCommand {
  constructor(
    public readonly conversationId: number,
    public readonly senderId: string,
    public readonly body: string | null,
    public readonly type?: string,
  ) {}
}
