export class ConversationDTO {
  constructor(
    public readonly id: number,
    public readonly listingId: number,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly status: string,
    public readonly lastMessageId: number | null,
    public readonly lastMessageAt: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}
}
