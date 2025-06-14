const verses = [
  ["내가 너를 고아와 같이 버려두지 아니하고 너희에게로 오리라", "I will not leave you as orphans; I will come to you. (John 14:18)"],
  ["두려워하지 말라 내가 너와 함께 함이라", "Do not fear, for I am with you. (Isaiah 41:10)"],
  ["주께서 너를 항상 인도하시리니", "The Lord will guide you always. (Isaiah 58:11)"],
  ["너희는 세상의 빛이라", "You are the light of the world. (Matthew 5:14)"],
  ["내 은혜가 네게 족하도다", "My grace is sufficient for you. (2 Corinthians 12:9)"],
  ["여호와는 나의 목자시니 내게 부족함이 없으리로다", "The Lord is my shepherd; I shall not want. (Psalm 23:1)"],
  ["너희는 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라", "Do not let your hearts be troubled. Trust in God; trust also in me. (John 14:1)"],
  ["하나님은 사랑이시라", "God is love. (1 John 4:8)"],
  ["모든 지킬 만한 것 중에 더욱 네 마음을 지키라", "Above all else, guard your heart, for everything you do flows from it. (Proverbs 4:23)"],
  ["주는 나의 반석이시요 요새시니 내 구원의 하나님이시라", "The Lord is my rock, my fortress and my deliverer. (Psalm 18:2)"],
  ["주의 인자하심이 생명보다 나으므로 내 입술이 주를 찬양하리이다", "Because your love is better than life, my lips will glorify you. (Psalm 63:3)"],
  ["하나님께서 세상을 이처럼 사랑하사 독생자를 주셨으니", "For God so loved the world that he gave his one and only Son. (John 3:16)"],
  ["너희는 마음을 다하고 뜻을 다하여 주 너희 하나님을 사랑하라", "Love the Lord your God with all your heart and with all your soul and with all your strength. (Deuteronomy 6:5)"],
  ["내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까", "I lift up my eyes to the mountains—where does my help come from? (Psalm 121:1)"],
  ["주께서 네 길을 지도하시며 네가 행할 길을 지도하시리라", "He will guide your paths. (Proverbs 3:6)"],
  ["내가 약할 그 때에 강함이라", "For when I am weak, then I am strong. (2 Corinthians 12:10)"],
  ["내 영혼아 여호와를 송축하라", "Praise the Lord, my soul. (Psalm 103:1)"],
  ["너희는 세상의 소금이니", "You are the salt of the earth. (Matthew 5:13)"],
  ["주의 말씀은 내 발에 등이요 내 길에 빛이니이다", "Your word is a lamp to my feet and a light to my path. (Psalm 119:105)"]
];

function showRandomVerse() {
  const verseBox = document.getElementById('verseBox');
  const randomIndex = Math.floor(Math.random() * verses.length);
  const [kor, eng] = verses[randomIndex];
  verseBox.innerHTML = `<b>${kor}</b><br><span>${eng}</span>`;
}

showRandomVerse();
setInterval(showRandomVerse, 2000);

document.getElementById('startBtn').addEventListener('click', () => {
  location.href = 'auth/login.html'; // 로그인 페이지 경로
});

document.getElementById('quickMemoBtn').addEventListener('click', () => {
  location.href = 'quickmemo.html'; // 퀵메모 페이지 경로
});
