import React, { useState } from "react";
import { auth, db } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import { ref, push, set } from "firebase/database";

function CreateRoomPage() {
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [status, setStatus] = useState("");

  const handleCreateRoom = async () => {
    setStatus("");
    try {
      // Anonym anmelden, falls nicht eingeloggt
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      // Raumcode generieren (z.B. 6-stellig)
      const code = roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
      const roomRef = ref(db, `rooms/${code}`);
      await set(roomRef, {
        name: roomName,
        hostId: auth.currentUser.uid,
        players: {
          [auth.currentUser.uid]: { name: "Gast", guest: true }
        },
        createdAt: Date.now(),
      });
      setStatus(`Raum erstellt! Code: ${code}`);
    } catch (e) {
      setStatus("Fehler beim Erstellen des Raums.");
    }
  };

  return (
    <div className="room-container dark-theme">
      <h1>Neuen Raum als Gast erstellen</h1>
      <input
        type="text"
        placeholder="Raumname (optional)"
        value={roomName}
        onChange={e => setRoomName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Raumcode (optional, sonst automatisch)"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value.toUpperCase())}
        maxLength={8}
      />
      <button className="homepage-btn" onClick={handleCreateRoom}>Raum erstellen</button>
      {status && <div>{status}</div>}
    </div>
  );
}

export default CreateRoomPage;
