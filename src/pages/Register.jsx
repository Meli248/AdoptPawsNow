import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../css/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

  const onSubmit = (data) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
      fullName: data.fullName,
      email: data.email,
      password: data.password
    });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', data.fullName);
    
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
  };

  return (
    <div className="register-page">
      {/* Matching the Login Green Block */}
      <div className="register-header-block"></div>

      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join us and help pets find their forever homes.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            
            {/* Full Name Field */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                </svg>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
            </div>

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
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email.message}</span>}
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
                  placeholder="Create a password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn-primary">Sign Up</button>

            <p className="auth-switch">
              Already have an account? <Link to="/login" style={{ color: '#6b9080', fontWeight: 'bold', textDecoration: 'none' }}>Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
