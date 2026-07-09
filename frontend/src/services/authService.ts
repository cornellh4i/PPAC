import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User as FirebaseUser,
    UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { User, FirebaseUserData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function requireAuth() {
    if (!auth) {
        throw new Error(
            'Firebase is not configured. Add REACT_APP_FIREBASE_* keys to frontend/.env.local (see team docs or Firebase console).'
        );
    }
    return auth;
}

// Email/Password Sign Up
export const signUpWithEmail = async (
    email: string,
    password: string
): Promise<FirebaseUser> => {
    try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
            requireAuth(),
            email,
            password
        );
        const token = await userCredential.user.getIdToken();

        await syncUserInBackend(token, {
            name: userCredential.user.displayName || undefined
        });

        return userCredential.user;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
};

// Email/Password Login
export const loginWithEmail = async (
    email: string,
    password: string
): Promise<FirebaseUser> => {
    try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
            requireAuth(),
            email,
            password
        );
        const token = await userCredential.user.getIdToken();

        await syncUserInBackend(token, {
            name: userCredential.user.displayName || undefined
        });

        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Google Login
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential: UserCredential = await signInWithPopup(requireAuth(), provider);
        const token = await userCredential.user.getIdToken();

        await syncUserInBackend(token, {
            name: userCredential.user.displayName || undefined
        });

        return userCredential.user;
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
};

// Logout
export const logout = async (): Promise<void> => {
    try {
        await signOut(requireAuth());
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Helper functions to communicate with backend
export const syncUserInBackend = async (
    token: string,
    userData: FirebaseUserData = {}
): Promise<User> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Backend registration failed');
    const data = await response.json();
    return data.user;
};
