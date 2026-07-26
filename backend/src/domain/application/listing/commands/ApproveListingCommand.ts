export class ApproveListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly adminUserId: string,
  ) {}
}
