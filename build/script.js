
function changeVerse() {
  const verse = verses[Math.floor(Math.random() * verses.length)];
  document.getElementById("verse-ko").innerText = verse.ko;
  document.getElementById("verse-en").innerText = verse.en;
}
setInterval(changeVerse, 3000);
window.onload = changeVerse;
