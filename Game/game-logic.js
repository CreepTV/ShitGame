// game-logic.js – Komplette Einzelspieler-Spiellogik mit Drag&Drop und echten Karten
// Nutzt die Szenarien aus game-data.js

let playerHand = [];
let drawPile = [];
let drawnCard = null;

function startGame() {
  // Hole Karten aus game-data.js
  drawPile = shuffleDeck([...SCENES]);
  playerHand = drawPile.splice(0, 3).sort((a, b) => a.misery - b.misery);
  drawnCard = null;
  renderHand();
  renderDrawPile();
  renderDrawnCard();
  log('Spiel gestartet!');
}

function renderHand() {
  const handArea = document.getElementById('hand-area');
  handArea.innerHTML = '';
  if (drawnCard) {
    // Platzhalter am Anfang
    addPlaceholder(handArea, 0);
  }
  playerHand.forEach((card, idx) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.draggable = false;
    cardDiv.innerHTML = `<b>${card.text}</b><br><span style='font-size:0.9em;color:#aaa;'>Misery: ???</span>`;
    cardDiv.dataset.idx = idx;
    handArea.appendChild(cardDiv);
    if (drawnCard) {
      // Platzhalter nach jeder Karte
      addPlaceholder(handArea, idx + 1);
    }
  });
}

function addPlaceholder(parent, idx) {
  const ph = document.createElement('div');
  ph.className = 'card-placeholder';
  ph.addEventListener('dragover', e => { e.preventDefault(); ph.classList.add('active-placeholder'); });
  ph.addEventListener('dragleave', e => ph.classList.remove('active-placeholder'));
  ph.addEventListener('drop', e => { ph.classList.remove('active-placeholder'); onDrop(idx); });
  parent.appendChild(ph);
}

function renderDrawPile() {
  document.getElementById('draw-pile').innerText = `Karten: ${drawPile.length}`;
}

function renderDrawnCard() {
  const drawn = document.getElementById('drawn-card');
  if (drawnCard) {
    drawn.innerHTML = `<div class='card dragging' draggable='true' id='dragged-card'>${drawnCard.text}<br><span style='font-size:0.9em;color:#aaa;'>Misery: ???</span></div>`;
    const dragCard = document.getElementById('dragged-card');
    dragCard.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', 'drawn');
    });
  } else {
    drawn.innerHTML = '';
  }
}

function drawCard() {
  if (drawnCard || drawPile.length === 0) return;
  drawnCard = drawPile.shift();
  renderDrawPile();
  renderDrawnCard();
  log(`Neue Karte gezogen: ${drawnCard.text}`);
}

function onDrop(idx) {
  if (!drawnCard) return;
  // Karte an Position idx einfügen
  playerHand.splice(idx, 0, drawnCard);
  log(`Karte platziert: ${drawnCard.text} an Position ${idx + 1}`);
  drawnCard = null;
  renderHand();
  renderDrawnCard();
  checkWin();
}

function checkWin() {
  if (playerHand.length >= 10) {
    log('Du hast 10 Karten! Du gewinnst!');
    setTimeout(() => alert('Du hast gewonnen!'), 500);
  }
}

function log(msg) {
  const logDiv = document.getElementById('game-log');
  logDiv.innerHTML = msg + '<br>' + logDiv.innerHTML;
}

window.onload = startGame;
