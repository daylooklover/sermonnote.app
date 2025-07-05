// src/utils/aiUtils.js
import { showCustomMessage } from './modalUtils';
import { BASE_API_URL } from '../config/apiConfig'; // BASE_API_URL 임포트

/**
 * AI 모델을 호출하여 응답을 받는 유틸리티 함수
 * 이 함수는 Firebase Cloud Function의 엔드포인트를 호출하거나,
 * 직접 Generative Language API를 호출할 수 있도록 설계되었습니다.
 * @param {string} prompt - AI에 전달할 사용자 프롬프트
 * @param {string} [systemPrompt] - AI에 역할을 부여하는 시스템 프롬프트 (선택 사항)
 * @param {string} [model='gemini-2.0-flash'] - 사용할 AI 모델 이름
 * @returns {Promise<string|null>} AI 응답 텍스트 또는 오류 발생 시 null
 */
export const callAI = async (prompt, systemPrompt, model = 'gemini-2.0-flash') => {
    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "text/plain" }
        };
        if (systemPrompt) {
            payload.contents.unshift({ role: "system", parts: [{ text: systemPrompt }] });
        }

        // Canvas 환경에서 자동 제공되거나, Cloud Function을 통해 안전하게 관리될 것으로 예상
        const apiKey = ""; // 중요: 프로덕션 환경에서는 이 방식이 안전하지 않을 수 있습니다.

        // 당신의 Cloud Function URL을 사용합니다.
        // 만약 직접 Google Generative Language API를 호출하려면 apiUrl을 다르게 설정해야 합니다.
        // 예를 들어, `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const apiUrl = `${BASE_API_URL}/api/ai-process`; // 당신의 Cloud Function 엔드포인트

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                systemPrompt: systemPrompt,
                model: model // Cloud Function에서 모델을 동적으로 받아 처리한다면
            })
        });

        const result = await response.json();

        // Cloud Function의 응답 형식에 따라 파싱 로직 조정 필요
        // 현재는 Cloud Function이 AI 응답을 `content` 필드에 담아 반환한다고 가정
        if (response.ok && result.content) {
            return result.content;
        } else {
            console.error("AI 응답 형식이 예상과 다릅니다 또는 오류 응답:", result);
            showCustomMessage(`AI 응답 실패: ${result.error || result.details || '알 수 없는 오류'}`, "AI 오류");
            return null;
        }
    } catch (error) {
        console.error("AI 호출 중 네트워크 오류:", error);
        showCustomMessage(`AI 호출 중 네트워크 오류 발생: ${error.message}`, "AI 오류");
        return null;
    }
};