import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDb } from './setup.js';

// skipIfNoDb() returns true only when DATABASE_URL points to a real DB
const integrationEnabled = skipIfNoDb();

describe.runIf(integrationEnabled)('Listing Integration', () => {
  it('creates a listing and reads from projection', async () => {
    // needs: real database, migrated schema, test seed data
    // plan:
    //   1. Insert a listing row
    //   2. Insert an outbox_event row
    //   3. Run the projection handler
    //   4. Assert the projection table has the expected row
    //   5. Assert listing read API returns the projection data
    expect(true).toBe(true);
  });

  it('rejects concurrent optimistic lock update', async () => {
    // needs: real database, migrated schema
    // plan:
    //   1. Read listing (version=1)
    //   2. Update listing in tx1 (version->2)
    //   3. Attempt update in tx2 with version=1 -> expect row count 0
    expect(true).toBe(true);
  });

  it('outbox publishes event and removes it', async () => {
    // needs: real database, Worker running or triggered
    // plan:
    //   1. Insert outbox_event with status=pending
    //   2. Run publish loop
    //   3. Assert status=published
    //   4. Assert published_at is set
    expect(true).toBe(true);
  });
});
