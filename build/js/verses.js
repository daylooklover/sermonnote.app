<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>랜덤 성경 구절</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      background-color: #111;
      color: #fff;
      font-family: 'Nanum Gothic', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    #verse {
      font-size: 1.5rem;
      padding: 20px;
      border-radius: 10px;
      background-color: #222;
      box-shadow: 0 0 15px #ffeb3baa;
      max-width: 600px;
      line-height: 1.5;
      min-height: 100px;
    }
    #verse span {
      font-size: 0.95em;
      color: #ccc;
    }
  </style>
</head>
<body>
  <div id="verse"></div>

  <script>
    const verses = [
      ["내가 너와 함께 하리라 - 이사야 41:10", "I am with you - Isaiah 41:10"],
      ["주께서 너를 지키시리라 - 시편 121:7", "The Lord will keep you - Psalm 121:7"],
      ["구하라 그리하면 너희에게 주실 것이요 - 마태복음 7:7", "Ask and it will be given to you - Matthew 7:7"]
    ];

    let idx = 0;
    function showVerse() {
      const verseDiv = document.getElementById('verse');
      if (!verseDiv) return;
      const verse = verses[idx];
      verseDiv.innerHTML = `<b>${verse[0]}</b><br><span>${verse[1]}</span>`;
      idx = (idx + 1) % verses.length;
    }
    showVerse();
    setInterval(showVerse, 3000);
  </script>
</body>
</html>

