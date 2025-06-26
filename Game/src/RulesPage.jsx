import React from "react";

function RulesPage() {
  return (
    <div className="rules-container dark-theme">
      <h1>Spielanleitung</h1>
      <ol>
        <li>Mische das Deck, teile jedem Spieler 3 Karten aus und sortiere sie nach Misery Index.</li>
        <li>Die restlichen Karten bilden den Nachziehstapel.</li>
        <li>Ziehe eine Karte und rate, wo sie im Index einsortiert wird.</li>
        <li>Du musst nicht die genaue Zahl erraten, sondern nur die richtige Position.</li>
        <li>Bei richtiger Platzierung bekommst du die Karte, sonst ist der nächste dran.</li>
        <li>Wer zuerst 10 Karten hat, gewinnt!</li>
      </ol>
      <h2>Online-Version Features</h2>
      <ul>
        <li>Multiplayer mit Firebase (Echtzeit-Updates, Account-System)</li>
        <li>Räume erstellen/beitreten, Host-Wechsel, Voting-System</li>
        <li>Synchronisation aller Spielzüge in Echtzeit</li>
        <li>Strikte Sicherheitsregeln für Fairness</li>
      </ul>
    </div>
  );
}

export default RulesPage;
