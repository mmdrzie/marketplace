export enum ListingStatus {
  Draft = 'draft',
  Pending = 'pending',
  Published = 'published',
  Rejected = 'rejected',
  Sold = 'sold',
  Archived = 'archived',
}

export function parseListingStatus(value: string): ListingStatus {
  switch (value) {
    case 'draft': return ListingStatus.Draft;
    case 'pending': return ListingStatus.Pending;
    case 'published': return ListingStatus.Published;
    case 'rejected': return ListingStatus.Rejected;
    case 'sold': return ListingStatus.Sold;
    case 'archived': return ListingStatus.Archived;
    default: throw new Error(`Invalid ListingStatus: ${value}`);
  }
}

const VALID_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  [ListingStatus.Draft]: [ListingStatus.Pending, ListingStatus.Archived],
  [ListingStatus.Pending]: [ListingStatus.Published, ListingStatus.Rejected],
  [ListingStatus.Published]: [ListingStatus.Sold, ListingStatus.Archived],
  [ListingStatus.Rejected]: [ListingStatus.Draft],
  [ListingStatus.Sold]: [ListingStatus.Archived],
  [ListingStatus.Archived]: [ListingStatus.Draft],
};

export function canTransition(from: ListingStatus, to: ListingStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
