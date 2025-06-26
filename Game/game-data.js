// game-data.js – Szenarien/Karten für Shit Happens
// Format: { id, text, misery }
const SCENES = [
  { id: 1, text: "Du trittst in Hundekot.", misery: 1 },
  { id: 2, text: "Du hast den ganzen Tag einen schlechten Haartag.", misery: 2 },
  { id: 3, text: "Du hast den ganzen Tag einen Bad Hair Day.", misery: 3 },
  { id: 4, text: "Du stehst im Supermarkt und die Person vor dir hat einen vollen Wagen und zahlt mit Cent-Münzen.", misery: 4 },
  { id: 5, text: "Du findest einen Parkplatz und merkst, dass du kein Kleingeld hast.", misery: 5 },
  // ... (weitere Szenen aus SzenenListe.txt einfügen)
];

// Hilfsfunktion: Deck mischen
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
