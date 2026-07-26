import { Dealer } from './Dealer.entity.js';

export interface DealerStats {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_views: number;
  avg_rating: number;
  total_reviews: number;
  today_views: number;
  today_contacts: number;
  unread_messages: number;
  recent_activities: Array<{ id: number; description: string; status: string; created_at: string }>;
}

export interface DealerSubscription {
  user_id: string;
  business_name: string;
  logo: string | null;
  address: string | null;
  description: string | null;
  dealer_code: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  listings_limit: number;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DealerRepository {
  findById(id: number): Promise<Dealer | null>;
  findByUserId(userId: string): Promise<Dealer | null>;
  save(dealer: Dealer): Promise<void>;
  getStats(userId: string): Promise<DealerStats>;
  getSubscription(userId: string): Promise<DealerSubscription | null>;
  addReview(data: { dealer_id: string; user_id: string; rating: number; comment?: string }): Promise<Record<string, unknown>>;
}
