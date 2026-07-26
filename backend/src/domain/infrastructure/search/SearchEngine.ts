// Search Engine Interface — abstraction over search backends (Postgres FTS, Meili, Elastic)

export interface SearchQuery {
  q: string;
  filters?: Record<string, unknown>;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  took: number;
}

export interface SearchEngine<T> {
  index(id: string, document: T): Promise<void>;
  bulkIndex(documents: Array<{ id: string; document: T }>): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult<T>>;
  remove(id: string): Promise<void>;
}
