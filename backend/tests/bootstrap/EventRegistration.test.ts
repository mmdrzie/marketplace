import { describe, it, expect } from 'vitest';
import { registerEventHandlers } from '../../src/bootstrap/EventRegistration.js';

describe('EventRegistration', () => {
  it('runs without error', () => {
    expect(registerEventHandlers).not.toThrow();
  });

  it('runs idempotently without error on repeated calls', () => {
    expect(registerEventHandlers).not.toThrow();
    expect(registerEventHandlers).not.toThrow();
  });
});
