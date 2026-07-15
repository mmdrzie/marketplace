export const queryKeys = {
  listings: {
    all: ['listings'] as const,
    latest: ['listings', 'latest'] as const,
    list: (params?: Record<string, unknown>) => ['listings', 'list', params] as const,
    detail: (slug: string) => ['listings', 'detail', slug] as const,
    my: ['listings', 'my'] as const,
    dealer: (status?: string) => ['listings', 'dealer', status] as const,
    allListings: (page: string | number, params?: string) => ['listings', 'all', params, page] as const,
    related: (categoryId: number | string) => ['listings', 'related', categoryId] as const,
  },
  search: {
    results: (params: Record<string, unknown>) => ['search', params] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
    notifications: ['auth', 'notification-preferences'] as const,
  },
  articles: {
    all: ['articles'] as const,
    list: (params?: Record<string, unknown>) => ['articles', params] as const,
    detail: (slug: string) => ['articles', 'detail', slug] as const,
  },
  categories: {
    all: ['categories'] as const,
    tree: ['categories', 'tree'] as const,
    provinces: ['categories', 'provinces'] as const,
    cities: (provinceId: number | string | null) => ['categories', 'cities', provinceId] as const,
  },
  attributes: {
    byCategory: (categoryId: number | string | null) => ['attributes', categoryId] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: (params?: Record<string, unknown>) => ['favorites', params] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    detail: (id: number | string) => ['conversations', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  dealers: {
    profile: (id: number | string) => ['dealer-profile', id] as const,
    subscription: ['dealer-subscription'] as const,
    stats: ['dealer-stats'] as const,
  },
  imported: {
    all: ['imported'] as const,
    detail: (slug: string) => ['imported', slug] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    analytics: ['dashboard', 'analytics'] as const,
    wallet: ['dashboard', 'wallet'] as const,
  },
  admin: {
    users: (search?: string, role?: string) => ['admin-users', search, role] as const,
    settings: ['admin-settings'] as const,
    reports: ['admin-reports'] as const,
    provinces: ['admin-provinces'] as const,
    cities: (provinceId: number | string | null) => ['admin-cities', provinceId] as const,
    pending: ['admin-pending'] as const,
    categories: ['admin-categories'] as const,
    categoriesTree: ['admin-categories-tree'] as const,
    attributes: (categoryId: number | string | null) => ['admin-attributes', categoryId] as const,
  },
  users: {
    profile: (id: number | string) => ['user-profile', id] as const,
  },
} as const;
