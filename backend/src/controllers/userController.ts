import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Task from '../models/Task';

/**
 * GET /api/users
 * Admin only — list all users
 */
export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });

    // Get task counts for each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({
          $or: [{ creator: user._id }, { assignedTo: user._id }],
        });
        const assignedCount = await Task.countDocuments({
          assignedTo: user._id,
        });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          taskCount,
          assignedCount,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithTaskCounts.length,
      data: { users: usersWithTaskCounts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Admin only — get single user with details
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    const tasks = await Task.find({
      $or: [{ creator: user._id }, { assignedTo: user._id }],
    })
      .populate('creator', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
