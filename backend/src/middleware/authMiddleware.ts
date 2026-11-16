import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { isAllowedAdminEmail } from '../auth/adminAllowlist';
import { errorJson } from '../utils/jsonResponses';

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split('Bearer ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

// Use after verifyToken. Allows the request through only if the signed-in
// user's email is on the admin allow-list.
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).send(errorJson('Unauthorized'));
            return;
        }
        if (!(await isAllowedAdminEmail(req.user.email))) {
            res.status(403).send(errorJson('Forbidden'));
            return;
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).send(errorJson('Server error'));
    }
};
