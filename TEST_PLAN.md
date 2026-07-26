# Test Plan: Marketplace Project

> **Date:** 2026-07-15
> **Scope:** Frontend (Next.js App Router) + Backend (Hono.js) + E2E (Playwright)
> **Framework:** Vitest (unit/integration), React Testing Library (component), Playwright (E2E)

---

## 1. Current Coverage Summary

### 1.1 Test File Inventory (18 total)

| Category | Files | Test Count | Status |
|----------|-------|-----------|--------|
| Backend | 9 | ~40 | ? Existing |
| Frontend Hooks | 2 | 6 | ?? Under-tested |
| Frontend Stores | 2 | 11 | ? Doing well |
| Frontend Components | 3 | 10 | ?? Under-tested |
| Frontend Utils | 1 | 8 | ? Good |
| E2E | 1 | 3 | ?? Poor |

### 1.2 Test Coverage Gaps

**No tests at all for:**
- **Hooks (20 missing):** useChat, useFavorites, useFleet, useCategories, useArticles, useAttributes, useSearch, useTenders, useEscrow, useParts, useNotifications, useServiceLogs, usePhoneVerification, useAutoSave, useDebounce, useProvinces, usePushNotifications, useRealtimeNotifications, useIsTouchDevice, usePrefersReducedMotion
- **Stores (8 missing):** authStore, escrowStore, fleetStore, partStore, recentlyViewedStore, serviceLogStore, tenderStore
- **Components (85+ missing):** All listing components, all chat components, all compare components, all fleet components, all search components, all layout components, all tender components, all imported components, all payment components, all news components, upload components, 70% of common components
- **Integration tests:** Zero page-level integration tests
- **E2E:** Only 1 spec file with 3 tests

---

## 2. Testing Strategy

### 2.1 Principles
1. **Test behavior, not implementation** -- test what the user sees and the hook returns, not internal state
2. **Mock at the API boundary** -- mock @/lib/api (the axios wrapper), never mock axios itself
3. **Use real stores** for store tests, mocked stores for component/hook tests
4. **One test file per source file** -- colocated with the source
5. **Coverage targets:** 80% line coverage for utils/stores, 70% for hooks, 60% for components

### 2.2 Testing Pyramid

> E2E (5-10 critical journeys)
> Integration (20-30 page-level tests)
> Unit/Component (200+ hooks, stores, utils, components)

### 2.3 Mocking Strategy

`	ypescript
// Always mock at the API layer
vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

// Mock auth store for hooks
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) => selector({ token: 'test-token', user: mockUser }),
}));

// Use createTestQueryClient for React Query tests
import { createTestQueryClient } from '@/test/test-utils';
`

### 2.4 Test Data Factories (HIGH priority -- create before writing tests)

Create centralized factories at src/test/factories/ to avoid duplication across test files.

**Example:**
`	ypescript
// src/test/factories/listing.ts
export function createMockListing(overrides?: Partial<Listing>): Listing {
  return {
    id: '1', title: 'Test Listing', slug: 'test-listing',
    price: 100000000, price_type: 'fixed', status: 'active',
    is_featured: false, views: 42, primary_image: null,
    category_name: '?????', category_slug: 'car', category_id: 1,
    province_name: '?????', province_id: 1, city_id: 1, city_name: '?????',
    seller_id: '1', seller_name: '????? ???',
    created_at: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}
`

---

## 3. Phase 1: Hook Tests (Priority: HIGH)

### 3.1 useAuth (existing: 6 tests -- expand to 12+)

| Test Case | Type | Priority |
|-----------|------|----------|
| loginWithEmail calls correct endpoint | ? Exists | - |
| loginWithEmail stores token and user | ? Exists | - |
| loginWithEmail handles network error | Missing | HIGH |
| registerWithEmail calls correct endpoint | ? Exists | - |
| registerWithEmail handles duplicate email | ? Exists | - |
| registerWithEmail handles weak password | Missing | HIGH |
| logout calls store logout and API | ? Exists | - |
| logout handles API error gracefully | Missing | MEDIUM |
| forgotPassword calls correct endpoint | ? Exists | - |
| resetPassword calls correct endpoint | ? Exists | - |
| resetPassword handles invalid token | Missing | HIGH |
| loginWithGoogle calls correct endpoint | Missing | HIGH |
| Calls setAuthCookie on login/register | Missing | MEDIUM |

### 3.2 useListings (existing: 1 test -- expand to 15+)

| Test Case | Priority |
|-----------|----------|
| useListings fetches with page param | ? Exists |
| useListings passes all filter params | HIGH |
| useListings handles error response | HIGH |
| useListings returns empty array | MEDIUM |
| useListings handles pagination meta | MEDIUM |
| useListingDetail fetches by slug | HIGH |
| useListingDetail handles 404 | HIGH |
| useCreateListing posts to correct endpoint | HIGH |
| useCreateListing handles phone gate error | HIGH |
| useCreateListing shows success toast | MEDIUM |
| useUpdateListing puts to correct endpoint | HIGH |
| useUpdateListing handles forbidden error | HIGH |
| useDeleteListing deletes and invalidates cache | HIGH |
| useDeleteListing handles not-owner error | HIGH |
| useToggleFavorite toggles correctly | HIGH |
| useInfiniteListings fetches next page | HIGH |

### 3.3 useChat (10+ tests)

