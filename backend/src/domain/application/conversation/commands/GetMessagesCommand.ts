export class GetMessagesCommand {
  constructor(
    public readonly conversationId: number,
    public readonly userId: string,
    public readonly cursor?: number,
    public readonly limit?: number,
  ) {}
}
