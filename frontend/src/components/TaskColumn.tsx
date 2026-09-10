'use client';

import { Task } from '@/lib/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  columnId: string;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  isAdmin: boolean;
  currentUserId: string;
}

const columnConfig: Record<string, { color: string; icon: string; gradient: string }> = {
  todo: {
    color: '#818cf8',
    icon: '○',
    gradient: 'from-indigo-500/20 to-indigo-600/5',
  },
  doing: {
    color: '#f59e0b',
    icon: '◐',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  done: {
    color: '#10b981',
    icon: '●',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
};

export default function TaskColumn({
  columnId,
  title,
  tasks,
  onEdit,
  onDelete,
  onAssign,
  isAdmin,
  currentUserId,
}: TaskColumnProps) {
  const config = columnConfig[columnId];

  return (
    <div className="flex flex-col min-h-[500px] w-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className="text-lg"
            style={{ color: config.color }}
          >
            {config.icon}
          </span>
          <h3 className="font-semibold text-white text-sm tracking-wide uppercase">
            {title}
          </h3>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${config.color}15`,
              color: config.color,
            }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-2xl p-3 space-y-3 transition-colors duration-300 min-h-[400px] ${
              snapshot.isDraggingOver ? 'column-drag-over' : ''
            }`}
            style={{
              background: snapshot.isDraggingOver
                ? 'rgba(124, 58, 237, 0.05)'
                : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${
                snapshot.isDraggingOver
                  ? 'rgba(124, 58, 237, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)'
              }`,
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-zinc-600">
                <span className="text-2xl mb-2 opacity-50">{config.icon}</span>
                <span className="text-xs">No tasks</span>
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssign}
                canAssign={!task.assignedTo}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
