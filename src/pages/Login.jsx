import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../css/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const onSubmit = (data) => {
    setLoginError('');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === data.email && u.password === data.password);

    if (user) {
      localStorage.setItem('user', user.fullName);
      window.dispatchEvent(new Event('storage'));
      navigate('/dashboard');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      {/* Background Block */}
      <div className="login-header-block"></div>

      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Welcome back! Let's find your perfect pet.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {loginError && (
              <div className="error-message-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                {loginError}
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-footer">
              <Link to="/forgot-password" style={{ color: '#6b9080', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary">Log In</button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register" style={{ color: '#6b9080', fontWeight: 'bold', textDecoration: 'none' }}>Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;