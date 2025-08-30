import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Import config from firestore.ts or define here
import { firebaseConfig } from "./firestore";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function onUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
