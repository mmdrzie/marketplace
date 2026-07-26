export class MarkReadCommand {
  constructor(
    public readonly conversationId: number,
    public readonly userId: string,
  ) {}
}
