import React from 'react';

function SermonSelectionScreen({
  loggedInUser,
  userEmail,
  userId,
  auth,
  firestore,
  setCurrentScreen,
  setShowFeedbackModal,
  setShowNotificationSettingsModal
}) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("로그아웃되었습니다.");
      setCurrentScreen('welcome');
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <h2 className="text-2xl font-bold text-yellow-300">✝️ 설교 유형 선택</h2>
      <p className="text-sm text-gray-400">환영합니다, {userEmail}</p>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setCurrentScreen('sermon-creation')}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow transition"
        >
          📖 강해 설교 작성
        </button>
        <button
          onClick={() => alert('예화 설교 기능은 준비 중입니다.')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow transition"
        >
          🧾 예화 설교 작성 (준비 중)
        </button>
        <button
          onClick={() => setShowNotificationSettingsModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow transition"
        >
          🔔 알림 설정
        </button>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl shadow transition"
        >
          ✉️ 피드백 보내기
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow transition"
        >
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
}

export default SermonSelectionScreen;
