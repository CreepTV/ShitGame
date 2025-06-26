import React, { useState } from "react";
import { auth, db } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import { ref, get, update } from "firebase/database";

function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");

  const handleJoinRoom = async () => {
    setStatus("");
    try {
      if (!roomCode) {
        setStatus("Bitte gib einen Raumcode ein.");
        return;
      }
      // Anonym anmelden, falls nicht eingeloggt
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      const roomRef = ref(db, `rooms/${roomCode}`);
      const snap = await get(roomRef);
      if (!snap.exists()) {
        setStatus("Raum nicht gefunden.");
        return;
      }
      // Spieler als Gast hinzufügen
      await update(roomRef, {
        [`players/${auth.currentUser.uid}`]: { name: "Gast", guest: true }
      });
      setStatus("Beigetreten! Viel Spaß!");
    } catch (e) {
      setStatus("Fehler beim Beitreten.");
    }
  };

  return (
    <div className="room-container dark-theme">
      <h1>Als Gast Raum beitreten</h1>
      <input
        type="text"
        placeholder="Raumcode eingeben"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value.toUpperCase())}
        maxLength={8}
      />
      <button className="homepage-btn" onClick={handleJoinRoom}>Beitreten</button>
      {status && <div>{status}</div>}
    </div>
  );
}

export default JoinRoomPage;
