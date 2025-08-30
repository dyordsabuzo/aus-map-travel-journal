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
  query,
  where,
} from "firebase/firestore";
import { BlogMapPin } from "../types/BlogType";
import { auth } from "./auth";
import { app } from "./app";

const db = getFirestore(app);

const PINS_COLLECTION = "pins";

// --- CRUD Utilities ---

// Add a new pin, tied to the current user
export async function addPin(pin: BlogMapPin): Promise<string> {
  const userId = auth.currentUser?.uid;
  const docRef = await addDoc(collection(db, PINS_COLLECTION), {
    ...pin,
    userId,
  });
  return docRef.id;
}

// Get all pins for the current user
export async function getAllPins(): Promise<BlogMapPin[]> {
  const userId = auth.currentUser?.uid;
  const pinsQuery = userId
    ? query(collection(db, PINS_COLLECTION), where("userId", "==", userId))
    : collection(db, PINS_COLLECTION);
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(pinsQuery);
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
