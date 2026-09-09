'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/contexts/AuthContext';
import { tasksApi, usersApi } from '@/lib/api';
import { Task, User, TaskStatus, CreateTaskData, UpdateTaskData } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskColumn from '@/components/TaskColumn';
import TaskModal from '@/components/TaskModal';
import AssignModal from '@/components/AssignModal';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState('');

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete confirm modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await tasksApi.getAll();
      setTasks(res.data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  // Fetch users (admin only)
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await usersApi.getAll();
      setUsers(res.data.users);
    } catch {
      // Non-critical, just means assign dropdown won't work
    }
  }, [isAdmin]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTasks(), fetchUsers()]);
    };
    loadData();
  }, [fetchTasks, fetchUsers]);

  // Group tasks by status, sorted by order
  const tasksByStatus = columns.reduce(
    (acc, col) => {
      acc[col.id] = tasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  // Drag end handler
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    let reorderPayload: Array<{ id: string; order: number; status: string }> = [];
    let snapshotBeforeDrag: Task[] = [];

    setTasks((prev) => {
      snapshotBeforeDrag = prev;

      // Build sorted column arrays from current state
      const sourceCol = prev
        .filter((t) => t.status === sourceStatus)
        .sort((a, b) => a.order - b.order);
      const destCol = sourceStatus === destStatus
        ? sourceCol
        : prev.filter((t) => t.status === destStatus).sort((a, b) => a.order - b.order);

      // Remove task from source column
      const [movedTask] = sourceCol.splice(source.index, 1);

      // Insert into destination column
      const targetCol = sourceStatus === destStatus ? sourceCol : destCol;
      targetCol.splice(destination.index, 0, { ...movedTask, status: destStatus });

      // Build reorder payload for affected columns
      reorderPayload = [];
      const assignOrders = (col: Task[], status: TaskStatus) => {
        col.forEach((t, i) => {
          reorderPayload.push({ id: t._id, order: i, status });
        });
      };

      assignOrders(sourceStatus === destStatus ? targetCol : sourceCol, sourceStatus);
      if (sourceStatus !== destStatus) {
        assignOrders(targetCol, destStatus);
      }

      // Apply updates to the full tasks array
      const orderMap = new Map(reorderPayload.map((r) => [r.id, r]));
      return prev.map((t) => {
        const update = orderMap.get(t._id);
        return update ? { ...t, status: update.status as TaskStatus, order: update.order } : t;
      });
    });

    try {
      await tasksApi.reorder(reorderPayload);
    } catch (err: unknown) {
      setTasks(snapshotBeforeDrag);
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
    }
  };

  // Create task
  const handleCreateTask = async (data: CreateTaskData | UpdateTaskData) => {
    const res = await tasksApi.create(data as CreateTaskData);
    setTasks((prev) => [res.data.task, ...prev]);
  };

  // Update task
  const handleUpdateTask = async (data: CreateTaskData | UpdateTaskData) => {
    if (!editingTask) return;
    const res = await tasksApi.update(editingTask._id, data as UpdateTaskData);
    setTasks((prev) =>
      prev.map((t) => (t._id === editingTask._id ? res.data.task : t))
    );
  };

  // Delete task — open confirm modal
  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(deletingTaskId);
      setTasks((prev) => prev.filter((t) => t._id !== deletingTaskId));
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      setDeletingTaskId(null);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Assign task (for admin modal)
  const handleAssignFromModal = async (userId: string | null) => {
    if (!assigningTaskId) return;
    const res = await tasksApi.assign(assigningTaskId, userId);
    setTasks((prev) =>
      prev.map((t) => (t._id === assigningTaskId ? res.data.task : t))
    );
  };

  // Assign task (self-assign for normal user, or open modal for admin)
  const handleAssignClick = async (taskId: string) => {
    if (isAdmin) {
      setAssigningTaskId(taskId);
      setIsAssignModalOpen(true);
    } else {
      // Normal user: self-assign
      try {
        const res = await tasksApi.assign(taskId, user!.id);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to assign task');
      }
    }
  };

  // Assign from task modal (admin)
  const handleAssignFromTaskModal = async (taskId: string, userId: string | null) => {
    const res = await tasksApi.assign(taskId, userId);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data.task : t))
    );
  };

  // Edit task handler
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const assigningTask = tasks.find((t) => t._id === assigningTaskId);

  return (
    <ProtectedRoute>
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div className="bg-mesh" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Task Board
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {isAdmin
                  ? 'Managing all tasks across the organization'
                  : 'Drag and drop to update task status'}
              </p>
            </div>
            <button
              id="create-task-btn"
              onClick={openCreateModal}
              className="btn-gradient !py-2.5 !px-5 !rounded-xl text-sm inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Board */}
          {isLoadingTasks ? (
            <LoadingSpinner size="lg" />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col) => (
                  <TaskColumn
                    key={col.id}
                    columnId={col.id}
                    title={col.title}
                    tasks={tasksByStatus[col.id] || []}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAssign={handleAssignClick}
                    isAdmin={isAdmin}
                    currentUserId={user?.id || ''}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>

        {/* Task Create/Edit Modal */}
        <TaskModal
          key={`${editingTask?._id ?? 'new'}-${isTaskModalOpen}`}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
          users={users}
          isAdmin={isAdmin}
          onAssign={handleAssignFromTaskModal}
        />

        {/* Assign Modal (admin) */}
        <AssignModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssigningTaskId(null);
          }}
          onAssign={handleAssignFromModal}
          users={users}
          currentAssignee={assigningTask?.assignedTo?._id || null}
        />

        {/* Delete Confirm Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingTaskId(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message="This task will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </ProtectedRoute>
  );
}
