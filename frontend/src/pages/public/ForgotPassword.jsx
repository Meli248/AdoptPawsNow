import { forgotPasswordSchema } from './schema/authschema.js';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import '../../css/Login.css';

const ForgotPassword = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data) => {
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage(result.message);
            } else {
                setError(result.message || 'Something went wrong.');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-header-block"></div>
            <div className="login-container">
                <div className="login-card">
                    <h1 className="login-title">Forgot Password</h1>
                    <p className="login-subtitle-text">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        {error && <div className="error-message-box">{error}</div>}
                        {message && <div className="success-message-box">{message}</div>}

                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={18} />
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                autoComplete="email"
                                {...register('email')}
                                placeholder="Enter your email"
                            />
                            {errors.email && <span className="error-text">{errors.email.message}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="auth-switch">
                            Remember your password? <Link to="/login">Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
