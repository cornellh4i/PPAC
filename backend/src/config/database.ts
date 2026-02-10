import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
    try {
        const MONGO_URI = process.env.NODE_ENV == "dev"
            ? process.env.DEV_URI
            : process.env.PROD_URI;

        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }

        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};