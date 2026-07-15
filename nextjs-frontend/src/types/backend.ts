export interface BackendUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  city: string | null;
  role: 'user' | 'dealer' | 'agency' | 'admin';
  status: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  dealer_profile?: BackendDealerProfile | null;
}

export interface BackendDealerProfile {
  business_name: string;
  logo: string | null;
  address: string | null;
  description: string | null;
  dealer_code: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  listings_limit: number;
  is_verified: boolean;
}

export interface BackendListing {
  id: string;
  user_id: string;
  category_id: number;
  province_id: number | null;
  city_id: number | null;
  city_name: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'negotiable' | 'auction';
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'sold' | 'archived';
  is_featured: boolean;
  views: number;
  primary_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  province_name: string | null;
  seller_id: string | null;
  seller_name: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendListingDetail extends BackendListing {
  images: BackendListingImage[];
  attributes: BackendAttributeValue[];
  renew_count: number;
  rejection_reason: string | null;
  is_favorited: boolean;
}

export interface BackendListingImage {
  id: string;
  url: string;
  thumbnail_url: string | null;
  medium_url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface BackendAttributeValue {
  id: number;
  attribute_id: number;
  name: string;
  label: string;
  type: string;
  unit: string | null;
  value: string;
}

export interface BackendCategory {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  children?: BackendCategory[];
  sort_order: number;
}

export interface BackendAttribute {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'range';
  options?: string[] | null;
  unit?: string | null;
  is_required?: boolean;
  is_filterable?: boolean;
}

export interface BackendProvince {
  id: number;
  name: string;
  slug: string;
  cities: BackendCity[];
  sort_order: number;
}

export interface BackendCity {
  id: number;
  name: string;
}

export interface BackendConversation {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_slug: string;
  listing_image: string | null;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string | null;
  seller_id: string;
  seller_name: string;
  seller_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: string;
  created_at: string;
  messages?: BackendMessage[];
}

export interface BackendMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface BackendArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string;
  category_label: string;
  author: string;
  tags: string[];
  is_pinned: boolean;
  views: number;
  reading_time: number;
  published_at: string;
  created_at: string;
}
