'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const accentColor = variant === 'danger' ? 'red' : 'amber';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 modal-backdrop animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-fade-in"
        style={{ animationDuration: '0.2s' }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: `rgba(${accentColor === 'red' ? '239, 68, 68' : '245, 158, 11'}, 0.1)`,
            border: `1px solid rgba(${accentColor === 'red' ? '239, 68, 68' : '245, 158, 11'}, 0.2)`,
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{
              color: accentColor === 'red' ? '#ef4444' : '#f59e0b',
            }}
          >
            {variant === 'danger' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            )}
          </svg>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold text-white text-center mb-1"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-zinc-400 text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="confirm-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-action-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                accentColor === 'red'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow:
                accentColor === 'red'
                  ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                  : '0 4px 20px rgba(245, 158, 11, 0.3)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
