import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Logout = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  return (
    <div className="text-right p-4">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
