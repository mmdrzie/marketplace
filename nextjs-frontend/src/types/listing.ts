import { User } from './user';

export interface Listing {
  id: number;
  title: string;
  slug: string;
  price: number | null;
  price_type: 'fixed' | 'negotiable' | 'free';
  status: string;
  is_featured: boolean;
  views: number;
  primary_image: string | null;
  category?: { id: number; name: string; slug: string } | null;
  province?: string | null;
  city?: string | null;
  user?: User | null;
  published_at?: string | null;
  created_at?: string;
}

export interface ListingDetail extends Listing {
  description: string;
  renew_count: number;
  rejection_reason: string | null;
  images: ListingImage[];
  attributes: AttributeValue[];
  is_favorited?: boolean;
  expires_at?: string | null;
}

export interface ListingImage {
  id: number;
  url: string;
  thumbnail_url: string | null;
  medium_url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface AttributeValue {
  id: number;
  attribute_id: number;
  name: string;
  label: string;
  type: string;
  unit: string | null;
  value: string;
}

export interface Category {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  children?: Category[];
  sort_order: number;
}

export interface Attribute {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'range';
  options?: string[] | null;
  unit?: string | null;
  is_required?: boolean;
  is_filterable?: boolean;
}

export interface Conversation {
  id: number;
  listing?: Listing | null;
  buyer: User;
  seller: User;
  buyer_id?: number;
  seller_id?: number;
  messages?: Message[];
  last_message?: Message | null;
  last_message_at?: string | null;
  created_at: string;
}

export interface MessageAttachment {
  id: number;
  type: 'image' | 'video' | 'voice' | 'file';
  url: string;
  thumbnail_url?: string | null;
  name?: string;
  size?: number;
  duration?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: User;
  sender_id: number;
  body: string;
  attachments?: MessageAttachment[];
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: 'market' | 'guide' | 'regulation' | 'announcement';
  category_label: string;
  author: string;
  tags: string[];
  is_pinned: boolean;
  views: number;
  reading_time: number;
  published_at: string;
  created_at: string;
}
