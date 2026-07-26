import { getDb } from '../config/database.js';
import { ProvinceRepositoryImpl } from '../domain/infrastructure/province/ProvinceRepository.impl.js';

export interface ProvinceRow {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface CityRow {
  id: number;
  province_id: number;
  name: string;
  created_at: string;
}

export type CreateProvinceData = {
  name: string;
  slug: string;
  sort_order?: number;
};

export type UpdateProvinceData = Partial<CreateProvinceData>;

export class ProvinceRepository {
  private _domainImpl: ProvinceRepositoryImpl;

  constructor(domainImpl?: ProvinceRepositoryImpl) {
    this._domainImpl = domainImpl ?? new ProvinceRepositoryImpl();
  }

  async findAll(): Promise<ProvinceRow[]> {
    const results = await this._domainImpl.findAll();
    return results.map(r => { const s = r.snapshot(); return { id: s.id, name: s.name, slug: s.slug, sort_order: s.sortOrder, created_at: s.createdAt }; });
  }

  async findById(id: number): Promise<ProvinceRow | undefined> {
    const result = await this._domainImpl.findById(id);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, slug: s.slug, sort_order: s.sortOrder, created_at: s.createdAt };
  }

  async findBySlug(slug: string): Promise<ProvinceRow | undefined> {
    const result = await this._domainImpl.findBySlug(slug);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, slug: s.slug, sort_order: s.sortOrder, created_at: s.createdAt };
  }

  async findCities(provinceId: number): Promise<CityRow[]> {
    const results = await this._domainImpl.findCities(provinceId);
    return results.map(c => { const s = c.snapshot(); return { id: s.id, province_id: s.provinceId, name: s.name, created_at: s.createdAt }; });
  }

  async findAllCities(): Promise<Record<number, CityRow[]>> {
    const results = await this._domainImpl.findAllCities();
    const grouped: Record<number, CityRow[]> = {};
    for (const [pid, cities] of Object.entries(results)) {
      grouped[Number(pid)] = cities.map(c => { const s = c.snapshot(); return { id: s.id, province_id: s.provinceId, name: s.name, created_at: s.createdAt }; });
    }
    return grouped;
  }

  async create(data: CreateProvinceData): Promise<ProvinceRow> {
    const result = await this._domainImpl.create(data);
    const s = result.snapshot();
    return { id: s.id, name: s.name, slug: s.slug, sort_order: s.sortOrder, created_at: s.createdAt };
  }

  async update(id: number, data: UpdateProvinceData): Promise<ProvinceRow | undefined> {
    const result = await this._domainImpl.update(id, data as Record<string, unknown>);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, slug: s.slug, sort_order: s.sortOrder, created_at: s.createdAt };
  }

  async delete(id: number): Promise<void> {
    await this._domainImpl.delete(id);
  }

  async createCity(provinceId: number, name: string): Promise<CityRow> {
    const result = await this._domainImpl.createCity(provinceId, name);
    const s = result.snapshot();
    return { id: s.id, province_id: s.provinceId, name: s.name, created_at: s.createdAt };
  }

  async deleteCity(id: number): Promise<void> {
    await this._domainImpl.deleteCity(id);
  }
}

export const provinceRepo = new ProvinceRepository();
