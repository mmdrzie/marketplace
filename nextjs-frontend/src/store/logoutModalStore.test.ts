import { describe, it, expect, beforeEach } from 'vitest';
import { useLogoutModal } from './logoutModalStore';

describe('logoutModalStore', () => {
  beforeEach(() => {
    useLogoutModal.setState({ isOpen: false, onConfirm: null });
  });

  it('starts closed', () => {
    expect(useLogoutModal.getState().isOpen).toBe(false);
    expect(useLogoutModal.getState().onConfirm).toBeNull();
  });

  it('opens with callback', () => {
    const cb = () => {};
    useLogoutModal.getState().open(cb);
    expect(useLogoutModal.getState().isOpen).toBe(true);
    expect(useLogoutModal.getState().onConfirm).toBe(cb);
  });

  it('closes and clears callback', () => {
    useLogoutModal.getState().open(() => {});
    useLogoutModal.getState().close();
    expect(useLogoutModal.getState().isOpen).toBe(false);
    expect(useLogoutModal.getState().onConfirm).toBeNull();
  });
});