| Test Case | Priority |
|-----------|----------|
| useConversations fetches user conversations | HIGH |
| useConversations returns sorted by last_message_at | MEDIUM |
| useConversations handles empty list | MEDIUM |
| useConversationDetail fetches by ID | HIGH |
| useConversationDetail non-participant returns FORBIDDEN | HIGH |
| useConversationDetail handles not found | HIGH |
| useStartConversation posts with listing_id and message | HIGH |
| useStartConversation handles phone gate error | HIGH |
| useStartConversation returns existing conversation on duplicate | MEDIUM |
| useSendMessage posts to conversation | HIGH |
| useSendMessage optimistically updates cache | MEDIUM |
| useMarkRead calls correct endpoint | MEDIUM |

### 3.4 useFavorites (6+ tests)

| Test Case | Priority |
|-----------|----------|
| useFavorites fetches authenticated user favorites | HIGH |
| useFavorites returns empty array when none | MEDIUM |
| useFavoriteToggle toggles favorite status | HIGH |
| useFavoriteToggle optimistic update works | MEDIUM |
| useFavoriteToggle rollback on error | HIGH |
| useFavoriteToggle handles unauthenticated error | HIGH |

### 3.5 useFleet (8+ tests)

| Test Case | Priority |
|-----------|----------|
| useFleetVehicles fetches dealer fleet | HIGH |
| useFleetVehicles returns empty for non-dealer | MEDIUM |
| useFleetVehicleDetail fetches by ID | HIGH |
| useFleetVehicleDetail handles 404 | HIGH |
| useCreateFleetVehicle posts correct data | HIGH |
| useUpdateFleetVehicle puts correct data | HIGH |
| useDeleteFleetVehicle deletes by ID | HIGH |
| useDeleteFleetVehicle shows success toast | MEDIUM |

### 3.6 useCategories (5+ tests)

| Test Case | Priority |
|-----------|----------|
| useCategories fetches category tree | HIGH |
| useCategories returns nested children | MEDIUM |
| useCategories handles network error | MEDIUM |
| useCategoryAttributes fetches by slug | HIGH |
| useCategoryAttributes handles non-existent slug | HIGH |

### 3.7 useSearch (5+ tests)

| Test Case | Priority |
|-----------|----------|
| useSearch calls correct endpoint with query | HIGH |
| useSearch debounces before calling | HIGH |
| useSearch passes filter params | MEDIUM |
| useSearch returns empty results | MEDIUM |
| useSearch handles server error | MEDIUM |

### 3.8 useArticles (5+ tests)

| Test Case | Priority |
|-----------|----------|
| useArticles fetches article list | HIGH |
| useArticles returns pinned articles first | MEDIUM |
| useArticleDetail fetches by slug | HIGH |
| useArticleDetail handles 404 | HIGH |
| useArticles handles empty list | MEDIUM |

### 3.9 useNotifications (6+ tests)

| Test Case | Priority |
|-----------|----------|
| useNotifications fetches user notifications | HIGH |
| useNotifications returns empty array | MEDIUM |
| useMarkNotificationRead marks single | HIGH |
| useMarkAllNotificationsRead marks all | HIGH |
| useMarkNotificationRead optimistic update | MEDIUM |
| useMuteNotification calls correct endpoint | MEDIUM |

### 3.10 useTenders (6+ tests)

| Test Case | Priority |
|-----------|----------|
| useTenders fetches tender list | HIGH |
| useTenders handles empty list | MEDIUM |
| useTenderDetail fetches by slug | HIGH |
| useTenderDetail handles 404 | HIGH |
| useCreateTender posts correct data | HIGH |
| useSubmitBid posts bid to tender | HIGH |
| useSubmitBid handles validation error | MEDIUM |

### 3.11 useEscrow (6+ tests)

| Test Case | Priority |
|-----------|----------|
| useEscrowTransactions fetches user transactions | HIGH |
| useEscrowTransactions handles empty list | MEDIUM |
| useEscrowTransactionDetail fetches by ID | HIGH |
| useEscrowTransactionDetail handles 404 | HIGH |
| useCreateEscrow creates new escrow | HIGH |
| useUpdateEscrow updates escrow status | HIGH |

### 3.12 useParts (4+ tests)

| Test Case | Priority |
|-----------|----------|
| useParts fetches compatible parts | HIGH |
| useParts handles empty list | MEDIUM |
| usePartDetail fetches by ID | HIGH |
| usePartDetail handles 404 | HIGH |

### 3.13 useServiceLogs (4+ tests)

| Test Case | Priority |
|-----------|----------|
| useServiceLogs fetches logs for vehicle | HIGH |
| useServiceLogs handles empty history | MEDIUM |
| useCreateServiceLog posts to correct endpoint | HIGH |
| useCreateServiceLog shows success toast | MEDIUM |

### 3.14 useProvinces (3+ tests)

| Test Case | Priority |
|-----------|----------|
| useProvinces fetches provinces with cities | HIGH |
| useProvinces returns cached data on refetch | MEDIUM |
| useCities fetches cities for province | MEDIUM |

### 3.15 usePhoneVerification (5+ tests)

| Test Case | Priority |
|-----------|----------|
| sendOtp posts correct phone number | HIGH |
| sendOtp handles rate limit error | HIGH |
| verifyOtp posts code for verification | HIGH |
| verifyOtp handles invalid code | HIGH |
| verifyOtp handles expired code | HIGH |
| checkStatus fetches verification status | MEDIUM |

