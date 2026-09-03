import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task';

/**
 * GET /api/tasks
 * Users see their own tasks + unassigned tasks; admins see all tasks
 */
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    let query = {};

    if (user.role !== 'admin') {
      // Normal users see: tasks they created, tasks assigned to them, or unassigned tasks
      query = {
        $or: [
          { creator: user._id },
          { assignedTo: user._id },
          { assignedTo: null },
        ],
      };
    }

    const tasks = await Task.find(query)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 * Create a new task
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const user = req.user!;
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      creator: user._id,
      assignedTo: null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Get a single task
 */
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    const user = req.user!;
    // Normal users can only view their own tasks or unassigned tasks
    if (
      user.role !== 'admin' &&
      task.creator._id.toString() !== user._id.toString() &&
      task.assignedTo?._id?.toString() !== user._id.toString() &&
      task.assignedTo !== null
    ) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this task.',
      });
      return;
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Update a task (title, description, status)
 */
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    const user = req.user!;
    // Normal users can only update tasks they created or are assigned to
    if (
      user.role !== 'admin' &&
      task.creator.toString() !== user._id.toString() &&
      task.assignedTo?.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task.',
      });
      return;
    }

    const { title, description, status } = req.body;
    const updateData: Record<string, any> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    const user = req.user!;
    // Normal users can only delete tasks they created
    if (
      user.role !== 'admin' &&
      task.creator.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task.',
      });
      return;
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Update task status (for drag-and-drop)
 */
export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !['todo', 'doing', 'done'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "todo", "doing", or "done".',
      });
      return;
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    const user = req.user!;
    // Normal users can only update status of tasks they created or are assigned to
    if (
      user.role !== 'admin' &&
      task.creator.toString() !== user._id.toString() &&
      task.assignedTo?.toString() !== user._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task status.',
      });
      return;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/assign
 * Assign/reassign a task
 * - Normal users can only assign unassigned tasks to themselves
 * - Admins can assign/reassign tasks to any user
 */
export const assignTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assignedTo } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
      return;
    }

    const user = req.user!;

    if (user.role !== 'admin') {
      // Normal user: can only assign unassigned tasks to themselves
      if (task.assignedTo !== null) {
        res.status(403).json({
          success: false,
          message: 'This task is already assigned. Only admins can reassign tasks.',
        });
        return;
      }

      if (assignedTo && assignedTo !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'You can only assign tasks to yourself.',
        });
        return;
      }

      // Assign to self
      task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignedTo: user._id },
        { new: true, runValidators: true }
      )
        .populate('creator', 'name email')
        .populate('assignedTo', 'name email');
    } else {
      // Admin: can assign/reassign to anyone, or unassign (null)
      task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignedTo: assignedTo || null },
        { new: true, runValidators: true }
      )
        .populate('creator', 'name email')
        .populate('assignedTo', 'name email');
    }

    res.json({
      success: true,
      message: 'Task assignment updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};
