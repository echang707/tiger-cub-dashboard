import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ProfilesContext = createContext();

export const useProfiles = () => useContext(ProfilesContext);

export const ProfilesProvider = ({ children }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (user) fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'childProfiles'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // optional sort
      data.sort((a, b) => b.updatedAt?.toDate?.() - a.updatedAt?.toDate?.());
      setProfiles(data);
    } catch (err) {
      console.error("Error loading profiles:", err);
    }
  };

  const deleteProfile = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'childProfiles', id));
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  };

  return (
    <ProfilesContext.Provider value={{ profiles, fetchProfiles, deleteProfile }}>
      {children}
    </ProfilesContext.Provider>
  );
};
