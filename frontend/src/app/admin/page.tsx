'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const res = await usersApi.getAll();
        setUsers(res.data.users);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  return (
    <ProtectedRoute adminOnly>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="bg-mesh" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1
              className="text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Admin Panel
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage users and view system overview
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Total Users
              </div>
              <div className="text-3xl font-bold text-white">
                {users.length}
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Admins
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {users.filter((u) => u.role === 'admin').length}
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Regular Users
              </div>
              <div className="text-3xl font-bold text-cyan-400">
                {users.filter((u) => u.role === 'user').length}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Users Table */}
          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <div className="glass rounded-2xl overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Tasks Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Tasks Assigned
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {u.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-purple-500/15 text-purple-400'
                                : 'bg-zinc-500/15 text-zinc-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {u.taskCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {u.assignedCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-12 text-zinc-600 text-sm">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
