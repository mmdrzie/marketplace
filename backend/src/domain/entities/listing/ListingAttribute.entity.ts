export class ListingAttribute {
  constructor(
    public readonly attributeId: number,
    public readonly value: string,
  ) {}

  toJSON(): { attributeId: number; value: string } {
    return { attributeId: this.attributeId, value: this.value };
  }
}
