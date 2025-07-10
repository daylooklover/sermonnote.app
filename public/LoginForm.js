// src/LoginForm.js
import React, { useState } from 'react';
import { loginWithEmail } from './authService';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await loginWithEmail(email, password);
      alert(`✅ 로그인 성공! 환영합니다 ${user.email}`);
      // TODO: 페이지 이동 등
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-form">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">로그인</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
