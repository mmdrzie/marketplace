export class CreateVariantCommand {
  constructor(
    public readonly modelId: number,
    public readonly name: string,
    public readonly nameEn?: string | null,
    public readonly slug?: string,
  ) {}
}
