import { loginSchema } from './schema/authschema.js';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import '../../css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store authentication data in localStorage
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('user', result.data.user.username);
        localStorage.setItem('user_role', result.data.user.role); // Store user role
        localStorage.setItem('user_id', result.data.user.user_id); // Store user ID

        // Notify other components (like Navbar) about the login
        window.dispatchEvent(new Event('storage'));

        // Redirect based on role
        if (result.data.user.role === 'admin' || result.data.user.email === 'admin@gmail.com') {
          console.log('Redirecting to Admin Dashboard');
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header-block"></div>
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {loginError && <div className="error-message-box">{loginError}</div>}

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                {...register('email')}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  {...register('password')}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;