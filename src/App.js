import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import SermonSelectionScreen from './components/SermonSelectionScreen';
import SermonCreationScreen from './components/SermonCreationScreen';
import FeedbackModal from './components/modals/FeedbackModal';
import ResetPasswordModal from './components/modals/ResetPasswordModal';
import NotificationSettingsModal from './components/modals/NotificationSettingsModal';

// Firebase 관련 import는 index.js에서 App 컴포넌트로 props로 전달된다고 가정
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 

// 커스텀 메시지 유틸리티는 별도 파일로 분리
import { showCustomMessage } from './utils/modalUtils'; 

function App({ auth, firestore, firebaseApp }) {
    const [currentScreen, setCurrentScreen] = useState('loading');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [isAuthReady, setIsAuthReady] = useState(false);

    // 모달 관련 상태
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);
    const [notificationDays, setNotificationDays] = useState([]);
    const [notificationTime, setNotificationTime] = useState('09:00');
    const [notificationPhoneNumber, setNotificationPhoneNumber] = useState('');

    // Firebase 인증 상태 리스너 (기존과 동일)
    useEffect(() => {
        if (!auth) {
            console.warn("Firebase Auth 서비스가 유효하지 않습니다.");
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoggedInUser(user);
                setUserEmail(user.email || '익명 사용자');
                setUserId(user.uid);
                console.log("사용자 로그인됨:", user.uid);
                // 로그인 후 메모 로드는 MemoManager 컴포넌트에서 담당
                setCurrentScreen('welcome'); 
            } else {
                setLoggedInUser(null);
                setUserEmail('');
                setUserId(crypto.randomUUID());
                console.log("사용자 로그아웃됨 또는 익명 사용자");
                setCurrentScreen('welcome');
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, [auth]);

    // 각 화면에 필요한 props를 전달하고 조건부 렌더링
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-inter relative overflow-hidden">
            {currentScreen === 'loading' && (
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-yellow-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg text-yellow-300">Firebase 인증 확인 중...</p>
                </div>
            )}

            {currentScreen === 'welcome' && isAuthReady && (
                <WelcomeScreen
                    loggedInUser={loggedInUser}
                    setCurrentScreen={setCurrentScreen}
                />
            )}

            {(currentScreen === 'login' || currentScreen === 'signup') && isAuthReady && (
                <AuthScreen
                    auth={auth}
                    currentScreen={currentScreen}
                    setCurrentScreen={setCurrentScreen}
                    setShowResetPasswordModal={setShowResetPasswordModal}
                />
            )}

            {currentScreen === 'sermon-selection' && isAuthReady && loggedInUser && (
                <SermonSelectionScreen
                    loggedInUser={loggedInUser}
                    userEmail={userEmail}
                    userId={userId}
                    auth={auth}
                    firestore={firestore}
                    setCurrentScreen={setCurrentScreen}
                    setShowFeedbackModal={setShowFeedbackModal}
                    setShowNotificationSettingsModal={setShowNotificationSettingsModal}
                />
            )}

            {currentScreen === 'sermon-creation' && isAuthReady && loggedInUser && (
                <SermonCreationScreen
                    userId={userId}
                    firestore={firestore}
                    setCurrentScreen={setCurrentScreen}
                />
            )}

            {/* Modals */}
            {showFeedbackModal && (
                <FeedbackModal
                    userId={userId}
                    userEmail={userEmail}
                    firestore={firestore}
                    feedbackMessage={feedbackMessage}
                    setFeedbackMessage={setFeedbackMessage}
                    onClose={() => setShowFeedbackModal(false)}
                />
            )}

            {showResetPasswordModal && (
                <ResetPasswordModal
                    auth={auth}
                    resetEmail={resetEmail}
                    setResetEmail={setResetEmail}
                    resetMessage={resetMessage}
                    setResetMessage={setResetMessage}
                    onClose={() => setShowResetPasswordModal(false)}
                />
            )}

            {showNotificationSettingsModal && (
                <NotificationSettingsModal
                    notificationDays={notificationDays}
                    setNotificationDays={setNotificationDays}
                    notificationTime={notificationTime}
                    setNotificationTime={setNotificationTime}
                    notificationPhoneNumber={notificationPhoneNumber}
                    setNotificationPhoneNumber={setNotificationPhoneNumber}
                    onClose={() => setShowNotificationSettingsModal(false)}
                />
            )}
        </div>
    );
}

export default App;