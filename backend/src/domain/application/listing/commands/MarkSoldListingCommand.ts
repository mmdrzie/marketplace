export class MarkSoldListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly userId: string,
  ) {}
}
