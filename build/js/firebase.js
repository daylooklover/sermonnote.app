// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // 필요한 나머지 설정 추가
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
