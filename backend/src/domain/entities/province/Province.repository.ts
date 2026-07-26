import { Province, City } from './Province.entity.js';

export interface ProvinceRepository {
  findAll(): Promise<Province[]>;
  findById(id: number): Promise<Province | null>;
  findBySlug(slug: string): Promise<Province | null>;
  findCities(provinceId: number): Promise<City[]>;
  findAllCities(): Promise<Record<number, City[]>>;
  create(data: { name: string; slug: string; sort_order?: number }): Promise<Province>;
  update(id: number, data: Record<string, unknown>): Promise<Province | undefined>;
  delete(id: number): Promise<void>;
  createCity(provinceId: number, name: string): Promise<City>;
  deleteCity(id: number): Promise<void>;
}
