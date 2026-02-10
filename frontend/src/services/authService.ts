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

// Email/Password Sign Up
export const signUpWithEmail = async (
    email: string,
    password: string
): Promise<FirebaseUser> => {
    try {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const token = await userCredential.user.getIdToken();

        // Send token to your backend
        await registerUserInBackend(token, {
            email: userCredential.user.email!,
            uid: userCredential.user.uid
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
            auth,
            email,
            password
        );
        const token = await userCredential.user.getIdToken();

        // Send token to backend to verify and get user data
        await loginUserInBackend(token);

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
        const userCredential: UserCredential = await signInWithPopup(auth, provider);
        const token = await userCredential.user.getIdToken();

        // Send token to backend
        await registerUserInBackend(token, {
            email: userCredential.user.email!,
            uid: userCredential.user.uid,
            displayName: userCredential.user.displayName || undefined
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
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Helper functions to communicate with backend
const registerUserInBackend = async (
    token: string,
    userData: FirebaseUserData
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

const loginUserInBackend = async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Backend login failed');
    const data = await response.json();
    return data.user;
};