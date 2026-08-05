export type AuthRole = 'user' | 'dealer' | 'agency' | 'store' | 'workshop' | 'admin';
export type BusinessRole = 'dealer' | 'agency' | 'store' | 'workshop';
export type ProfileStatus = 'complete' | 'incomplete' | 'pending' | 'approved' | 'rejected';
export type WorkshopType = 'mechanic' | 'tuner' | 'both';

export interface User {
  id: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  avatar: string | null;
  city: string | null;
  role: AuthRole;
  profileStatus?: ProfileStatus | null;
  status?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  profile?: Profile | null;
  dealer_profile?: DealerProfile | null;
  created_at: string;
}

export interface Profile {
  avatar: string | null;
  bio: string | null;
  city_id: number | null;
  city: string | null;
  is_verified: boolean;
}

export interface DealerProfile {
  business_name: string;
  logo: string | null;
  address: string | null;
  description: string | null;
  dealer_code: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  listings_limit: number | null;
  is_verified: boolean;
}

/** Payload for POST /auth/business-profile (field sets vary by role). */
export interface BusinessProfileInput {
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
  profile: Record<string, unknown>;
}
