import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import ChildProfileForm from './components/ChildProfileForm';
import Signup from './components/Signup';
import Login from './components/Login';
import Logout from './components/Logout';

function App() {
  const context = useAuth();
  const { user } = context || {};
  const [isNewUser, setIsNewUser] = useState(true); // 👈 Track mode

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {user ? (
        <>
          <Logout />
          <ChildProfileForm />
        </>
      ) : (
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
          {isNewUser ? <Signup /> : <Login />}

          <p className="mt-4 text-center text-sm text-gray-600">
            {isNewUser ? 'Already have an account?' : 'New here?'}{' '}
            <button
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-indigo-600 hover:underline font-medium"
            >
              {isNewUser ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
