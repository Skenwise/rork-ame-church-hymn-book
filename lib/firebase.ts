import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTQ0VOv8HQX7-DZWZoij9zvxukaP5tS3o",
  authDomain: "districtrayac.firebaseapp.com",
  projectId: "districtrayac",
  storageBucket: "districtrayac.firebasestorage.app",
  messagingSenderId: "914772441441",
  appId: "1:914772441441:web:a9632eb5ef3eb0ff762d20"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
