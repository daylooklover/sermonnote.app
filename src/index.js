import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18+ 버전
import './App.css'; // 필요하다면
import App from './App'; // App 컴포넌트 임포트


// Firebase SDK v9+ 모듈식 임포트
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 (환경 변수 사용)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 초기화 (중복 초기화 방지)
let firebaseApp;
let authService = null;
let firestoreService = null;

try {
    if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig);
        console.log('Firebase 앱 초기화 완료.');
    } else {
        firebaseApp = getApp();
        console.log('Firebase 앱이 이미 초기화되어 있습니다.');
    }

    if (firebaseApp) {
        authService = getAuth(firebaseApp);
        firestoreService = getFirestore(firebaseApp);
    }

} catch (error) {
    console.error("Firebase 초기화 중 심각한 오류 발생:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `<p style="color: red; text-align: center; font-size: 1.2rem;">앱 로드 중 오류 발생: ${error.message}. 개발자 콘솔을 확인해주세요.</p>`;
    }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App auth={authService} firestore={firestoreService} firebaseApp={firebaseApp} />
        </React.StrictMode>
    );
} else {
    console.error('ID가 "root"인 요소를 찾을 수 없어 React 앱을 마운트할 수 없습니다.');
}

// 성능 측정 (선택 사항) - reportWebVitals() 호출 제거됨
// reportWebVitals();
