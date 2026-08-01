'use client';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'تأیید', isLoading, variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
      <div className="flex items-center gap-3 justify-end">
        <button onClick={onClose} disabled={isLoading} className="btn btn-ghost btn-sm">انصراف</button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
        >
          {isLoading ? 'در حال انجام...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
