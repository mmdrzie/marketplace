export class SubmitListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly userId: string,
  ) {}
}