### 3.16 Simple Hooks (2+ tests each)

| Hook | Test Cases | Priority |
|------|-----------|----------|
| useDebounce | Returns debounced value after delay | MEDIUM |
| useDebounce | Updates after input changes | MEDIUM |
| useAutoSave | Saves to localStorage periodically | MEDIUM |
| useAutoSave | Recovers saved data on mount | MEDIUM |
| useIsTouchDevice | Returns boolean for touch capability | LOW |
| usePrefersReducedMotion | Returns boolean for prefers-reduced-motion | LOW |
| usePushNotifications | Subscribes to push notifications | LOW |
| usePushNotifications | Unsubscribes on cleanup | LOW |
| useRealtimeNotifications | Listens to Echo channel | LOW |

# Test Plan: Marketplace Project
## 4. Phase 2: Store Tests

### 4.1 authStore (8+ tests)

| Test Case | Priority |
|-----------|----------|
| setAuth stores token, user, refreshToken | HIGH |
| setAuth clears error state | MEDIUM |
| logout clears all auth state | HIGH |
| logout redirects to login | MEDIUM |
| setPhoneVerified updates phoneVerified flag | HIGH |
| setPendingAction stores pending action | MEDIUM |
| clearPendingAction removes pending action | MEDIUM |
| getState returns current state snapshot | MEDIUM |

### 4.2 escrowStore (5+ tests)

| Test Case | Priority |
|-----------|----------|
| setTransactions stores transactions array | HIGH |
| addTransaction prepends new transaction | HIGH |
| updateTransaction modifies existing | HIGH |
| setLoading toggles loading state | MEDIUM |
| setError stores error message | MEDIUM |

### 4.3 fleetStore (6+ tests)

| Test Case | Priority |
|-----------|----------|
| setVehicles stores fleet array | HIGH |
| addVehicle adds to fleet | HIGH |
| updateVehicle modifies vehicle | HIGH |
| removeVehicle deletes by ID | HIGH |
| setSelectedVehicle sets active vehicle | MEDIUM |
| clearSelectedVehicle clears selection | MEDIUM |

### 4.4 partStore (4+ tests)

| Test Case | Priority |
|-----------|----------|
| setParts stores parts array | HIGH |
| addPart adds part | MEDIUM |
| removePart removes by ID | MEDIUM |
| clearParts empties array | MEDIUM |

### 4.5 recentlyViewedStore (5+ tests)

| Test Case | Priority |
|-----------|----------|
| addItem adds to front of list | HIGH |
| addItem deduplicates existing items | HIGH |
| addItem limits to max items (e.g. 20) | HIGH |
| getItems returns current list | MEDIUM |
| clearItems empties list | MEDIUM |

### 4.6 serviceLogStore (4+ tests)

| Test Case | Priority |
|-----------|----------|
| setLogs stores logs array | HIGH |
| addLog prepends log entry | HIGH |
| clearLogs empties array | MEDIUM |
| setLoading toggles loading state | MEDIUM |

### 4.7 tenderStore (4+ tests)

| Test Case | Priority |
|-----------|----------|
| setTenders stores tenders array | HIGH |
| addTender adds tender | HIGH |
| setCurrentTender sets active tender | MEDIUM |
| clearCurrentTender clears selection | MEDIUM |

---

## 5. Phase 3: Component Tests

### 5.1 Common Components — Existing (expand)

#### Toast (existing: 4 tests — add 4+)

| Test Case | Priority |
|-----------|----------|
| Renders container without toasts | ? Exists |
| Shows toast when toast() called | ? Exists |
| Shows message when provided | ? Exists |
| Auto-dismisses after default 3500ms | ? Exists |
| Renders warning type with correct styling | HIGH |
| Click-to-dismiss removes toast | MEDIUM |
| Multiple toasts stack correctly | MEDIUM |
| Toast with custom duration respects it | MEDIUM |

#### GlassSelect (existing: 7 tests — add 2+)

| Test Case | Priority |
|-----------|----------|
| Renders with placeholder | ? Exists |
| Shows selected label | ? Exists |
| Opens dropdown on click | ? Exists |
| Calls onChange when option selected | ? Exists |
| Closes dropdown after selection | ? Exists |
| Closes on outside click | ? Exists |
| Disabled when disabled prop is true | ? Exists |
| Keyboard navigation: Enter selects | HIGH |
| Keyboard navigation: Escape closes | MEDIUM |
| Keyboard navigation: Arrow Up/Down | MEDIUM |

#### AuthGate (existing: 4 tests — add 3+)

| Test Case | Priority |
|-----------|----------|
| Renders children when authenticated | ? Exists |
| Shows login prompt when unauthenticated | ? Exists |
| Shows minimal variant | ? Exists |
| Uses custom message when provided | ? Exists |
| requirePhone shows verify prompt for unverified | HIGH |
| phoneRedirect navigates to verify-phone | HIGH |
| Handles loading state while checking auth | MEDIUM |

### 5.2 Common Components — New

#### Loading / Skeleton

| Test Case | Priority |
|-----------|----------|
| Renders spinner/skeleton | MEDIUM |
| Accepts className prop | LOW |
| Has correct aria-label | MEDIUM |

#### EmptyState

| Test Case | Priority |
|-----------|----------|
| Shows default empty message | MEDIUM |
| Shows custom message when provided | MEDIUM |
| Shows action button with onClick | MEDIUM |
| Shows action link with href | MEDIUM |
| Renders icon when provided | LOW |

