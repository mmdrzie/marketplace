import type { Listing, ListingDetail, User, DealerProfile, Conversation, Message, Article, Category, Attribute, Province, City, Notification } from '@/types';
import type { BackendListing, BackendListingDetail, BackendUser, BackendDealerProfile, BackendConversation, BackendMessage, BackendArticle, BackendCategory, BackendAttribute, BackendProvince, BackendCity, BackendNotification } from '@/types/backend';

export function transformUser(b: BackendUser): User {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    avatar: b.avatar,
    city: b.city,
    role: b.role,
    status: b.status,
    phoneVerified: b.phone_verified_at !== null,
    emailVerified: b.email_verified_at !== null,
    profile: null,
    dealer_profile: b.dealer_profile ? transformDealerProfile(b.dealer_profile) : null,
    created_at: b.created_at,
  };
}

function transformDealerProfile(b: BackendDealerProfile): DealerProfile {  return {
    business_name: b.business_name,
    logo: b.logo,
    address: b.address,
    description: b.description,
    dealer_code: b.dealer_code,
    subscription_plan: b.subscription_plan,
    subscription_expires_at: b.subscription_expires_at,
    listings_limit: b.listings_limit,
    is_verified: b.is_verified,
  };
}

function toUser(id: string, name: string | null, avatar: string | null): User {
  return {
    id,
    name,
    email: null,
    phone: null,
    avatar,
    city: null,
    role: 'user',
    status: null,
    phoneVerified: false,
    emailVerified: false,
    profile: null,
    dealer_profile: null,
    created_at: '',
  };
}

function toListingPreview(title: string | null, slug: string | null, primaryImage: string | null): Listing | null {
  if (!title || !slug) return null;
  return {
    id: '',
    title,
    slug,
    price: 0,
    price_type: 'fixed',
    status: 'published',
    is_featured: false,
    views: 0,
    primary_image: primaryImage,
    category_name: null,
    category_slug: null,
    category_id: null,
    province_name: null,
    province_id: null,
    city_id: null,
    city_name: null,
    seller_id: null,
    seller_name: null,
  };
}

function toMessage(id: string, conversationId: string, senderId: string, body: string): Message {
  return {
    id: Number(id),
    conversation_id: conversationId,
    sender: toUser(senderId, null, null),
    sender_id: senderId,
    body,
    is_read: false,
    read_at: null,
    created_at: '',
  };
}

export function transformListing(b: BackendListing): Listing {
  return {
    id: String(b.id),
    title: b.title,
    slug: b.slug,
    price: b.price,
    price_type: b.price_type,
    status: b.status,
    is_featured: b.is_featured,
    views: b.views,
    primary_image: b.primary_image,
    category_name: b.category_name,
    category_slug: b.category_slug,
    category_id: b.category_id,
    province_name: b.province_name,
    province_id: b.province_id,
    city_id: b.city_id,
    city_name: b.city_name ?? null,
    seller_id: b.seller_id,
    seller_name: b.seller_name,
    published_at: b.published_at,
    created_at: b.created_at,
  };
}

export function transformListingDetail(b: BackendListingDetail): ListingDetail {
  return {
    ...transformListing(b),
    description: b.description || '',
    images: b.images.map((img) => ({
      id: Number(img.id),
      url: img.url,
      thumbnail_url: img.thumbnail_url,
      medium_url: img.medium_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order,
    })),
    attributes: b.attributes,
    renew_count: b.renew_count,
    rejection_reason: b.rejection_reason,
    is_favorited: b.is_favorited,
    expires_at: b.expires_at,
  };
}

export function transformCategory(b: BackendCategory): Category {
  return {
    id: b.id,
    name: b.name,
    name_en: b.name_en,
    slug: b.slug,
    icon: b.icon,
    parent_id: b.parent_id,
    children: b.children?.map(transformCategory),
    sort_order: b.sort_order,
  };
}

export function transformAttribute(b: BackendAttribute): Attribute {
  return {
    id: b.id,
    name: b.name,
    label: b.label,
    type: b.type,
    options: b.options,
    unit: b.unit,
    is_required: b.is_required,
    is_filterable: b.is_filterable,
  };
}

export function transformProvince(b: BackendProvince): Province {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    cities: b.cities.map(transformCity),
    sort_order: b.sort_order,
  };
}

function transformCity(b: BackendCity): City {
  return { id: b.id, name: b.name };
}

export function transformConversation(b: BackendConversation): Conversation {
  return {
    id: Number(b.id),
    listing: toListingPreview(b.listing_title, b.listing_slug, b.listing_image),
    buyer: toUser(b.buyer_id, b.buyer_name, b.buyer_avatar),
    seller: toUser(b.seller_id, b.seller_name, b.seller_avatar),
    buyer_id: b.buyer_id,
    seller_id: b.seller_id,
    last_message: b.last_message ? toMessage('0', b.id, '', b.last_message) : null,
    last_message_at: b.last_message_at,
    created_at: b.created_at,
    messages: b.messages?.map(transformMessage),
  };
}

function transformMessage(b: BackendMessage): Message {
  return {
    id: Number(b.id),
    conversation_id: b.conversation_id,
    sender: toUser(b.sender_id, null, null),
    sender_id: b.sender_id,
    body: b.body,
    is_read: b.is_read,
    read_at: b.read_at,
    created_at: b.created_at,
  };
}

const ARTICLE_CATEGORIES = ['market', 'guide', 'regulation', 'announcement'] as const;

function toArticleCategory(value: string): Article['category'] {
  return (ARTICLE_CATEGORIES as readonly string[]).includes(value)
    ? (value as Article['category'])
    : 'announcement';
}

export function transformArticle(b: BackendArticle): Article {
  return {
    id: Number(b.id),
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    body: b.body,
    cover_image: b.cover_image,
    category: toArticleCategory(b.category),
    category_label: b.category_label,
    author: b.author,
    tags: b.tags,
    is_pinned: b.is_pinned,
    views: b.views,
    reading_time: b.reading_time,
    published_at: b.published_at,
    created_at: b.created_at,
  };
}

export function transformNotification(b: BackendNotification): Notification {
  return {
    id: b.id,
    type: b.type,
    title: b.title,
    body: b.body,
    data: b.data,
    is_read: b.is_read,
    created_at: b.created_at,
  };
}
