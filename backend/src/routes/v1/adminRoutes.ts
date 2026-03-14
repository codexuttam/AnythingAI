import express, { Response, NextFunction } from 'express';
import User from '../../models/User.js';
import { protect, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../models/User.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize(UserRole.ADMIN));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Not authorized (Admin only)
 */
router.get('/users', async (req: any, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
});

export default router;