#### ErrorBoundary

| Test Case | Priority |
|-----------|----------|
| Renders children when no error | HIGH |
| Shows error UI when child throws | HIGH |
| Shows custom fallback when provided | HIGH |
| Reset button clears error state | MEDIUM |
| Logs error to console in dev | MEDIUM |

#### CompareBar

| Test Case | Priority |
|-----------|----------|
| Shows nothing when items empty | MEDIUM |
| Shows compare items when present | HIGH |
| Remove button calls store.removeItem | HIGH |
| Clear all button works | MEDIUM |
| Compare button navigates to /compare | MEDIUM |
| Item limit indicator visible at 4 items | MEDIUM |

#### NotificationDropdown

| Test Case | Priority |
|-----------|----------|
| Shows loading state while fetching | HIGH |
| Shows empty state when no notifications | HIGH |
| Shows notification list with items | HIGH |
| Click on notification marks as read | HIGH |
| Mark all read button works | MEDIUM |
| Unread count badge shows correct count | HIGH |
| Closes when clicking outside | MEDIUM |

#### Breadcrumbs

| Test Case | Priority |
|-----------|----------|
| Renders home link | MEDIUM |
| Renders all segments as links | MEDIUM |
| Last segment is plain text (no link) | MEDIUM |
| Uses Persian labels from LABELS map | MEDIUM |
| Handles numeric segments | LOW |

#### AIAssistant

| Test Case | Priority |
|-----------|----------|
| Shows welcome message on mount | MEDIUM |
| Sends user message on button click | MEDIUM |
| Sends user message on Enter key | MEDIUM |
| Shows assistant response after delay | MEDIUM |
| Scrolls to bottom on new message | LOW |
| Toggle open/close works | MEDIUM |
| Empty input does not send | LOW |

#### ThemeToggle

| Test Case | Priority |
|-----------|----------|
| Click toggles theme | MEDIUM |
| Has aria-label for accessibility | HIGH |
| Shows correct icon for current theme | MEDIUM |

#### ScrollToTop

| Test Case | Priority |
|-----------|----------|
| Hidden when at top of page | LOW |
| Visible when scrolled down | LOW |
| Click scrolls to top | LOW |

#### InfiniteScroll

| Test Case | Priority |
|-----------|----------|
| Calls onLoadMore when scrolled to bottom | MEDIUM |
| Shows loading indicator while loading | MEDIUM |
| Does not call onLoadMore when hasMore=false | MEDIUM |
| Debounces scroll events | LOW |

#### PriceDisplay

| Test Case | Priority |
|-----------|----------|
| Shows formatted price in ????? | MEDIUM |
| Shows "??????" for null price | MEDIUM |
| Shows "??????" for free type | MEDIUM |
| Applies correct color class for price_type | MEDIUM |

#### PersianDate

| Test Case | Priority |
|-----------|----------|
| Formats ISO date to Persian calendar | MEDIUM |
| Shows relative time for recent dates | MEDIUM |
| Returns "-" for null/undefined | MEDIUM |

#### UserMenuButton

| Test Case | Priority |
|-----------|----------|
| Shows user avatar when logged in | MEDIUM |
| Shows login button when logged out | MEDIUM |
| Opens dropdown menu on click | MEDIUM |
| Dropdown shows correct links for role | MEDIUM |
| Logout button calls logout | HIGH |

#### SanitizedHtml

| Test Case | Priority |
|-----------|----------|
| Renders safe HTML content | MEDIUM |
| Strips dangerous HTML tags | HIGH |
| Handles null/undefined content | MEDIUM |

### 5.3 Listing Components

#### ListingCard

| Test Case | Priority |
|-----------|----------|
| Renders title, price, location, date | HIGH |
| Shows primary image or placeholder | HIGH |
| Click navigates to listing detail | HIGH |
| Shows favorite button with correct state | HIGH |
| Shows compare button with correct state | HIGH |
| Shows status badge for non-active listings | MEDIUM |
| Shows featured badge when is_featured | MEDIUM |
| Memo prevents unnecessary re-renders | LOW |

#### ListingGrid

| Test Case | Priority |
|-----------|----------|
| Renders grid of ListingCard items | HIGH |
| Shows empty state when no listings | HIGH |
| Shows loading skeletons while loading | HIGH |
| Grid is responsive (columns change) | MEDIUM |

#### ListingGallery

| Test Case | Priority |
|-----------|----------|
| Shows main image with navigation | HIGH |
| Click on thumbnail changes main image | HIGH |
| Shows empty state when no images | HIGH |
| Fullscreen button opens lightbox | MEDIUM |
| Arrows navigate between images | MEDIUM |

#### QuickViewModal

| Test Case | Priority |
|-----------|----------|
| Opens with listing data | HIGH |
| Shows title, price, images, attributes | HIGH |
| Close button dismisses modal | HIGH |
| Click outside closes modal | MEDIUM |
| Has role="dialog" and aria-modal | HIGH |
| Focus trap works inside modal | MEDIUM |

#### RelatedListings

| Test Case | Priority |
|-----------|----------|
| Shows loading skeleton while fetching | HIGH |
| Shows related listings in a row | HIGH |
| Shows error state with refetch button | HIGH |
| Shows empty state when no related | MEDIUM |

#### ListingForm Steps

