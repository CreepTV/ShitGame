import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'DEIN_API_KEY',
  authDomain: 'DEIN_AUTH_DOMAIN',
  databaseURL: 'DEINE_DATABASE_URL',
  projectId: 'DEIN_PROJECT_ID',
  // ...weitere Felder
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);