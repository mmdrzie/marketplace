import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LogoutModalState {
  isOpen: boolean;
  onConfirm: (() => void) | null;
  open: (confirmCallback: () => void) => void;
  close: () => void;
}

export const useLogoutModal = create<LogoutModalState>()(
  devtools(
    (set) => ({
      isOpen: false,
      onConfirm: null,
      open: (confirmCallback) => set({ isOpen: true, onConfirm: confirmCallback }),
      close: () => set({ isOpen: false, onConfirm: null }),
    }),
    { name: 'logout-modal' },
  ),
);
