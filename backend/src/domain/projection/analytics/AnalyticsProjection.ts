// AnalyticsProjection — Read model for dashboards/stats
export interface AnalyticsProjectionRow {
  date: string;
  totalListings: number;
  activeListings: number;
  newListingsToday: number;
  totalUsers: number;
  totalDealers: number;
  totalViews: number;
  totalConversations: number;
}

export interface AnalyticsProjectionRepository {
  getDaily(date?: string): Promise<AnalyticsProjectionRow | null>;
  getRange(from: string, to: string): Promise<AnalyticsProjectionRow[]>;
  refresh(): Promise<void>;
}
