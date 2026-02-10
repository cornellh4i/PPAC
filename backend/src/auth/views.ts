import express, { Request, Response } from 'express';
import { UserModel } from '../users/models'
import { verifyToken } from '../middleware/authMiddleware';
// import '../types';

const router = express.Router();

// Register/Login endpoint
router.post('/register', verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { uid, email } = req.user;
        const { name } = req.body as { name?: string };

        // Check if user already exists
        let user = await UserModel.findOne({ firebaseUid: uid });

        if (!user) {
            // Create new user in MongoDB
            user = new UserModel({
                firebaseUid: uid,
                email: email,
                name: name
            });
            await user.save();
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
router.post('/login', verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await UserModel.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route example
router.get('/profile', verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await UserModel.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;