// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // 나머지 설정도 넣으세요
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
