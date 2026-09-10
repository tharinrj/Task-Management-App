'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  canAssign: boolean;
  isAdmin: boolean;
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  todo: '#818cf8',
  doing: '#f59e0b',
  done: '#10b981',
};

export default function TaskCard({
  task,
  index,
  onEdit,
  onDelete,
  onAssign,
  canAssign,
  isAdmin,
  currentUserId,
}: TaskCardProps) {
  const isCreator = task.creator._id === currentUserId;
  const isAssignee = task.assignedTo?._id === currentUserId;
  const canEdit = isAdmin || isCreator || isAssignee;
  const canDelete = isAdmin || isCreator;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group p-4 rounded-xl cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'glass-strong shadow-2xl shadow-purple-500/10'
              : 'glass hover:bg-white/[0.06]'
          }`}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging
              ? {
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                }
              : {}),
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : 'background-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {/* Status indicator line */}
          <div
            className="h-0.5 w-12 rounded-full mb-3"
            style={{ backgroundColor: statusColors[task.status] }}
          />

          {/* Title */}
          <h4 className="text-sm font-semibold text-white mb-1.5 line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {task.assignedTo ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-[9px] text-white font-semibold">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {task.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-zinc-500 italic">
                  Unassigned
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-600">{timeAgo(task.updatedAt)}</span>
          </div>

          {/* Actions - visible on hover */}
          {(canEdit || canDelete || canAssign || isAdmin) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="px-2 py-1 text-[11px] rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              title="Edit task"
            >
              Edit
            </button>
            )}
            {(canAssign || isAdmin) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(task._id);
                }}
                className="px-2 py-1 text-[11px] rounded-md text-zinc-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all"
                title={task.assignedTo ? 'Reassign' : 'Assign to me'}
              >
                {isAdmin
                  ? task.assignedTo
                    ? 'Reassign'
                    : 'Assign'
                  : !task.assignedTo
                  ? 'Take'
                  : null}
              </button>
            )}
            {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="px-2 py-1 text-[11px] rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all ml-auto"
              title="Delete task"
            >
              Delete
            </button>
            )}
          </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
