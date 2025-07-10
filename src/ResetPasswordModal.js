import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

function ResetPasswordModal({
  auth,
  resetEmail,
  setResetEmail,
  resetMessage,
  setResetMessage,
  onClose
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetMessage("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("📧 비밀번호 재설정 이메일이 발송되었습니다.");
    } catch (error) {
      setResetMessage(`❌ 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">비밀번호 재설정</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-2">이메일 주소</label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="example@email.com"
          />
        </div>

        {resetMessage && (
          <div className="mb-4 text-sm text-red-600">{resetMessage}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            닫기
          </button>
          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '전송 중...' : '이메일 전송'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
