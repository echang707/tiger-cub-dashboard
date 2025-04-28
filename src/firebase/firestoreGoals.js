// src/firebase/firestoreGoals.js
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Add a new goal
export async function addGoal(userId, childId, text, dueDate) {
  const goalsRef = collection(db, 'users', userId, 'childProfiles', childId, 'goals');
  const newGoal = {
    text,
    done: false,
    dueDate: dueDate || null,
    createdAt: new Date(),
  };
  const docRef = await addDoc(goalsRef, newGoal);
  return docRef.id;
}

// Update a goal's "done" status
export async function updateGoalDone(userId, childId, goalId, done) {
  const goalRef = doc(db, 'users', userId, 'childProfiles', childId, 'goals', goalId);
  await updateDoc(goalRef, { done });
}

// Delete a goal
export async function deleteGoal(userId, childId, goalId) {
  const goalRef = doc(db, 'users', userId, 'childProfiles', childId, 'goals', goalId);
  await deleteDoc(goalRef);
}

// Listen for real-time updates
export function subscribeToGoals(userId, childId, callback) {
  const goalsRef = collection(db, 'users', userId, 'childProfiles', childId, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
}
