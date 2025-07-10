import React, { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

function SermonCreationScreen({ userId, firestore, setCurrentScreen }) {
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSaveSermon = async () => {
    if (!title || !scripture || !content) {
      setStatusMessage('모든 항목을 입력해 주세요.');
      return;
    }

    const sermonId = Date.now().toString(); // 간단한 고유 ID
    const sermonData = {
      userId,
      title,
      scripture,
      content,
      createdAt: Timestamp.now()
    };

    try {
      await setDoc(doc(firestore, 'sermons', sermonId), sermonData);
      setStatusMessage('✅ 설교가 저장되었습니다.');
    } catch (error) {
      console.error('설교 저장 실패:', error);
      setStatusMessage('❌ 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-white space-y-6 p-6 bg-gray-800 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-yellow-300">📖 설교 작성</h2>

      <input
        type="text"
        placeholder="설교 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
      />

      <input
        type="text"
        placeholder="성경 본문 (예: 마태복음 5:1-12)"
        value={scripture}
        onChange={(e) => setScripture(e.target.value)}
        className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
      />

      <textarea
        placeholder="설교 본문을 입력하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white resize-none"
      />

      {statusMessage && (
        <div className="text-sm text-center text-yellow-400">{statusMessage}</div>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={handleSaveSermon}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl"
        >
          💾 저장하기
        </button>
        <button
          onClick={() => setCurrentScreen('sermon-selection')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-xl"
        >
          🔙 돌아가기
        </button>
      </div>
    </div>
  );
}

export default SermonCreationScreen;
