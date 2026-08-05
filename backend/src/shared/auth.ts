/**
 * Shared auth domain types (backend & frontend contract — AUTH_API.md §2).
 * Keep in sync with nextjs-frontend/src/types/user.ts.
 */

export const AUTH_ROLES = ['user', 'dealer', 'agency', 'store', 'workshop'] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export const BUSINESS_ROLES = ['dealer', 'agency', 'store', 'workshop'] as const;
export type BusinessRole = (typeof BUSINESS_ROLES)[number];

export const WORKSHOP_TYPES = ['mechanic', 'tuner', 'both'] as const;
export type WorkshopType = (typeof WORKSHOP_TYPES)[number];

export type ProfileStatus = 'complete' | 'incomplete' | 'pending' | 'approved' | 'rejected';

export interface BusinessProfileData {
  business_name?: string;
  dealer_code?: string;
  business_address?: string;
  city?: string;
  documents?: string[];
  workshop_name?: string;
  workshop_type?: WorkshopType;
  specialty?: string;
  hours?: string;
  services?: string[];
  description?: string;
  phone?: string;
}

export interface BusinessProfileResult {
  profileStatus: ProfileStatus;
  profile: {
    role: BusinessRole;
    businessName: string;
    status: string;
  };
}
