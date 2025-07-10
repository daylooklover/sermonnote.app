// 한글 → 영어 책 이름 매핑
const bibleNameMap = {
  "요한복음": "John",
  "창세기": "Genesis",
  "로마서": "Romans"
  // 필요 시 추가 가능
};

// 한글 → 영어 변환 함수
function convertKoreanVerseToEnglish(input) {
  const match = input.match(/^([가-힣0-9]+)\s?(\d+):(\d+)$/);
  if (!match) return null;

  const [_, bookKo, chapter, verse] = match;
  const bookEn = bibleNameMap[bookKo];
  if (!bookEn) return null;

  return `${bookEn} ${chapter}:${verse}`;
}

// JSON 데이터 불러오기 (최초 실행 시)
let kjvJson = {};
let krvJson = {};

fetch("/kjv.json").then(res => res.json()).then(data => kjvJson = data);
fetch("/krv.json").then(res => res.json()).then(data => krvJson = data);

// 💡 검색 버튼을 눌렀을 때 실행되는 함수
function searchVerse() {
  const userInput = document.getElementById("bibleInput").value.trim();
  const key = convertKoreanVerseToEnglish(userInput);  // 👈 변환 적용

  if (key && kjvJson[key]) {
    document.getElementById("verse-en").innerText = kjvJson[key];
    document.getElementById("verse-ko").innerText = krvJson[key] || "한글 말씀 없음";
  } else {
    document.getElementById("verse-en").innerText = "❌ 성경 구절을 찾을 수 없습니다.";
    document.getElementById("verse-ko").innerText = "";
  }
}
