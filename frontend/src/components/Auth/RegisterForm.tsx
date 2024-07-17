import React, { useState } from 'react';
import { register } from '../../services/api';
import axios from 'axios';

// エラーの型定義
interface ValidationError {
  field: string;
  message: string;
}

interface ApiError {
  errors?: ValidationError[];
  message?: string;
}

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    if (!email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await register(username, email, password);
      alert('Registration successful!');
      // リダイレクトやログイン状態の更新をここで行う
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        if (apiError.errors) {
          const serverErrors: {[key: string]: string} = {};
          apiError.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(serverErrors);
        } else if (apiError.message) {
          setErrors({ general: apiError.message });
        } else {
          setErrors({ general: 'An unexpected error occurred. Please try again.' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="At least 3 characters"
        />
        {errors.username && <p className="error">{errors.username}</p>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Valid email address"
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>
      {errors.general && <p className="error">{errors.general}</p>}
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;