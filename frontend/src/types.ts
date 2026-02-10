// Firebase user (what you get from auth)
export interface FirebaseUserData {
    uid: string;
    email: string;
    displayName?: string;
}

// MongoDB user (what's in your database)
export interface User {
    _id: string;
    firebaseUid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    // Your custom fields
    role?: 'admin' | 'user';
    preferences?: object;
}