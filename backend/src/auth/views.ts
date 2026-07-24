import express, { Request, Response } from "express";
import { User, UserModel } from "../users/models";
import { verifyToken } from "../middleware/authMiddleware";
import {
    addAllowedAdminEmail,
    getAllowedAdminEmails,
    isAllowedAdminEmail,
    removeAllowedAdminEmail
} from "./adminAllowlist";

const router = express.Router();

const requireAdmin = async (req: Request, res: Response): Promise<boolean> => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return false;
    }
    if (!(await isAllowedAdminEmail(req.user.email))) {
        res.status(403).json({ message: "Forbidden" });
        return false;
    }
    return true;
};

type UserRole = User["role"];

type SyncUserBody = {
    name?: string;
    role?: UserRole;
};

const syncUserFromFirebase = async (
    req: Request,
    res: Response
): Promise<User | null> => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }

    const { uid, email } = req.user;
    const { name, role } = req.body as SyncUserBody;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim();

    if (!normalizedEmail) {
        res.status(400).json({ message: "Firebase account is missing an email address" });
        return null;
    }

    const existingUser = await UserModel.findOne({ firebaseUid: uid });

    if (!existingUser) {
        const createdUser = new UserModel({
            firebaseUid: uid,
            email: normalizedEmail,
            name: normalizedName,
            role: role ?? "student"
        });

        await createdUser.save();
        return createdUser;
    }

    const updateFields: Partial<User> = {
        email: normalizedEmail,
        ...(normalizedName ? { name: normalizedName } : {})
    };

    if (role) {
        updateFields.role = role;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
        { firebaseUid: uid },
        { $set: updateFields },
        { new: true }
    );

    return updatedUser;
};

router.post("/register", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await syncUserFromFirebase(req, res);

        if (!user) {
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await syncUserFromFirebase(req, res);

        if (!user) {
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await UserModel.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/admin-emails/check", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const isAdmin = await isAllowedAdminEmail(req.user.email);
        res.status(200).json({ isAdmin });
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/admin-emails", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await requireAdmin(req, res))) return;
        const emails = await getAllowedAdminEmails();
        res.status(200).json({ emails });
    } catch (error) {
        console.error("List admin emails error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/admin-emails", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await requireAdmin(req, res))) return;
        const { email } = req.body as { email?: string };
        if (!email?.trim()) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const emails = await addAllowedAdminEmail(email);
        res.status(201).json({ emails });
    } catch (error) {
        console.error("Add admin email error:", error);
        res.status(400).json({ message: (error as Error).message || "Failed to add admin email" });
    }
});

router.delete("/admin-emails/:email", verifyToken, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await requireAdmin(req, res))) return;
        const emails = await removeAllowedAdminEmail(decodeURIComponent(req.params.email));
        res.status(200).json({ emails });
    } catch (error) {
        console.error("Delete admin email error:", error);
        res.status(400).json({ message: (error as Error).message || "Failed to remove admin email" });
    }
});

export default router;
