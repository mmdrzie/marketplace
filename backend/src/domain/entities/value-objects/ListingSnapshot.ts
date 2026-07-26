export class ListingSnapshot {
  private constructor(
    public readonly id: number,
    public readonly publicId: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly cover: string | null,
    public readonly brand: string | null,
    public readonly model: string | null,
    public readonly variant: string | null,
    public readonly city: string | null,
    public readonly status: string,
    public readonly dealerName: string | null,
    public readonly deletedAt: Date | null,
  ) {}

  static create(props: {
    id: number;
    publicId: string;
    slug: string;
    title: string;
    price: number;
    currency?: string;
    cover: string | null;
    brand: string | null;
    model: string | null;
    variant: string | null;
    city: string | null;
    status: string;
    dealerName: string | null;
  }): ListingSnapshot {
    return new ListingSnapshot(
      props.id,
      props.publicId,
      props.slug,
      props.title,
      props.price,
      props.currency ?? 'IRR',
      props.cover,
      props.brand,
      props.model,
      props.variant,
      props.city,
      props.status,
      props.dealerName,
      null,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      publicId: this.publicId,
      slug: this.slug,
      title: this.title,
      price: this.price,
      currency: this.currency,
      cover: this.cover,
      brand: this.brand,
      model: this.model,
      variant: this.variant,
      city: this.city,
      status: this.status,
      dealerName: this.dealerName,
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  static fromJSON(data: Record<string, unknown>): ListingSnapshot {
    return new ListingSnapshot(
      data.id as number,
      data.publicId as string,
      data.slug as string,
      data.title as string,
      data.price as number,
      (data.currency as string) ?? 'IRR',
      (data.cover as string) ?? null,
      (data.brand as string) ?? null,
      (data.model as string) ?? null,
      (data.variant as string) ?? null,
      (data.city as string) ?? null,
      data.status as string,
      (data.dealerName as string) ?? null,
      data.deletedAt ? new Date(data.deletedAt as string) : null,
    );
  }
}
