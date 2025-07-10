import React from 'react';

function WelcomeScreen({ loggedInUser, setCurrentScreen }) {
  const userName = loggedInUser?.email?.split('@')[0] || '사역자님';

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-yellow-300">🙏 환영합니다, {userName}!</h1>
      <p className="text-lg text-gray-300">오늘도 하나님의 말씀을 준비해보세요.</p>

      <div className="space-y-4">
        <button
          onClick={() => setCurrentScreen('sermon-selection')}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition"
        >
          ✍ 설교 작성 시작하기
        </button>

        <button
          onClick={() => alert('곧 지원될 기능입니다!')}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-xl transition"
        >
          📄 기존 설교 목록 보기
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
