import React, { useState, useEffect, useRef } from "react";
import { db } from './firebase';

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const AI_FUNCTION_URL = "https://us-central1-sermonnote-live.cloudfunctions.net/ai";


function App() {
  const [quickMemos, setQuickMemos] = useState([]);
  const [sermonText, setSermonText] = useState("");
  const [result, setResult] = useState("💡 AI 결과가 여기에 표시됩니다...");
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);

  const quickMemoInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const userId = "anonymous_user"; // 임시

  // 퀵메모 최대 5개
  const MAX_QUICKMEMO = 5;

  // 퀵메모 불러오기
  async function loadQuickMemos() {
    const q = query(
      collection(db, "quickmemos"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(MAX_QUICKMEMO)
    );
    const querySnapshot = await getDocs(q);
    const memos = [];
    querySnapshot.forEach((doc) => memos.push({ id: doc.id, ...doc.data() }));
    setQuickMemos(memos);
  }

  useEffect(() => {
    loadQuickMemos();
  }, []);

  // 퀵메모 추가
  async function addQuickMemo() {
    const text = quickMemoInputRef.current.value.trim();
    if (!text) {
      alert("퀵메모 내용을 입력하세요.");
      return;
    }
    if (quickMemos.length >= MAX_QUICKMEMO) {
      alert(`퀵메모는 최대 ${MAX_QUICKMEMO}개까지 저장할 수 있습니다.`);
      return;
    }
    await addDoc(collection(db, "quickmemos"), {
      userId,
      text,
      createdAt: serverTimestamp(),
    });
    quickMemoInputRef.current.value = "";
    loadQuickMemos();
  }

  // 퀵메모 삭제
  async function deleteQuickMemo(id) {
    if (window.confirm("퀵메모를 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "quickmemos", id));
      loadQuickMemos();
    }
  }

  // 퀵메모 텍스트 삽입
  function insertMemo(text) {
    setSermonText((prev) => (prev ? prev + "\n" + text : text));
  }

  // AI 호출 공통 함수
  async function callAI(type, text) {
    setLoading(true);
    setResult("⏳ AI 처리 중입니다...");
    try {
      const res = await fetch(AI_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text }),
      });
      if (!res.ok) throw new Error("AI 서버 오류");
      const data = await res.json();
      if (data?.result) setResult(data.result);
      else setResult("⚠️ AI 결과가 없습니다.");
    } catch (e) {
      setResult("❌ AI 호출 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // AI 버튼 이벤트들
  const generateOutline = () => {
    if (!sermonText.trim()) {
      alert("설교문을 입력하세요.");
      return;
    }
    callAI("outline", sermonText.trim());
  };

  const recommendBible = () => {
    callAI("bible_recommend", "");
  };

  const generateIllustrations = () => {
    if (!sermonText.trim()) {
      alert("설교문을 입력하세요.");
      return;
    }
    callAI("illustrations", sermonText.trim());
  };

  // 음성 인식 시작/중지
  function setupSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return null;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = "ko-KR";
    recog.interimResults = true;
    recog.continuous = true;

    recog.onstart = () => setRecognizing(true);
    recog.onend = () => setRecognizing(false);

    recog.onerror = (e) => {
      alert("음성 인식 오류: " + e.error);
      setRecognizing(false);
    };

    recog.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setSermonText((prev) => (prev ? prev + "\n" + finalTranscript : finalTranscript));
      }
    };

    return recog;
  }

  function toggleVoice() {
    if (!recognitionRef.current) recognitionRef.current = setupSpeechRecognition();
    if (!recognitionRef.current) return;
    if (recognizing) recognitionRef.current.stop();
    else recognitionRef.current.start();
  }

  // 설교 저장 (Firestore)
  async function saveSermon() {
    if (!sermonText.trim()) {
      alert("설교문이 비어 있습니다.");
      return;
    }
    const title = sermonText.trim().split("\n")[0].slice(0, 30);

    const q = query(
      collection(db, "sermons"),
      where("userId", "==", userId),
      where("title", "==", title),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(collection(db, "sermons"), {
        userId,
        title,
        content: sermonText,
        updatedAt: serverTimestamp(),
      });
    } else {
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "sermons", docId), {
        content: sermonText,
        updatedAt: serverTimestamp(),
      });
    }
    alert("설교문이 저장되었습니다.");
  }

  const clearText = () => {
    if (window.confirm("설교문 내용을 초기화 하시겠습니까?")) setSermonText("");
  };

  const printSermon = () => {
    if (!sermonText.trim()) {
      alert("인쇄할 설교문이 없습니다.");
      return;
    }
    const newWindow = window.open("", "_blank");
    newWindow.document.write(
      `<pre style="font-family: Nanum Gothic, sans-serif; font-size:16px;">${sermonText
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`
    );
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Nanum Gothic', sans-serif",
        background: "linear-gradient(135deg, #0a0f1a, #16213e)",
        color: "#f0f0f0",
      }}
    >
      <div
        style={{
          width: 320,
          background: "#1e2749",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 15px 15px 0",
          boxShadow: "4px 0 15px rgba(0,0,0,0.7)",
        }}
        aria-label="퀵메모 목록"
      >
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#ffd54f" }}>📝 퀵메모</h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            ref={quickMemoInputRef}
            placeholder="새 퀵메모 입력 (최대 50자)"
            maxLength={50}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 10,
              border: "none",
              fontSize: 14,
              outline: "none",
              backgroundColor: "#28315f",
              color: "#fffde7",
            }}
          />
          <button
            onClick={addQuickMemo}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: "#ffd54f",
              color: "#222",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              userSelect: "none",
            }}
            aria-label="퀵메모 저장"
          >
            저장
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            userSelect: "text",
          }}
          role="list"
          aria-label="퀵메모 리스트"
        >
          {quickMemos.length === 0 && (
            <p style={{ color: "#ddd", textAlign: "center" }}>저장된 퀵메모가 없습니다.</p>
          )}
          {quickMemos.map((memo) => (
            <div
              key={memo.id}
              tabIndex={0}
              role="listitem"
              title={memo.text}
              style={{
                backgroundColor: "#2c3a72",
                marginBottom: 14,
                padding: 14,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1.4,
                boxShadow: "0 3px 5px rgba(0,0,0,0.25)",
                position: "relative",
              }}
              onClick={() => insertMemo(memo.text)}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") insertMemo(memo.text);
              }}
            >
              {memo.text}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuickMemo(memo.id);
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 8,
                  background: "transparent",
                  border: "none",
                  color: "#ffb300cc",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 18,
                  userSelect: "none",
                }}
                title="퀵메모 삭제"
                aria-label="퀵메모 삭제"
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            userSelect: "none",
          }}
          role="group"
          aria-label="설교문 작업 버튼들"
        >
          <button
            onClick={generateOutline}
            style={buttonStyle}
            aria-label="설교 개요 생성"
            disabled={loading}
          >
            ✍ 설교 개요 생성
          </button>
          <button
            onClick={recommendBible}
            style={buttonStyle}
            aria-label="성경 구절 추천"
            disabled={loading}
          >
            📖 성경구절 추천
          </button>
          <button
            onClick={toggleVoice}
            style={buttonStyle}
            aria-label="음성 인식 시작/중지"
            disabled={loading}
          >
            🎤 음성으로 주제 말하기 {recognizing ? "(중지)" : "(시작)"}
          </button>
          <button
            onClick={generateIllustrations}
            style={buttonStyle}
            aria-label="AI 추천 예화 2개 생성"
            disabled={loading}
          >
            💡 AI 추천 예화
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #21294b, #1b225e)",
          boxShadow: "inset 0 0 20px #000000cc",
          borderRadius: "15px 0 0 15px",
          userSelect: "text",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            marginBottom: 30,
            color: "#ffee58",
            textAlign: "center",
            letterSpacing: 1.5,
            textShadow: "2px 2px 4px #000000aa",
            userSelect: "none",
          }}
        >
          📖 설교문 작성
        </h1>
        <textarea
          value={sermonText}
          onChange={(e) => setSermonText(e.target.value)}
          placeholder="설교문을 작성하거나 퀵메모를 삽입할 수 있습니다."
          aria-label="설교문 작성 영역"
          style={{
            flex: 1,
            padding: 25,
            fontSize: 18,
            borderRadius: 15,
            backgroundColor: "#12182f",
            color: "#e0e0e0",
            border: "none",
            resize: "vertical",
            boxShadow: "inset 0 0 15px #3f51b5cc",
            lineHeight: 1.6,
            fontWeight: 400,
            fontFamily: "'Nanum Gothic', sans-serif",
            outlineOffset: 2,
            outlineColor: "#7986cb",
            transition: "box-shadow 0.3s ease",
            userSelect: "text",
          }}
        />
        <div
          id="resultBox"
          aria-live="polite"
          aria-atomic="true"
          style={{
            marginTop: 30,
            padding: 22,
            backgroundColor: "#17294d",
            borderRadius: 20,
            minHeight: 140,
            fontSize: 17,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            color: "#fffde7",
            boxShadow: "0 0 18px #ffa726cc",
            userSelect: "text",
            overflowY: "auto",
            maxHeight: 200,
          }}
        >
          {result}
        </div>
      </div>
    </div>
  );
}

// 버튼 스타일 상수
const buttonStyle = {
  padding: "12px 20px",
  borderRadius: 30,
  fontWeight: 700,
  cursor: "pointer",
  background: "linear-gradient(135deg, #ffca28, #fdd835)",
  color: "#222",
  fontSize: 16,
  boxShadow: "0 5px 15px rgba(255, 202, 40, 0.6)",
  border: "none",
  userSelect: "none",
};

export default App;
