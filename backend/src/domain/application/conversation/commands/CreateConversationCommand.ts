export class CreateConversationCommand {
  constructor(
    public readonly listingId: number,
    public readonly buyerId: string,
    public readonly sellerId: string,
  ) {}
}
