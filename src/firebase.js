import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, initializeFirestore, orderBy, persistentLocalCache, persistentMultipleTabManager, query, serverTimestamp, setDoc } from 'firebase/firestore';

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
  await setDoc(doc(db, 'students', user.uid), { username, ...profile, leaderboardId: crypto.randomUUID().replaceAll('-', ''), progress: { done: {}, stars: 0 }, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return user;
}
export const signOutStudent = () => signOut(auth);
export const watchStudent = callback => onAuthStateChanged(auth, callback);
export async function getStudentProgress(uid) {
  const studentRef = doc(db, 'students', uid), snapshot = await getDoc(studentRef);
  if (!snapshot.exists()) return {};
  const profile = snapshot.data();
  if (!profile.leaderboardId) {
    profile.leaderboardId = crypto.randomUUID().replaceAll('-', '');
    await setDoc(studentRef, { leaderboardId: profile.leaderboardId, updatedAt: serverTimestamp() }, { merge: true });
  }
  return profile;
}
export async function saveStudentProgress(uid, progress, leaderboardId, username) {
  await setDoc(doc(db, 'students', uid), { progress, updatedAt: serverTimestamp() }, { merge: true });
  if (leaderboardId && username) await setDoc(doc(db, 'leaderboard', leaderboardId), { username, stars: progress.stars, updatedAt: serverTimestamp() });
}
export async function getLeaderboard() {
  const snapshot = await getDocs(query(collection(db, 'leaderboard'), orderBy('stars', 'desc')));
  return snapshot.docs.map(entry => ({ id: entry.id, ...entry.data() })).filter(entry => typeof entry.username === 'string' && entry.username).slice(0, 20);
}
