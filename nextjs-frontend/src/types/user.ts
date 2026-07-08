export interface User {
  id: number;
  name: string | null;
  avatar: string | null;
  city: string | null;
  role: 'user' | 'dealer' | 'agency' | 'admin';
  phone?: string | null;
  email?: string | null;
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
