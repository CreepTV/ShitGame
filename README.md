# SHIT HAPPENS - Multiplayer Web Game

Ein modernes, webbasiertes Multiplayer-Kartenspiel für 2-4 Spieler, inspiriert vom originalen "Shit Happens" Brettspiel.

## 🎮 Spielbeschreibung

**Shit Happens** ist ein humorvolles Kartenspiel, bei dem Spieler verschiedene Missgeschicke auf einer Skala von 1-100 (dem "Misery Index") einordnen müssen. Das Ziel ist es, als Erster 10 Karten zu sammeln, indem man die Karten korrekt in der richtigen Reihenfolge platziert.

## 🚀 Schnellstart

1. **Öffne die Startseite**: `index.html`
2. **Authentifizierung**: Klicke auf "Anmelden" oder "Registrieren" um zur Auth-Seite zu gelangen
3. **Anmelden**: Wähle zwischen E-Mail/Passwort, Google oder Gast-Anmeldung
4. **Raum erstellen/beitreten**: Verwende die Buttons auf der Startseite
5. **Spielen**: Folge den Anweisungen im Spielraum

## 🎯 Benutzerführung

### Startseite → Authentifizierung
- **"Anmelden" Button**: Öffnet die Auth-Seite mit Login-Formular
- **"Registrieren" Button**: Öffnet die Auth-Seite mit Register-Formular
- **Nach erfolgreicher Anmeldung**: Automatische Weiterleitung zur Startseite

### Spielablauf (Originalregeln):
1. **Vorbereitung**: Jeder Spieler startet mit 3 zufälligen Karten, sortiert nach Misery Index
2. **Aktiver Spieler zieht**: Der aktuelle Spieler zieht eine neue Karte und liest sie vor (ohne Misery Index zu verraten)
3. **Andere Spieler raten**: Alle ANDEREN Spieler (nicht der aktive) versuchen die Karte in ihrer eigenen Hand zu platzieren
4. **Reihenfolge der Versuche**: Spieler können nacheinander versuchen zu platzieren (im Uhrzeigersinn)
5. **Erste korrekte Platzierung gewinnt**: Der erste Spieler, der die Karte korrekt platziert, bekommt sie und fügt sie seiner Hand hinzu
6. **Falsche Platzierung**: Bei falscher Platzierung darf der nächste Spieler versuchen
7. **Spielende**: Der erste Spieler mit 10 korrekt platzierten Karten gewinnt

### ⚠️ **Wichtiger Unterschied zu anderen Implementierungen:**
- **NICHT der aktive Spieler** platziert die Karte
- **ALLE anderen Spieler** können versuchen zu raten
- **Kein Voting-System** - entweder korrekt oder falsch
- **Erste korrekte Platzierung** bekommt die Karte

## 🚀 Features

### Authentifizierung:
- **Sichere Anmeldung** mit Firebase Authentication
- **Mehrere Anmeldeoptionen**: E-Mail/Passwort, Google, Gast
- **Benutzerprofile** mit Spielstatistiken
- **Passwort-Reset** über E-Mail-Verifizierung
- **Persistente Anmeldung** mit "Angemeldet bleiben"

### Technische Features:
- **Vollständige Multiplayer-Unterstützung** mit Firebase Realtime Database
- **Responsive Design** - funktioniert auf Desktop, Tablet und Mobile
- **Moderne UI/UX** mit Animationen und Dark Theme
- **Echtzeit-Synchronisation** aller Spielzustände
- **Toast-Notifications** für Feedback
- **Umfassendes Logging** aller Spielaktionen
- **Benutzerfreundliche Modals** für Raum-Erstellung und -Beitritt

### Gameplay Features:
- **Automatische Raumverwaltung** - Räume werden automatisch erstellt und verwaltet
- **Host-System** - Der erste Spieler wird automatisch Host und zieht Karten
- **Kartenverteilung** - Automatische, faire Verteilung der Szenario-Karten
- **Raten-System** - Alle anderen Spieler können versuchen, die Karte zu platzieren
- **Reihenfolgen-Logik** - Spieler versuchen nacheinander zu platzieren
- **Gewinnbedingungen** - Automatische Erkennung des Spielendes bei 10 Karten
- **Echte Spielregeln** - Implementiert nach den Originalregeln des Brettspiels

