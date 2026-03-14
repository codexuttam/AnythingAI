import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task.js';
import { z } from 'zod';

const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
});

export const getTasks = async (req: any, res: Response, next: NextFunction) => {
    try {
        let query = {};
        // If not admin, only show user's tasks
        if (req.user.role !== 'admin') {
            query = { user: req.user.id };
        }

        const tasks = await Task.find(query).populate('user', 'name email');
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

export const getTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Check ownership
        if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to access this task' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = taskSchema.parse(req.body);
        const task = await Task.create({
            ...validatedData,
            user: req.user.id,
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Check ownership
        if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Check ownership
        if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
