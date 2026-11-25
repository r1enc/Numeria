import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, serverTimestamp, setDoc } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseReady = Object.values(config).every(Boolean);
let auth, db;
if (firebaseReady) {
  const app = initializeApp(config);
  auth = getAuth(app);
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
}

const studentEmail = username => `${username}@login.numeria.invalid`;
export const signInStudent = (username, pin) => signInWithEmailAndPassword(auth, studentEmail(username), pin).then(result => result.user);
export async function createStudent(username, pin, profile) {
  const { user } = await createUserWithEmailAndPassword(auth, studentEmail(username), pin);
  await setDoc(doc(db, 'students', user.uid), { username, ...profile, progress: { done: {}, stars: 0 }, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return user;
}
export const signOutStudent = () => signOut(auth);
export const watchStudent = callback => onAuthStateChanged(auth, callback);
export async function getStudentProgress(uid) {
  const snapshot = await getDoc(doc(db, 'students', uid));
  return snapshot.exists() ? snapshot.data() : {};
}
export function saveStudentProgress(uid, progress) {
  return setDoc(doc(db, 'students', uid), { progress, updatedAt: serverTimestamp() }, { merge: true });
}
