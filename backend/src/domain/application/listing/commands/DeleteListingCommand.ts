export class DeleteListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly userId: string,
  ) {}
}