| Test Case | Priority |
|-----------|----------|
| Step1Category shows category selection | HIGH |
| Step1Category calls onChange with selection | HIGH |
| Step2Basic validates required fields | HIGH |
| Step2Basic loads provinces from API | HIGH |
| Step2Basic updates cities on province change | HIGH |
| Step3Attributes renders dynamic fields | HIGH |
| Step3Attributes validates based on is_required | HIGH |
| Step4Images shows upload area | HIGH |
| Step4Images allows drag-and-drop | MEDIUM |
| Step4Images shows preview of uploaded images | HIGH |
| Step4Images removes image on click | MEDIUM |
| Step5Preview shows all entered data | MEDIUM |
| Step5Preview submit button disabled when invalid | HIGH |

#### FavoriteButton

| Test Case | Priority |
|-----------|----------|
| Shows filled heart when favorited | HIGH |
| Shows outline heart when not favorited | HIGH |
| Click toggles favorite via mutation | HIGH |
| Shows loading state during mutation | MEDIUM |
| Handles unauthenticated error (redirects) | HIGH |

#### SellerCard

| Test Case | Priority |
|-----------|----------|
| Shows seller name and avatar | HIGH |
| Shows seller join date | MEDIUM |
| Start chat button works | HIGH |
| Shows dealer badge if applicable | MEDIUM |

#### ShareButton

| Test Case | Priority |
|-----------|----------|
| Opens share dialog/native share | MEDIUM |
| Copies link to clipboard | MEDIUM |
| Shows social media share options | LOW |

#### HealthScoreBadge

| Test Case | Priority |
|-----------|----------|
| Shows color based on score (green/yellow/red) | MEDIUM |
| Shows correct label for score range | MEDIUM |
| Handles null/undefined score | MEDIUM |

#### MapView

| Test Case | Priority |
|-----------|----------|
| Renders Leaflet map | LOW |
| Shows marker at listing location | LOW |

#### ActivityCard

| Test Case | Priority |
|-----------|----------|
| Shows activity type with icon | LOW |
| Shows timestamp in relative format | LOW |

#### CompatibleParts

| Test Case | Priority |
|-----------|----------|
| Shows compatible parts list | MEDIUM |
| Groups parts by category | MEDIUM |
| Shows nothing when no parts | MEDIUM |

### 5.4 Chat Components

#### ConversationList

| Test Case | Priority |
|-----------|----------|
| Shows list of conversations | HIGH |
| Active conversation has highlighted state | HIGH |
| Shows last message preview | MEDIUM |
| Shows unread count badge | HIGH |
| Shows empty state when no conversations | HIGH |
| Shows loading state while fetching | HIGH |
| Click navigates to conversation | HIGH |

#### ChatRoom

| Test Case | Priority |
|-----------|----------|
| Shows messages in conversation | HIGH |
| Auto-scrolls to latest message | MEDIUM |
| Sends new message via input | HIGH |
| Shows typing indicator | MEDIUM |
| Shows message status (sent/delivered/read) | MEDIUM |
| Loading state while fetching history | HIGH |
| Error state with retry button | HIGH |

#### ChatInput

| Test Case | Priority |
|-----------|----------|
| Send button disabled when input empty | MEDIUM |
| Enter key sends message | HIGH |
| Voice recorder button visible | MEDIUM |
| Attachment button visible | MEDIUM |
| Character limit indicator | LOW |

#### MessageBubble

| Test Case | Priority |
|-----------|----------|
| Sent messages align right (Persian RTL) | MEDIUM |
| Received messages align left | MEDIUM |
| Shows sender name for group chats | MEDIUM |
| Shows timestamp | MEDIUM |
| Shows read receipts | MEDIUM |
| Image attachments are clickable | MEDIUM |

#### MessageSearch

| Test Case | Priority |
|-----------|----------|
| Searches messages by text | MEDIUM |
| Shows search results with context | MEDIUM |
| Click on result scrolls to message | MEDIUM |
| Empty state when no matches | MEDIUM |
| Loading state during search | MEDIUM |

#### VoiceRecorder

| Test Case | Priority |
|-----------|----------|
| Starts recording on press | MEDIUM |
| Shows recording duration | MEDIUM |
| Playback preview after recording | MEDIUM |
| Send recorded voice message | MEDIUM |
| Cancel recording | MEDIUM |

#### ImageLightbox

| Test Case | Priority |
|-----------|----------|
| Shows image when opened | MEDIUM |
| Close on backdrop click | MEDIUM |
| Close on Escape key | MEDIUM |
| Has aria attributes for dialog | HIGH |
| Keyboard navigation (Arrow keys) | MEDIUM |
| Zoom in/out controls | LOW |

#### TypingIndicator

| Test Case | Priority |
|-----------|----------|
| Shows animated dots when user typing | LOW |
| Shows name of typing user | LOW |
| Hides after user stops typing | LOW |

### 5.5 Search Components

#### SearchBar

| Test Case | Priority |
|-----------|----------|
| Input updates query state | HIGH |
| Submit performs search navigation | HIGH |
| Shows recent searches dropdown | MEDIUM |
| Clear button resets input | MEDIUM |
| Has aria-label on voice button | HIGH |
| Results list has role="listbox" | HIGH |
| Keyboard navigation in results | MEDIUM |

#### FilterPanel

