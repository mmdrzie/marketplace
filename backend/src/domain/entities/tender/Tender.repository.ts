import { Tender } from './Tender.entity.js';

export interface TenderRepository {
  findById(id: number): Promise<Tender | null>;
  findAll(filters?: { status?: string; userId?: string }): Promise<Tender[]>;
  save(tender: Tender): Promise<void>;
}
