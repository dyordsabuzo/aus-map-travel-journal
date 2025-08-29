/**
 * Firebase Firestore integration for pin data
 *
 * 1. Go to https://console.firebase.google.com/ and create a new project.
 * 2. In your project settings, add a web app and copy the Firebase config.
 * 3. Replace the firebaseConfig below with your actual config.
 * 4. In Firestore, create a collection named "pins".
 * 5. Use the CRUD utilities below to interact with pin data.
 *
 * Example config:
 * const firebaseConfig = {
 *   apiKey: "AIza...",
 *   authDomain: "your-app.firebaseapp.com",
 *   projectId: "your-app",
 *   storageBucket: "your-app.appspot.com",
 *   messagingSenderId: "123456789",
 *   appId: "1:123456789:web:abcdefg",
 * };
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { BlogMapPin } from "../types/BlogType";

// --- Load Firebase config from environment variables ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PINS_COLLECTION = "pins";

// --- CRUD Utilities ---

// Add a new pin
export async function addPin(pin: BlogMapPin): Promise<string> {
  const docRef = await addDoc(collection(db, PINS_COLLECTION), pin);
  return docRef.id;
}

// Get all pins
export async function getAllPins(): Promise<BlogMapPin[]> {
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
    collection(db, PINS_COLLECTION),
  );
  return querySnapshot.docs.map((doc) => ({
    ...(doc.data() as BlogMapPin),
    id: doc.id,
  }));
}

// Update a pin by ID
export async function updatePin(
  id: string,
  pin: Partial<BlogMapPin>,
): Promise<void> {
  const docRef = doc(db, PINS_COLLECTION, id);
  await updateDoc(docRef, pin);
}

// Delete a pin by ID
export async function deletePin(id: string): Promise<void> {
  const docRef = doc(db, PINS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Set (overwrite) a pin by ID
export async function setPin(id: string, pin: BlogMapPin): Promise<void> {
  const docRef = doc(db, PINS_COLLECTION, id);
  await setDoc(docRef, pin);
}

// --- Helper to initialize Firestore (for advanced usage) ---
export { db };
