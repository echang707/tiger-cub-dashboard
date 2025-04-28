import { db } from '../firebase';
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Add a favorite activity
export async function addFavorite(userId, childId, name, link) {
  const favoritesRef = collection(db, 'users', userId, 'childProfiles', childId, 'favorites');
  const newFavorite = {
    name,
    link,
    createdAt: new Date(),
  };
  const docRef = await addDoc(favoritesRef, newFavorite);
  return docRef.id;
}

// Delete a favorite
export async function deleteFavorite(userId, childId, favoriteId) {
  const favRef = doc(db, 'users', userId, 'childProfiles', childId, 'favorites', favoriteId);
  await deleteDoc(favRef);
}

// Listen for real-time favorites
export function subscribeToFavorites(userId, childId, callback) {
  const favoritesRef = collection(db, 'users', userId, 'childProfiles', childId, 'favorites');
  const q = query(favoritesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
}
