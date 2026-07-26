export class CreateBrandCommand {
  constructor(
    public readonly name: string,
    public readonly nameEn?: string | null,
    public readonly slug?: string,
    public readonly logo?: string | null,
    public readonly country?: string | null,
    public readonly foundedYear?: number | null,
    public readonly website?: string | null,
    public readonly description?: string | null,
  ) {}
}
