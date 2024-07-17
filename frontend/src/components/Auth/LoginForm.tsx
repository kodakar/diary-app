import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      authLogin(response.token);
      // ログイン成功後の処理（例：ダッシュボードへのリダイレクト）
    } catch (error) {
      console.error('Login failed:', error);
      // エラーメッセージの表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;