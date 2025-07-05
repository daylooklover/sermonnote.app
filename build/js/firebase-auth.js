import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "...",
  // 이하 생략
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("signupBtn").onclick = async function() {
  const email = document.getElementById("signupEmail").value;
  const pw = document.getElementById("signupPassword").value;
  try {
    await createUserWithEmailAndPassword(auth, email, pw);
    alert("회원가입 완료!");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
};
