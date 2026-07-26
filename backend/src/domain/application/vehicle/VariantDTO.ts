export class VariantDTO {
  constructor(
    public readonly id: number,
    public readonly modelId: number,
    public readonly name: string,
    public readonly nameEn: string | null,
    public readonly slug: string,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}
}
