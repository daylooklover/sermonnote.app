import React from 'react';

function NotificationSettingsModal({
  notificationDays,
  setNotificationDays,
  notificationTime,
  setNotificationTime,
  notificationPhoneNumber,
  setNotificationPhoneNumber,
  onClose
}) {
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDay = (day) => {
    if (notificationDays.includes(day)) {
      setNotificationDays(notificationDays.filter(d => d !== day));
    } else {
      setNotificationDays([...notificationDays, day]);
    }
  };

  const handleSave = () => {
    console.log('📅 알림 요일:', notificationDays);
    console.log('⏰ 알림 시간:', notificationTime);
    console.log('📱 전화번호:', notificationPhoneNumber);
    onClose(); // 실제 앱에서는 저장 로직 추가
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl text-gray-900">
        <h2 className="text-xl font-bold mb-4 text-center">알림 설정</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-2">요일 선택</label>
          <div className="flex flex-wrap gap-2">
            {weekdays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1 rounded-full border ${
                  notificationDays.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">알림 시간</label>
          <input
            type="time"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">전화번호 (선택)</label>
          <input
            type="text"
            placeholder="010-1234-5678"
            value={notificationPhoneNumber}
            onChange={(e) => setNotificationPhoneNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettingsModal;
