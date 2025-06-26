import React from "react";

function AccountPage() {
  // TODO: Firebase-Accountdaten anzeigen und bearbeiten
  return (
    <div className="account-container dark-theme">
      <h1>Account-Einstellungen</h1>
      <div className="profile-placeholder-large">Profilbild</div>
      <button className="homepage-btn">Profilbild ändern</button>
      <button className="homepage-btn">Abmelden</button>
    </div>
  );
}

export default AccountPage;
