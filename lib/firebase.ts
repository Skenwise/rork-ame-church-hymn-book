import { initializeApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBTQ0VOv8HQX7-DZWZoij9zvxukaP5tS3o",
  authDomain: "districtrayac.firebaseapp.com",
  projectId: "districtrayac",
  storageBucket: "districtrayac.firebasestorage.app",
  messagingSenderId: "914772441441",
  appId: "1:914772441441:web:a9632eb5ef3eb0ff762d20"
};

const app = initializeApp(firebaseConfig);

// Persist auth across app restarts (React Native has no localStorage).
// The RN build of getReactNativePersistence is required — if it is missing
// (wrong build resolved), sessions silently stop surviving restarts, so we
// log loudly instead of failing quietly.
let auth: Auth;
try {
  if (typeof getReactNativePersistence !== "function") {
    throw new Error("getReactNativePersistence is not available in this build");
  }
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.error(
    "[firebase] Native auth persistence could not be initialised — users will NOT stay signed in after restarting the app:",
    error
  );
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
