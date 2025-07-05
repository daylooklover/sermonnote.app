// src/utils/modalUtils.js

/**
 * 커스텀 메시지 모달을 표시하는 함수 (React 외부에서 DOM 조작)
 * @param {string} message - 모달에 표시할 메시지 내용
 * @param {string} [title="알림"] - 모달의 제목 (기본값: "알림")
 * @param {boolean} [longContent=false] - 메시지 내용이 길어서 스크롤이 필요하면 true로 설정
 * @param {function} [callback=() => {}] - "확인" 버튼 클릭 후 실행될 콜백 함수
 */
export const showCustomMessage = (message, title = "알림", longContent = false, callback = () => {}) => {
    // 기존에 열려 있는 커스텀 모달이 있다면 제거 (중복 방지)
    const existingModal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-75.flex.items-center.justify-center.z-50');
    if (existingModal) {
        existingModal.remove();
    }

    const customModal = document.createElement('div');
    customModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    customModal.innerHTML = `
        <div class="bg-white text-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full relative text-center flex flex-col">
            <h3 class="text-2xl font-bold mb-4 text-blue-700">${title}</h3>
            <p class="text-lg mb-6 ${longContent ? 'max-h-64 overflow-y-auto custom-scrollbar p-2 rounded-md bg-gray-100' : ''}">${message}</p>
            <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md" onclick="this.closest('.fixed').remove(); window.customModalCallback && window.customModalCallback();">확인</button>
        </div>
    `;
    document.body.appendChild(customModal);
    // 콜백 함수를 전역 window 객체에 저장하여 모달 버튼 클릭 시 호출
    window.customModalCallback = callback;
};