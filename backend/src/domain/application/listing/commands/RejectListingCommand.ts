export class RejectListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly adminUserId: string,
  ) {}
}