| Test Case | Priority |
|-----------|----------|
| Category filter selects and filters | HIGH |
| Province filter shows cities on selection | HIGH |
| Brand filter shows models on selection | HIGH |
| Year range filter works | MEDIUM |
| Sort select changes sort order | MEDIUM |
| Reset button clears all filters | HIGH |
| Active filter count badge | MEDIUM |
| Mobile responsive collapsible | MEDIUM |

#### AttributeFilters

| Test Case | Priority |
|-----------|----------|
| Renders dynamic attribute inputs | HIGH |
| Text input filters by text | MEDIUM |
| Select dropdown filters by option | MEDIUM |
| Range slider filters by min/max | MEDIUM |
| Boolean checkbox filters yes/no | MEDIUM |

#### SortSelect

| Test Case | Priority |
|-----------|----------|
| Shows current sort option | MEDIUM |
| Select changes sort parameter | MEDIUM |
| Uses Persian labels for options | MEDIUM |

### 5.6 Compare Components

#### CompareBar

| Test Case | Priority |
|-----------|----------|
| Shows nothing when 0 items | MEDIUM |
| Shows item thumbnails when > 0 | HIGH |
| Remove button removes specific item | HIGH |
| Clear all removes all items | HIGH |
| Compare navigates to /compare/:ids | HIGH |
| 4-item limit indicator | MEDIUM |

#### SpecComparisonGrid

| Test Case | Priority |
|-----------|----------|
| Shows attribute rows | MEDIUM |
| Highlights matching values | MEDIUM |
| Highlights differing values | MEDIUM |
| Shows images at top | MEDIUM |
| Scrollable horizontally | LOW |

#### RadarChart

| Test Case | Priority |
|-----------|----------|
| Renders radar chart for items | LOW |
| Shows attribute axes correctly | LOW |
| Different colors for different items | LOW |

#### PriceDepreciationChart

| Test Case | Priority |
|-----------|----------|
| Shows price trend over time | LOW |
| Multiple items shown with different colors | LOW |
| Correctly labels X and Y axes | LOW |

### 5.7 Fleet Components

#### FleetSummaryCard

| Test Case | Priority |
|-----------|----------|
| Shows vehicle name and image | HIGH |
| Shows key stats (mileage, year, etc.) | HIGH |
| Shows maintenance status indicator | MEDIUM |
| Click navigates to vehicle detail | MEDIUM |
| Shows insurance expiry warning | MEDIUM |

#### FuelChart

| Test Case | Priority |
|-----------|----------|
| Shows fuel consumption chart | LOW |
| Labels in Persian | LOW |

#### MaintenanceCalendar

| Test Case | Priority |
|-----------|----------|
| Shows upcoming maintenance events | MEDIUM |
| Shows past maintenance history | MEDIUM |
| Empty state when no history | MEDIUM |

#### InsuranceTimeline

| Test Case | Priority |
|-----------|----------|
| Shows insurance events in order | MEDIUM |
| Shows expiry date prominently | MEDIUM |
| Color codes active vs expired | MEDIUM |

#### FleetMap

| Test Case | Priority |
|-----------|----------|
| Shows vehicle locations on map | LOW |
| Markers have info popups | LOW |

### 5.8 Tender Components

#### TenderCard

| Test Case | Priority |
|-----------|----------|
| Shows tender title and deadline | HIGH |
| Shows current bid count and range | HIGH |
| Status badge (open/closed/awarded) | HIGH |
| Click navigates to tender detail | MEDIUM |

#### TenderForm

| Test Case | Priority |
|-----------|----------|
| Validates required fields | HIGH |
| Province select loads cities dynamically | MEDIUM |
| Submit button disabled when invalid | HIGH |
| Shows loading state on submit | HIGH |
| Handles API error with message | HIGH |

#### BidCard

| Test Case | Priority |
|-----------|----------|
| Shows bidder name and amount | MEDIUM |
| Shows bid timestamp | MEDIUM |
| Status indicator (pending/accepted/rejected) | MEDIUM |

#### BidForm

| Test Case | Priority |
|-----------|----------|
| Validates amount is positive number | HIGH |
| Submit button shows loading | HIGH |
| Handles bid below minimum error | HIGH |
| Handles duplicate bid error | HIGH |

### 5.9 Escrow Components

#### TransactionCard

| Test Case | Priority |
|-----------|----------|
| Shows amount and status | HIGH |
| Shows buyer/seller info | MEDIUM |
| Status badge with correct color | MEDIUM |
| Click navigates to detail | MEDIUM |

#### EscrowTimeline

| Test Case | Priority |
|-----------|----------|
| Shows timeline of escrow events | MEDIUM |
| Current step is highlighted | MEDIUM |
| Completed steps show checkmark | MEDIUM |
| Handles single transaction | MEDIUM |

### 5.10 Imported Components

#### ImportedBadge

| Test Case | Priority |
|-----------|----------|
| Shows correct label for origin | MEDIUM |
| Shows correct color for origin type | MEDIUM |

#### ImportCostBreakdown

| Test Case | Priority |
|-----------|----------|
| Shows cost breakdown items | LOW |
| Shows total cost | LOW |
| Currency format in ????? | LOW |

#### CustomsStatusCard

| Test Case | Priority |
|-----------|----------|
| Shows customs status with label | MEDIUM |
| Shows clearance date if available | MEDIUM |

#### CountryFlagIcon

| Test Case | Priority |
|-----------|----------|
| Shows flag for known country | LOW |
| Shows default for unknown country | LOW |

#### BrandOriginTag

