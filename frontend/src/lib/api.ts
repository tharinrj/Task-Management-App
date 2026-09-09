import {
  AuthResponse,
  TasksResponse,
  TaskResponse,
  UsersResponse,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the auth token from localStorage
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Base fetch wrapper with auth headers and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // If the response contains validation errors, extract the specific messages
    if (data.errors && Array.isArray(data.errors)) {
      const messages = data.errors.map((err: { msg: string }) => err.msg);
      throw new Error(messages.join('\n'));
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

/**
 * Auth API
 */
export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  verifyOtp: (email: string, otp: string) =>
    apiFetch<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    apiFetch<{ success: boolean; data: { user: AuthResponse['data']['user'] } }>(
      '/auth/me'
    ),
};

/**
 * Tasks API
 */
export const tasksApi = {
  getAll: () => apiFetch<TasksResponse>('/tasks'),

  getOne: (id: string) => apiFetch<TaskResponse>(`/tasks/${id}`),

  create: (data: CreateTaskData) =>
    apiFetch<TaskResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaskData) =>
    apiFetch<TaskResponse>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: TaskStatus) =>
    apiFetch<TaskResponse>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  assign: (id: string, assignedTo: string | null) =>
    apiFetch<TaskResponse>(`/tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    }),

  reorder: (tasks: Array<{ id: string; order: number; status: string }>) =>
    apiFetch<{ success: boolean; message: string }>('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ tasks }),
    }),
};

/**
 * Users API (admin only)
 */
export const usersApi = {
  getAll: () => apiFetch<UsersResponse>('/users'),

  getOne: (id: string) =>
    apiFetch<{
      success: boolean;
      data: {
        user: UsersResponse['data']['users'][0];
        tasks: TasksResponse['data']['tasks'];
      };
    }>(`/users/${id}`),
};
