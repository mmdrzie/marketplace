import crypto from 'node:crypto';
import { getDb } from '../../config/database.js';
import { AppError } from '../../errors.js';
import { Slug } from '../entities/value-objects/Slug.js';
import type {
  BusinessProfileData,
  BusinessProfileResult,
  BusinessRole,
  WorkshopType,
} from '../../shared/auth.js';

const REQUIRED_FIELD_MESSAGE = 'فیلدهای اجباری پروفایل کسبوکار تکمیل نشده است';

function uniqueSlug(base: string): string {
  const slug = Slug.generate(base).toString();
  return `${slug}-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
}

/**
 * Creates/refreshes the business profile for a user based on their role
 * (ADR-013 §7, auth-redesign-plan v7 §6).
 *
 * - dealer / agency → dealer_profiles (status='pending', dealer_code optional)
 * - store → store_profiles (status='pending')
 * - workshop → workshop_profiles (status='pending')
 *
 * Missing role-required fields throw 422; the caller may catch and treat the
 * profile as 'incomplete' (session stays valid).
 */
export class BusinessProfileService {
  async create(userId: string, role: BusinessRole, data: BusinessProfileData): Promise<BusinessProfileResult> {
    if (role === 'dealer' || role === 'agency') {
      return this.upsertDealer(userId, role, data);
    }
    if (role === 'store') {
      return this.upsertStore(userId, data);
    }
    return this.upsertWorkshop(userId, data);
  }

  async upsertDealer(
    userId: string,
    role: 'dealer' | 'agency',
    data: { business_name?: string; dealer_code?: string; business_address?: string; description?: string },
  ): Promise<BusinessProfileResult> {
    if (!data.business_name?.trim()) {
      throw AppError.badRequest(REQUIRED_FIELD_MESSAGE);
    }

    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_profiles (user_id, business_name, logo, address, description, dealer_code, status, is_verified)
       VALUES ($1, $2, NULL, $3, $4, $5, 'pending', false)
       ON CONFLICT (user_id) DO UPDATE SET
         business_name = EXCLUDED.business_name,
         address = COALESCE(EXCLUDED.address, dealer_profiles.address),
         description = COALESCE(EXCLUDED.description, dealer_profiles.description),
         dealer_code = COALESCE(EXCLUDED.dealer_code, dealer_profiles.dealer_code),
         status = CASE WHEN dealer_profiles.status IN ('rejected', 'suspended')
                       THEN 'pending' ELSE dealer_profiles.status END,
         updated_at = NOW()
       RETURNING business_name, status`,
      [
        userId,
        data.business_name.trim(),
        data.business_address?.trim() || null,
        data.description?.trim() || null,
        data.dealer_code?.trim() || null,
      ],
    );
    const row = rows[0] as { business_name: string; status: string };
    return {
      profileStatus: row.status === 'approved' ? 'approved' : 'pending',
      profile: { role, businessName: row.business_name, status: row.status },
    };
  }

  async upsertStore(userId: string, data: BusinessProfileData): Promise<BusinessProfileResult> {
    const storeName = data.business_name?.trim() ?? data.workshop_name?.trim();
    if (!storeName) {
      throw AppError.badRequest(REQUIRED_FIELD_MESSAGE);
    }

    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO store_profiles (user_id, store_name, store_slug, description, address, phone, documents)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         store_name = EXCLUDED.store_name,
         description = COALESCE(EXCLUDED.description, store_profiles.description),
         address = COALESCE(EXCLUDED.address, store_profiles.address),
         phone = COALESCE(EXCLUDED.phone, store_profiles.phone),
         documents = COALESCE(EXCLUDED.documents, store_profiles.documents),
         status = CASE WHEN store_profiles.status IN ('rejected', 'suspended')
                       THEN 'pending' ELSE store_profiles.status END,
         updated_at = NOW()
       RETURNING store_name, status`,
      [
        userId,
        storeName,
        uniqueSlug(storeName),
        data.description?.trim() || '',
        data.business_address?.trim() || '',
        data.phone?.trim() || '',
        data.documents || [],
      ],
    );
    const row = rows[0] as { store_name: string; status: string };
    return {
      profileStatus: row.status === 'approved' ? 'approved' : 'pending',
      profile: { role: 'store', businessName: row.store_name, status: row.status },
    };
  }

  async upsertWorkshop(userId: string, data: BusinessProfileData): Promise<BusinessProfileResult> {
    const workshopName = data.workshop_name?.trim() ?? data.business_name?.trim();
    const workshopType: WorkshopType = data.workshop_type ?? 'mechanic';
    if (!workshopName) {
      throw AppError.badRequest(REQUIRED_FIELD_MESSAGE);
    }

    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO workshop_profiles (
         user_id, workshop_name, workshop_slug, type, specialty, city, address,
         phone, hours, services, description, documents
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         workshop_name = EXCLUDED.workshop_name,
         type = EXCLUDED.type,
         specialty = COALESCE(EXCLUDED.specialty, workshop_profiles.specialty),
         city = COALESCE(EXCLUDED.city, workshop_profiles.city),
         address = COALESCE(EXCLUDED.address, workshop_profiles.address),
         phone = COALESCE(EXCLUDED.phone, workshop_profiles.phone),
         hours = COALESCE(EXCLUDED.hours, workshop_profiles.hours),
         services = COALESCE(EXCLUDED.services, workshop_profiles.services),
         description = COALESCE(EXCLUDED.description, workshop_profiles.description),
         documents = COALESCE(EXCLUDED.documents, workshop_profiles.documents),
         status = CASE WHEN workshop_profiles.status IN ('rejected', 'suspended')
                       THEN 'pending' ELSE workshop_profiles.status END,
         admin_note = CASE WHEN workshop_profiles.status IN ('rejected', 'suspended')
                           THEN '' ELSE workshop_profiles.admin_note END,
         updated_at = NOW()
       RETURNING workshop_name, status`,
      [
        userId,
        workshopName,
        uniqueSlug(workshopName),
        workshopType,
        data.specialty?.trim() || '',
        data.city?.trim() || '',
        data.business_address?.trim() || '',
        data.phone?.trim() || '',
        data.hours?.trim() || '',
        data.services || [],
        data.description?.trim() || '',
        data.documents || [],
      ],
    );
    const row = rows[0] as { workshop_name: string; status: string };
    return {
      profileStatus: row.status === 'approved' ? 'approved' : 'pending',
      profile: { role: 'workshop', businessName: row.workshop_name, status: row.status },
    };
  }
}

export const businessProfileService = new BusinessProfileService();
