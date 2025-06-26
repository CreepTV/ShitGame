import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

function HomePage() {
  return (
    <div className="homepage-container dark-theme">
      <header className="homepage-header">
        <h1>Shit Happens – Online</h1>
        <p>Multiplayer-Kartenspiel – jetzt auch komplett als Gast!</p>
      </header>
      <main className="homepage-main">
        <section className="homepage-section">
          <h2>Spiel starten</h2>
          <Link to="/create-room" className="homepage-btn">Neues Spiel erstellen (mit Account)</Link>
          <Link to="/join-room" className="homepage-btn">Spiel beitreten (mit Account)</Link>
          <Link to="/create-room?guest=true" className="homepage-btn guest-btn">Als Gast Spiel erstellen</Link>
          <Link to="/join-room?guest=true" className="homepage-btn guest-btn">Als Gast beitreten (mit Code)</Link>
        </section>
        <section className="homepage-section">
          <h2>Profil</h2>
          <div className="profile-placeholder">
            {/* Profilbild oder Gast-Icon */}
            <span>Profilbild / Gast</span>
          </div>
          <Link to="/account" className="homepage-btn">Account-Einstellungen</Link>
        </section>
        <section className="homepage-section">
          <h2>Spielanleitung</h2>
          <ul className="homepage-rules">
            <li>Mische das Deck, teile jedem Spieler 3 Karten aus.</li>
            <li>Ziehe eine Karte und rate, wo sie im Misery Index einsortiert wird.</li>
            <li>Wer 10 Karten richtig platziert, gewinnt!</li>
            <li>Alle Regeln findest du <Link to="/rules">hier</Link>.</li>
          </ul>
        </section>
      </main>
      <footer className="homepage-footer">
        <small>© 2025 Shit Happens Online</small>
      </footer>
    </div>
  );
}

export default HomePage;
