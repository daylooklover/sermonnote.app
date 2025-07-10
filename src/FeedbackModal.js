import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function FeedbackModal({
  userId,
  userEmail,
  firestore,
  feedbackMessage,
  setFeedbackMessage,
  onClose,
}) {
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackMessage.trim()) {
      setStatusMessage('❗ 피드백 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'feedbacks'), {
        userId,
        userEmail,
        message: feedbackMessage,
        createdAt: Timestamp.now(),
      });
      setStatusMessage('✅ 피드백이 성공적으로 전송되었습니다.');
      setFeedbackMessage('');
    } catch (error) {
      setStatusMessage(`❌ 오류: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md text-gray-900">
        <h2 className="text-xl font-bold mb-4 text-center">피드백 보내기</h2>

        <textarea
          rows={5}
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.target.value)}
          placeholder="불편했던 점이나 제안하고 싶은 내용을 적어주세요."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          {isSubmitting ? '전송 중...' : '제출하기'}
        </button>

        {statusMessage && (
          <p className="mt-3 text-center text-sm text-blue-700">{statusMessage}</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-600 hover:underline block mx-auto"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default FeedbackModal;
