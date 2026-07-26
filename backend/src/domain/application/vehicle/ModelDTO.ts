export class ModelDTO {
  constructor(
    public readonly id: number,
    public readonly brandId: number,
    public readonly name: string,
    public readonly nameEn: string | null,
    public readonly slug: string,
    public readonly segment: string | null,
    public readonly generation: string | null,
    public readonly bodyType: string | null,
    public readonly yearFrom: number | null,
    public readonly yearTo: number | null,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}
}
