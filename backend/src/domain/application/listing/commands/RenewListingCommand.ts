export class RenewListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly userId: string,
  ) {}
}
