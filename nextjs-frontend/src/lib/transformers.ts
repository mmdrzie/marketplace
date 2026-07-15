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

function transformDealerProfile(b: BackendDealerProfile): DealerProfile {
  return {
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

export function transformListing(b: BackendListing): Listing {
  return {
    id: String(b.id),
    title: b.title,
    slug: b.slug,
    price: b.price,
    price_type: b.price_type as Listing['price_type'],
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
      id: img.id as unknown as number,
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
    id: b.id as unknown as number,
    listing: b.listing_title ? { title: b.listing_title, slug: b.listing_slug, primary_image: b.listing_image } as unknown as Listing : null,
    buyer: { id: b.buyer_id, name: b.buyer_name, avatar: b.buyer_avatar } as unknown as User,
    seller: { id: b.seller_id, name: b.seller_name, avatar: b.seller_avatar } as unknown as User,
    buyer_id: b.buyer_id as unknown as number,
    seller_id: b.seller_id as unknown as number,
    last_message: b.last_message ? { body: b.last_message } as unknown as Message : null,
    last_message_at: b.last_message_at,
    created_at: b.created_at,
    messages: b.messages?.map(transformMessage),
  };
}

function transformMessage(b: BackendMessage): Message {
  return {
    id: b.id as unknown as number,
    conversation_id: b.conversation_id as unknown as number,
    sender: { id: b.sender_id, name: null } as unknown as User,
    sender_id: b.sender_id as unknown as number,
    body: b.body,
    is_read: b.is_read,
    read_at: b.read_at,
    created_at: b.created_at,
  };
}

export function transformArticle(b: BackendArticle): Article {
  return {
    id: b.id as unknown as number,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    body: b.body,
    cover_image: b.cover_image,
    category: b.category as Article['category'],
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
