export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  taskCount?: number;
  assignedCount?: number;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface TasksResponse {
  success: boolean;
  count: number;
  data: {
    tasks: Task[];
  };
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: {
    task: Task;
  };
}

export interface UsersResponse {
  success: boolean;
  count: number;
  data: {
    users: User[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; path: string }>;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