| Test Case | Priority |
|-----------|----------|
| Shows brand with origin flag | LOW |
| Shows domestic/imported label | LOW |

### 5.11 Layout Components

#### Sidebar

| Test Case | Priority |
|-----------|----------|
| Shows navigation links based on role | HIGH |
| Active link is highlighted | MEDIUM |
| Collapses on mobile | MEDIUM |
| Logout button works | HIGH |
| User info displayed at top | MEDIUM |
| Admin links only visible for admin | HIGH |

#### MobileBottomNav

| Test Case | Priority |
|-----------|----------|
| Shows on mobile viewport | MEDIUM |
| Active tab highlighted | MEDIUM |
| Plus button navigates to new listing | MEDIUM |
| Shows correct icons for each tab | MEDIUM |

#### Footer

| Test Case | Priority |
|-----------|----------|
| Shows copyright notice | LOW |
| Shows navigation links | LOW |
| Social media links are present | LOW |

### 5.12 Auth Components

#### AuthGuard

| Test Case | Priority |
|-----------|----------|
| Renders children when authenticated | HIGH |
| Redirects to login when unauthenticated | HIGH |
| Redirect preserves return URL | HIGH |
| Shows loading while checking auth | MEDIUM |

#### LogoutModalProvider

| Test Case | Priority |
|-----------|----------|
| Shows modal when triggered | HIGH |
| Confirm button calls logout | HIGH |
| Cancel button dismisses modal | MEDIUM |

#### ProfileCompletionGuard

| Test Case | Priority |
|-----------|----------|
| Shows warning when profile incomplete | MEDIUM |
| Allows dismiss with "later" | MEDIUM |

### 5.13 Payment Components

#### FeaturedPurchaseModal

| Test Case | Priority |
|-----------|----------|
| Shows tier selection (bronze/silver/gold) | MEDIUM |
| Shows price for each tier | MEDIUM |
| Confirm button initiates payment | MEDIUM |
| Close button dismisses modal | MEDIUM |

### 5.14 Upload Components

#### ImageUploader

| Test Case | Priority |
|-----------|----------|
| Click opens file picker | HIGH |
| Drag-and-drop works | HIGH |
| Shows preview after selection | HIGH |
| Upload progress indicator | MEDIUM |
| Remove button removes image | HIGH |
| Accepts image files only | HIGH |
| File size validation | HIGH |
| Multiple files can be selected | MEDIUM |

### 5.15 News Components

#### NewsCard

| Test Case | Priority |
|-----------|----------|
| Shows article title and excerpt | MEDIUM |
| Shows cover image | MEDIUM |
| Shows reading time and date | MEDIUM |
| Click navigates to article | MEDIUM |
| Category badge displayed | MEDIUM |

#### ArticleSidebar

| Test Case | Priority |
|-----------|----------|
| Shows recent articles | MEDIUM |
| Shows article categories | MEDIUM |
| Shows tags cloud | LOW |

### 5.16 DealerReviews

| Test Case | Priority |
|-----------|----------|
| Shows existing reviews | MEDIUM |
| Shows rating stars | MEDIUM |
| Submit review form works | MEDIUM |
| Empty state when no reviews | MEDIUM |
| Loading state while fetching | MEDIUM |

---

## 6. Phase 4: Integration Tests

### 6.1 Page-Level Integration Tests (20+ tests)

Use Playwright or RTL with mocked API:

| Page | Test Cases | Priority |
|------|-----------|----------|
| Home (/) | Renders hero, categories grid, recent listings, smart alerts | HIGH |
| Listing Detail (/listings/[slug]) | Loads listing, shows gallery, description, seller card, related | HIGH |
| Search Results (/listings) | Displays results, pagination works, filters change results | HIGH |
| Login (/login) | Form validation, submit calls API, redirects on success | HIGH |
| Register (/register) | Form validation, submit calls API, redirects on success | HIGH |
| Dashboard (/dashboard) | Shows stats, recent listings, profile info | HIGH |
| New Listing (/listings/new) | Multi-step form, each step validates, submit creates listing | HIGH |
| Messages (/dashboard/messages) | Shows conversations, click opens chat | MEDIUM |
| Compare (/compare/[ids]) | Shows comparison grid, radar chart, price chart | MEDIUM |

---

## 7. Phase 5: E2E Tests

### 7.1 Critical User Journeys (10+ tests)

| Journey | Description | Priority |
|---------|-------------|----------|
| Guest browsing | Visit home, search listings, view detail, see related | HIGH |
| Registration flow | Register, auto-login, redirected to home | HIGH |
| Login flow | Login, redirected to previous page | HIGH |
| Create listing | Login, navigate to /listings/new, fill form, submit | HIGH |
| Chat flow | Login, view listing, contact seller, send message | HIGH |
| Favorites | Login, view listing, favorite, verify in favorites page | HIGH |
| Compare flow | Browse, add 2 listings to compare, view comparison | MEDIUM |
| Profile update | Login, dashboard, update profile, verify | MEDIUM |
| Logout flow | Login, logout, redirected to home, cannot access dashboard | HIGH |
| Phone verification | Login, navigate to verify-phone, enter OTP, verified | MEDIUM |

### 7.2 E2E Test Pattern Example

`	ypescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('??? ??????')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText('????? ?? ??? ???? ?????? ???')).toBeVisible();
  });
});
`


---

## 8. Phase 6: Accessibility Tests

