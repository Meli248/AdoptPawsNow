import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import '../../css/Register.css';
import { registerSchema } from './schema/authschema.js'; 

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRegError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate('/login');
      } else {
        setRegError(result.message || 'Registration failed');
      }
    } catch (error) {
      setRegError('Server connection failed. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-header-block"></div>
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Create Account</h1>
          {regError && <div className="error-message-box" style={{color: 'red'}}>{regError}</div>}
          
          <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                Full Name
              </label>
              <input 
                type="text" 
                className={`form-input ${errors.fullName ? 'error' : ''}`} 
                autoComplete="name"
                {...register('fullName')} 
                placeholder="Enter your full name"
              />
              {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input 
                type="email" 
                className={`form-input ${errors.email ? 'error' : ''}`} 
                autoComplete="email"
                {...register('email')} 
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
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
                  autoComplete="new-password"
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
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className="form-input"
                  autoComplete="new-password"
                  {...register('confirmPassword')} 
                  placeholder="Confirm your password"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
            <p className="auth-switch">Already have an account? <Link to="/login">Log In</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;