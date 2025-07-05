// src/components/WelcomeScreen.js
import React, { useState, useEffect } from 'react';

// 임시 성경 구절 데이터 (실제로는 API에서 가져올 수 있음)
const bibleVerses = [
    { kor: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라.", eng: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", ref: "요한복음 3:16" },
    { kor: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라.", eng: "I can do all things through him who strengthens me.", ref: "빌립보서 4:13" },
    { kor: "여호와는 나의 목자시니 내게 부족함이 없으리로다.", eng: "The Lord is my shepherd; I shall not want.", ref: "시편 23:1" },
    { kor: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도우리라 참으로 나의 의로운 오른손으로 너를 붙들리라.", eng: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", ref: "이사야 41:10" },
    { kor: "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라.", eng: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", ref: "마태복음 6:33" }
];

// SermonNote 텍스트의 빛나는 효과를 위한 스타일
const sermonNoteGlow = {
    textShadow: '0 0 8px rgba(255, 255, 0, 0.8), 0 0 15px rgba(255, 255, 0, 0.6), 0 0 20px rgba(255, 255, 0, 0.4)'
};

/**
 * WelcomeScreen 컴포넌트: 앱의 시작 화면을 렌더링하고 사용자 로그인 상태에 따라 다음 화면으로 전환합니다.
 * @param {object} props
 * @param {object|null} props.loggedInUser - 현재 로그인된 사용자 객체 (Firebase User)
 * @param {function} props.setCurrentScreen - 앱의 현재 화면을 설정하는 함수
 */
function WelcomeScreen({ loggedInUser, setCurrentScreen }) {
    const [randomVerse, setRandomVerse] = useState(null);

    // 컴포넌트 마운트 시 무작위 성경 구절을 설정하고 3초마다 업데이트
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * bibleVerses.length);
        setRandomVerse(bibleVerses[randomIndex]);

        const intervalId = setInterval(() => {
            const newRandomIndex = Math.floor(Math.random() * bibleVerses.length);
            setRandomVerse(bibleVerses[newRandomIndex]);
        }, 3000);

        // 컴포넌트 언마운트 시 인터벌 클리어
        return () => clearInterval(intervalId);
    }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때만 실행됨을 의미

    /**
     * '시작하기' 버튼 클릭 핸들러
     * 로그인 상태에 따라 'sermon-selection' 또는 'login' 화면으로 전환합니다.
     */
    const handleStartNowClick = () => {
        console.log("Get Started 버튼 클릭됨.");
        if (loggedInUser) {
            console.log("이미 로그인되어 있으므로 말씀 선택 화면으로 이동합니다.");
            setCurrentScreen('sermon-selection'); // 로그인된 사용자: 설교 선택 화면
        } else {
            console.log("로그인 화면으로 이동합니다.");
            setCurrentScreen('login'); // 로그인되지 않은 사용자: 로그인 화면
        }
    };

    return (
        <div className="w-full max-w-6xl bg-gray-800 rounded-lg shadow-xl relative flex flex-col items-center justify-between p-8 md:p-12">
            <h1
                className="text-6xl md:text-8xl font-extrabold text-yellow-300 z-10 mb-12 mt-auto"
                style={sermonNoteGlow} // 빛나는 효과 스타일 적용
            >
                SermonNote
            </h1>

            {randomVerse && ( // randomVerse 상태가 존재할 때만 렌더링
                <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl max-w-xl w-full text-center mb-12 z-10">
                    <p className="text-xl md:text-2xl font-semibold mb-4 leading-relaxed">
                        {randomVerse.kor} {/* 한국어 성경 구절 */}
                    </p>
                    <p className="text-lg md:text-xl text-gray-600 mb-6">
                        ({randomVerse.ref}) {/* 성경 구절 참조 */}
                    </p>
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-lg md:text-xl font-medium leading-relaxed">
                            {randomVerse.eng} {/* 영어 성경 구절 */}
                        </p>
                        <p className="text-base md:text-lg text-gray-500 mt-2">
                            ({randomVerse.ref}) {/* 성경 구절 참조 (영어) */}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={handleStartNowClick} // 버튼 클릭 시 화면 전환 함수 호출
                className="
                    bg-amber-400 hover:bg-amber-500
                    text-gray-900 font-bold
                    py-4 px-12
                    rounded-full
                    text-xl
                    shadow-lg
                    transform transition-transform duration-300 hover:scale-105
                    z-10 mb-auto"
            >
                시작하기
            </button>
        </div>
    );
}

export default WelcomeScreen;