Automated a11y checks for key interactive components:

| Component | Checklist | Priority |
|-----------|-----------|----------|
| All buttons | Not empty, has aria-label if icon-only | HIGH |
| All images | Have alt text (not empty unless decorative) | HIGH |
| All forms | Inputs have labels, error messages linked | HIGH |
| All modals | role=\"dialog\", aria-modal=\"true\", focus trap | HIGH |
| All live regions | aria-live for dynamic content (AI assistant, notifications) | HIGH |
| CustomCursor | Does NOT set * { cursor: none } globally | HIGH |
| Search results | role=\"listbox\", aria-activedescendant | HIGH |
| ThemeToggle | aria-label=\"????? ??\" | ? Has it |

---

## 9. Implementation Order

| Phase | Scope | Est. Tests | Est. Time | Dependencies |
|-------|-------|-----------|-----------|-------------|
| 1a | Hook tests HIGH priority (useAuth, useListings, useChat, useFavorites, useSearch, useNotifications) | 50 | 3 days | Factory utilities |
| 1b | Hook tests MEDIUM priority (remaining 11 hooks) | 40 | 2 days | Factory utilities |
| 2 | Store tests (7 stores) | 36 | 1 day | None |
| 3a | Common component tests (20 components) | 60 | 3 days | Factory utilities |
| 3b | Listing component tests (15 components) | 45 | 2.5 days | Factory utilities |
| 3c | Chat component tests (8 components) | 25 | 1.5 days | Factory utilities |
| 3d | Remaining component tests (30+ components) | 50 | 3 days | Factory utilities |
| 4 | Integration tests (9 pages) | 20 | 2 days | Mock API setup |
| 5 | E2E tests (10 journeys) | 10 | 2 days | Test environment |
| 6 | Accessibility tests | - | 1 day | axe-core setup |
| **Total** | | **~336 tests** | **~21 days** | |

### 9.1 Parallelizable Work

The following phases can run in parallel:
- Phase 2 (stores) + Phase 1a (hooks) — independent
- Phase 3d (remaining components) — independent of 3a-3c
- Phase 6 (a11y) — independent of all others
- Phase 5 (E2E) — after Phase 4 (integration)

---

## 10. Test Infrastructure Improvements

### 10.1 Factory Helpers (HIGH priority — before any test writing)

Create directory: \src/test/factories/\

\\\
src/test/factories/
+-- index.ts          # Re-exports all factories
+-- listing.ts        # createMockListing, createMockListingDetail
+-- user.ts           # createMockUser
+-- chat.ts           # createMockConversation, createMockMessage
+-- categories.ts     # createMockCategory, createMockAttribute
+-- notification.ts   # createMockNotification
+-- fleet.ts          # createMockVehicle
+-- tender.ts         # createMockTender, createMockBid
+-- escrow.ts         # createMockTransaction
+-- compare.ts        # createMockCompareItem
\\\

### 10.2 Custom Render Helper

Extend \src/test/test-utils.tsx\:

\\\	ypescript
// Add providers: QueryClient, AuthStore, ThemeProvider, ToastContainer
export function renderWithAllProviders(ui: ReactNode, options?: ...) { ... }
export function renderWithAuth(ui: ReactNode, { authenticated = true, user = mockUser } = {}) { ... }
\\\

### 10.3 Mock Server (MSW) — Future consideration

For integration tests, consider MSW (Mock Service Worker) to intercept API calls at the network level.

---

## 11. Quality Gates

Before merging any test PR:

1. All new tests pass (\itest run\)
2. No flaky tests (run 3x locally)
3. Tests cover: happy path, error path, edge cases
4. No test imports production code paths that are mocked inconsistently
5. Factories used over inline mock data
6. No \data-testid\ added to production code (use role/text queries)
7. Accessibility assertions for interactive components
8. TypeScript compiles with no errors

---

## 12. Appendix: Current Test Files Reference

| File | Type | Tests | Lines |
|------|------|-------|-------|
| \src/hooks/useAuth.test.ts\ | Hook | 6 | 122 |
| \src/hooks/useListings.test.tsx\ | Hook | 1 | 52 |
| \src/store/compareStore.test.ts\ | Store | 7 | 77 |
| \src/store/logoutModalStore.test.ts\ | Store | 3 | 27 |
| \src/lib/utils.test.ts\ | Util | 8 | 111 |
| \src/components/common/Toast.test.tsx\ | Component | 4 | 39 |
| \src/components/common/GlassSelect.test.tsx\ | Component | 7 | 64 |
| \src/components/common/AuthGate.test.tsx\ | Component | 4 | 46 |
| \ackend/tests/auth.test.ts\ | Backend | ~12 | - |
| \ackend/tests/cache.test.ts\ | Backend | ~5 | - |
| \ackend/tests/emailProvider.test.ts\ | Backend | ~2 | - |
| \ackend/tests/emailVerification.test.ts\ | Backend | ~3 | - |
| \ackend/tests/errors.test.ts\ | Backend | ~5 | - |
| \ackend/tests/eventBus.test.ts\ | Backend | ~4 | - |
| \ackend/tests/permission.test.ts\ | Backend | ~3 | - |
| \ackend/tests/phoneVerification.test.ts\ | Backend | ~4 | - |
| \ackend/tests/smsProvider.test.ts\ | Backend | ~2 | - |
| \e2e/home.spec.ts\ | E2E | 3 | - |
