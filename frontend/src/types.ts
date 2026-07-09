// Firebase user (what you get from auth)
export interface FirebaseUserData {
    name?: string;
    role?: 'student' | 'practitioner' | 'admin';
}

// MongoDB user (what's in your database)
export interface User {
    _id: string;
    firebaseUid: string;
    email: string;
    name?: string;
    createdAt: Date;
    // Your custom fields
    role?: 'student' | 'practitioner' | 'admin';
    preferences?: object;
}
