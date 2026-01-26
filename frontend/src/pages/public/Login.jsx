import { loginSchema } from './schema/authschema.js'; 
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
        // FIXED: Using localStorage instead of sessionStorage
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('user', result.data.user.username);
        
        window.dispatchEvent(new Event('storage')); // Notify Navbar
        navigate('/dashboard');
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
              <label className="form-label">Email</label>
              <input type="email" className="form-input" {...register('email')} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type={showPassword ? 'text' : 'password'} className="form-input" {...register('password')} />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            <p className="auth-switch">Don't have an account? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;