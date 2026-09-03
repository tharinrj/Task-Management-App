'use client';

import { useState } from 'react';
import { User } from '@/lib/types';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string | null) => Promise<void>;
  users: User[];
  currentAssignee?: string | null;
}

export default function AssignModal({
  isOpen,
  onClose,
  onAssign,
  users,
  currentAssignee,
}: AssignModalProps) {
  const [selectedUser, setSelectedUser] = useState(currentAssignee || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selectedUser || null);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Assign Task</h2>

        <div className="mb-4">
          <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isSubmitting}
            className="flex-1 btn-gradient !py-2.5 !rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
