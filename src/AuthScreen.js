import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function AuthScreen({ auth, currentScreen, setCurrentScreen, setShowResetPasswordModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const isLogin = currentScreen === 'login';

  const handleAuth = async () => {
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      setAuthError(error.message);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white text-gray-900 rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? '로그인' : '회원가입'}
      </h2>

      <input
        type="email"
        className="w-full p-3 mb-4 border border-gray-300 rounded"
        placeholder="이메일 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-3 mb-4 border border-gray-300 rounded"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {authError && (
        <p className="text-red-500 text-sm mb-4 text-center">{authError}</p>
      )}

      <button
        onClick={handleAuth}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
      >
        {isLogin ? '로그인' : '회원가입'}
      </button>

      <div className="text-center mt-4 text-sm">
        {isLogin ? (
          <>
            <p>
              계정이 없으신가요?{' '}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setCurrentScreen('signup')}
              >
                회원가입
              </button>
            </p>
            <button
              className="mt-2 text-gray-600 hover:underline text-sm"
              onClick={() => setShowResetPasswordModal(true)}
            >
              🔒 비밀번호를 잊으셨나요?
            </button>
          </>
        ) : (
          <p>
            이미 계정이 있으신가요?{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setCurrentScreen('login')}
            >
              로그인
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthScreen;
