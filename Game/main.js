// main.js – Komplette Spiellogik für Shit Happens Online (ohne Backend, aber vorbereitet)

// Beispielkarten (normalerweise aus Datei oder DB)
const exampleDeck = [
  { id: 1, text: '3rd-degree sunburn', misery: 60 },
  { id: 2, text: 'Seeing your father naked', misery: 35 },
  { id: 3, text: 'Dropping your phone in the toilet', misery: 42 },
  { id: 4, text: 'Stepping on a LEGO', misery: 15 },
  { id: 5, text: 'Getting stung by a bee', misery: 25 },
  { id: 6, text: 'Losing your wallet', misery: 55 },
  { id: 7, text: 'Toothache', misery: 50 },
  { id: 8, text: 'Locked out of your house', misery: 30 },
  { id: 9, text: 'Bad haircut', misery: 10 },
  { id: 10, text: 'Flat tire', misery: 20 }
];

let state = {
  page: 'home',
  playerName: '',
  roomCode: '',
  isHost: false,
  players: [],
  deck: [],
  hands: {},
  placedCount: {},
  currentDraw: null,
  currentPlayer: '',
  votes: {},
  round: 0,
  gameStarted: false
};

function showPage(page) {
  state.page = page;
  const main = document.getElementById('main-content');
  switch(page) {
    case 'home':
      main.innerHTML = `
        <h2>Willkommen!</h2>
        <p>Starte ein neues Spiel oder trete einem bestehenden Raum bei – als Gast oder mit Account.</p>
      `;
      break;
    case 'create':
      main.innerHTML = `
        <h2>Neues Spiel erstellen</h2>
        <input id="nameInput" type="text" placeholder="Dein Name">
        <button class="btn" onclick="createRoom()">Raum erstellen</button>
        <div id="createRoomResult"></div>
      `;
      break;
    case 'join':
      main.innerHTML = `
        <h2>Raum beitreten</h2>
        <input id="nameInputJoin" type="text" placeholder="Dein Name">
        <input id="roomCodeInput" type="text" placeholder="Raum-Code">
        <button class="btn" onclick="joinRoom()">Beitreten</button>
        <div id="joinRoomResult"></div>
      `;
      break;
    case 'rules':
      main.innerHTML = renderRules();
      break;
    case 'game':
      window.open('game.html', '_blank');
      break;
    default:
      main.innerHTML = '<p>Seite nicht gefunden.</p>';
  }
}

function createRoom() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return alert('Bitte Namen eingeben!');
  state.playerName = name;
  state.isHost = true;
  state.roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  state.players = [name];
  state.deck = shuffle([...exampleDeck]);
  state.hands = {};
  state.placedCount = {};
  state.hands[name] = state.deck.splice(0, 3).sort((a, b) => a.misery - b.misery);
  state.placedCount[name] = 0;
  state.currentPlayer = name;
  state.gameStarted = false;
  document.getElementById('createRoomResult').innerHTML =
    `<div class="card">Raum erstellt!<br>Raum-Code: <b>${state.roomCode}</b><br>Warte auf Mitspieler...<br><button class='btn' onclick='startGame()'>Spiel starten</button></div>`;
}

function joinRoom() {
  const name = document.getElementById('nameInputJoin').value.trim();
  const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (!name || !code) return alert('Bitte Name und Raum-Code eingeben!');
  // In echter App: Hier würde geprüft, ob Raum existiert und Spieler hinzugefügt werden
  state.playerName = name;
  state.roomCode = code;
  state.isHost = false;
  if (!state.players.includes(name)) state.players.push(name);
  if (!state.hands[name]) {
    state.hands[name] = state.deck.splice(0, 3).sort((a, b) => a.misery - b.misery);
    state.placedCount[name] = 0;
  }
  document.getElementById('joinRoomResult').innerHTML =
    `<div class="card">Beigetreten!<br>Raum-Code: <b>${code}</b><br><button class='btn' onclick='showPage("game")'>Zum Spiel</button></div>`;
}

function startGame() {
  state.gameStarted = true;
  state.round = 1;
  state.currentDraw = state.deck.shift();
  showPage('game');
}

function renderRules() {
  return `
    <h2>Spielanleitung</h2>
    <ol>
      <li>Mische das Deck, teile jedem Spieler 3 Karten aus und sortiere sie nach Misery Index.</li>
      <li>Die restlichen Karten bilden den Nachziehstapel.</li>
      <li>Ziehe eine Karte und rate, wo sie im Index einsortiert wird.</li>
      <li>Du musst nicht die genaue Zahl erraten, sondern nur die richtige Position.</li>
      <li>Bei richtiger Platzierung bekommst du die Karte, sonst ist der nächste dran.</li>
      <li>Wer zuerst 10 Karten hat, gewinnt!</li>
    </ol>
    <h3>Online-Features</h3>
    <ul>
      <li>Multiplayer mit Gast- und Account-Option</li>
      <li>Räume mit Code erstellen und beitreten</li>
      <li>Echtzeit-Synchronisation (Firebase empfohlen)</li>
    </ul>
  `;
}

function renderGamePage() {
  if (!state.gameStarted) {
    return `<div class="card">Warte auf Spielstart...</div>`;
  }
  const hand = state.hands[state.playerName] || [];
  let handHtml = hand.map(card => `<li>${card.text} <span style='color:#aaa'>(Index: ${card.misery})</span></li>`).join('');
  let playersHtml = state.players.map(p => `<li>${p} (${state.placedCount[p] || 0} Karten)</li>`).join('');
  return `
    <h2>Spielraum: ${state.roomCode}</h2>
    <div class="card">
      <b>Spieler:</b>
      <ul class="player-list">${playersHtml}</ul>
      <b>Deine Hand:</b>
      <ul>${handHtml}</ul>
      <b>Karte zum Einordnen:</b><br>
      <div class="card">${state.currentDraw ? state.currentDraw.text + ' (Index: ?)' : 'Keine Karte mehr!'}</div>
      <div>
        <button class="btn" onclick="placeCard('left')">Links</button>
        <button class="btn" onclick="placeCard('middle')">Zwischen</button>
        <button class="btn" onclick="placeCard('right')">Rechts</button>
      </div>
      <div id="placementResult"></div>
      <button class="btn" onclick="showPage('home')">Zurück zum Start</button>
    </div>
  `;
}

function placeCard(position) {
  // Platzhalter: Immer korrekt, Punkte erhöhen
  state.placedCount[state.playerName] = (state.placedCount[state.playerName] || 0) + 1;
  document.getElementById('placementResult').innerHTML = `<b>Richtig platziert!</b>`;
  // Neue Karte ziehen
  if (state.deck.length > 0) {
    state.currentDraw = state.deck.shift();
    setTimeout(() => showPage('game'), 1000);
  } else {
    document.getElementById('placementResult').innerHTML += '<br><b>Deck ist leer! Spiel beendet.</b>';
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initiale Seite anzeigen
showPage('home');