## 📁 Projektstruktur

```
Game/
├── pages/
│   ├── auth.html             # Authentifizierungsseite
│   ├── room.html             # Hauptspielraum (Firebase-Version)
│   └── room-demo.html        # Demo-Version ohne Firebase
├── css/
│   ├── auth.css              # Styles für Authentifizierung
│   ├── room.css              # Styles für den Spielraum
│   └── startpage.css         # Styles für die Startseite
├── js/
│   ├── auth.js               # Authentifizierungslogik
│   ├── room.js               # Hauptlogik (Firebase Multiplayer)
│   ├── room-demo.js          # Demo-Logik (lokale Simulation)
│   ├── firebase-config.js    # Firebase-Konfiguration und Manager
│   └── startpage.js          # Startseiten-Logik
├── data/
│   └── scenarios.js          # Alle Szenario-Karten mit Misery Index
└── index.html                # Startseite
```

## 🛠️ Installation & Setup

### Lokale Entwicklung:

1. **Repository klonen/downloaden**
```bash
cd ShitGame/Game
```

2. **Lokalen Server starten**
```bash
# Mit Python 3
python -m http.server 8080

# Mit Node.js (wenn http-server installiert)
npx http-server -p 8080

# Mit PHP
php -S localhost:8080
```

3. **Demo testen**
```
http://localhost:8080/pages/room-demo.html
```

### Firebase Setup (für echtes Multiplayer):

1. **Firebase Projekt erstellen**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Erstelle ein neues Projekt
   - Aktiviere "Authentication" und "Firestore Database"

2. **Firebase Konfiguration**
   - Kopiere die Firebase-Konfiguration
   - Ersetze die Placeholder in `js/firebase-config.js`

