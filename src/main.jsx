import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // ✅ This MUST exist
import { ProfilesProvider } from './context/ProfilesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProfilesProvider>
        <App />
      </ProfilesProvider>
    </AuthProvider>
  </React.StrictMode>
);