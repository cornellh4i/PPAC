import React, { useState, FormEvent } from 'react';
import { loginWithEmail, loginWithGoogle, signUpWithEmail } from '../../../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleEmailAuth = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            console.log('Success!');
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            console.error('Auth error:', error.message);
        }
    };

    const handleGoogleLogin = async (): Promise<void> => {
        setError('');

        try {
            await loginWithGoogle();
            console.log('Google login success!');
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            console.error('Google login error:', error.message);
        }
    };

    return (
        <div>
            <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <form onSubmit={handleEmailAuth}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    {isSignUp ? 'Sign Up' : 'Login'}
                </button>
            </form>

            <button onClick={handleGoogleLogin}>
                Login with Google
            </button>

            <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
        </div>
    );
};

export default Login;