3. **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
    match /players/{playerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Authentication Settings**
   - Aktiviere "Anonymous Authentication" in der Firebase Console

## 🎯 Verwendung

### Demo-Modus (ohne Firebase):
1. Öffne `pages/room-demo.html`
2. Klicke auf "Demo starten"
3. Spiele gegen simulierte KI-Gegner
4. Teste alle Spielfunktionen

### Multiplayer-Modus (mit Firebase):
1. Stelle sicher, dass Firebase konfiguriert ist
2. Öffne `pages/room.html?room=RAUMCODE`
3. Teile den Raumcode mit anderen Spielern
4. Starte das Spiel als Host

### Raum erstellen:
```javascript
// Automatische Raumerstellung beim Laden der Seite
// Raumcode wird aus URL-Parameter gelesen: ?room=DEINCODE
// Falls kein Code vorhanden, wird automatisch einer generiert
```

## 🎨 UI/UX Features

### Design:
- **Dark Theme** mit eleganten Farbverläufen
- **Glasmorphism-Effekte** für moderne Optik
- **Smooth Animations** für Kartenübergänge
- **Responsive Layout** für alle Bildschirmgrößen

### Interaktive Elemente:
- **Hover-Effekte** auf allen interaktiven Elementen
- **Pulse-Animationen** für wichtige Aktionen
- **Card-Flip-Animationen** beim Kartenziehen
- **Toast-Notifications** für sofortiges Feedback

### Accessibility:
- **Keyboard Navigation** unterstützt
- **Screen Reader** kompatibel
- **High Contrast** Farben für bessere Lesbarkeit
- **Focus Indicators** für alle interaktiven Elemente

## 🔧 Anpassungen

### Szenarios ändern:
Bearbeite `data/scenarios.js` um neue Karten hinzuzufügen:
```javascript
export const scenarios = [
    { id: 1, scenario: "Dein Szenario hier", miseryIndex: 42 },
    // ... weitere Karten
];
```

### Styling anpassen:
- **Farben**: Ändere CSS Custom Properties in `css/room.css`
- **Animationen**: Anpassung der `@keyframes` Regeln
- **Layout**: Responsive Breakpoints in Media Queries

### Spielregeln modifizieren:
- **Gewinnbedingung**: Ändere die Anzahl benötigter Karten (aktuell 10)
- **Handgröße**: Ändere die Startkartenanzahl (aktuell 3)
- **Voting-Logik**: Anpasse Abstimmungsregeln in `room.js`

## 📱 Browser-Unterstützung

### Vollständig unterstützt:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Teilweise unterstützt:
- Internet Explorer 11 (keine Animationen)
- Ältere mobile Browser (eingeschränkte Features)

## 🐛 Bekannte Probleme & Lösungen

### Firebase Connection Issues:
```javascript
// Prüfe Firebase-Status
console.log('Firebase initialized:', !!window.firebase);

// Fallback für Verbindungsprobleme
if (!navigator.onLine) {
    showToast('Offline-Modus: Demo-Features verfügbar', 'warning');
}
```

### Performance-Optimierung:
- **Kartenanimationen** können auf langsameren Geräten deaktiviert werden
- **Realtime-Updates** können gedrosselt werden für bessere Performance
- **Memory-Leaks** vermeiden durch proper cleanup in `beforeunload`

## 🤝 Beitragen

### Entwicklung:
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Teste ausgiebig (Demo + Firebase)
5. Erstelle einen Pull Request

### Bug Reports:
- Verwende den Issue-Tracker
- Beschreibe das Problem detailliert
- Füge Screenshots/Videos hinzu
- Gib Browser/Device-Informationen an

## 📄 Lizenz

Dieses Projekt ist für Bildungszwecke und private Nutzung gedacht. Das ursprüngliche "Shit Happens" Spiel ist ein Trademark der entsprechenden Rechteinhaber.

## 🙏 Credits

- **Original Spiel**: Shit Happens Board Game
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter, Patrick Hand SC)
- **Hosting**: Kompatibel mit All-Inkl, Netlify, Vercel, GitHub Pages

---

**Viel Spaß beim Spielen! 🎮**

Bei Fragen oder Problemen, siehe Demo-Version unter `pages/room-demo.html` für eine vollständige Funktionsübersicht.

## 🎯 Neue Startseiten-Features (Juli 2025)

### 🏠 Erweiterte Startseite
- **Moderne Benutzeroberfläche**: Animierte Partikel und responsives Design
- **Toast-Benachrichtigungen**: Benutzerfreundliches Feedback-System
- **Verbesserte Navigation**: Intuitive Buttons und Aktionen

### 🎮 Erweiterte Raum-Erstellung
- **Verschiedene Spielmodi**:
  - **Klassisch**: 10 Karten zum Gewinnen (Standard)
  - **Schnellspiel**: 5 Karten zum Gewinnen
  - **Marathon**: 15 Karten zum Gewinnen
- **Anpassbare Platzierungszeit**: 30-120 Sekunden pro Runde
- **Private/Öffentliche Räume**: Kontrolliere wer beitreten kann
- **Zuschauer-Modus**: Andere können zuschauen ohne mitzuspielen
- **Flexible Spieleranzahl**: 2-8 Spieler unterstützt

### 🚪 Intelligenter Raum-Beitritt
- **Echtzeit-Raum-Validierung**: Automatische Überprüfung der Raum-Codes
- **Raum-Vorschau**: Siehe Spielerliste und Status vor dem Beitreten
- **Status-Anzeige**: Warten/Spielt/Voll/Beendet
- **Smart-Feedback**: Detaillierte Fehlermeldungen und Warnungen

### 🎨 Moderne Modals
- **Responsives Design**: Funktioniert auf allen Bildschirmgrößen
- **Animierte Übergänge**: Flüssige Ein-/Ausblendungen
- **Verbesserte UX**: Benutzerfreundliche Formulare und Validierung
- **Accessibility**: Tastatur-Navigation und Screen-Reader Support
