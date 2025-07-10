📦 sermonnote AI Firebase Functions 배포 안내

1. Firebase 콘솔 열기: https://console.firebase.google.com/project/_/functions/list
2. 좌측 Functions 메뉴 클릭 → "코드 업로드" 또는 "ZIP 업로드" 선택
3. 이 ZIP 파일을 업로드
4. AI 기능 URL 예시: https://us-central1-<your-project-id>.cloudfunctions.net/ai

index.js에서 사용하는 OpenAI API 키는 Firebase 환경 변수에 다음과 같이 설정해야 함:
firebase functions:config:set openai.key="sk-xxxxxxxxxx"

배포 후 프론트엔드에서 /ai 주소로 fetch POST 요청을 보내면 AI 응답을 받을 수 있습니다.