export interface ProvinceSnapshot {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
}

export interface CitySnapshot {
  id: number;
  provinceId: number;
  name: string;
  createdAt: string;
}

export class Province {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
  ) {}

  static fromSnapshot(s: ProvinceSnapshot): Province {
    return new Province(s.id, s.name, s.slug, s.sortOrder, new Date(s.createdAt));
  }

  snapshot(): ProvinceSnapshot {
    return { id: this.id, name: this.name, slug: this.slug, sortOrder: this.sortOrder, createdAt: this.createdAt.toISOString() };
  }
}

export class City {
  private constructor(
    public readonly id: number,
    public readonly provinceId: number,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static fromSnapshot(s: CitySnapshot): City {
    return new City(s.id, s.provinceId, s.name, new Date(s.createdAt));
  }

  snapshot(): CitySnapshot {
    return { id: this.id, provinceId: this.provinceId, name: this.name, createdAt: this.createdAt.toISOString() };
  }
}
