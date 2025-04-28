import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ChildProfileForm from "./components/ChildProfileForm";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ChildDashboard from "./components/ChildDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, loading } = useAuth();
  const [isNewUser, setIsNewUser] = useState(true);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (user) {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "childProfiles")
        );
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      }
    };
    fetchProfiles();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <ToastContainer position="top-right" autoClose={2500} />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <ChildProfileForm savedProfiles={profiles} />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
                    {isNewUser ? <Signup /> : <Login />}
                    <p className="mt-4 text-center text-sm text-gray-600">
                      {isNewUser ? "Already have an account?" : "New here?"}{" "}
                      <button
                        onClick={() => setIsNewUser(!isNewUser)}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {isNewUser ? "Log in" : "Sign up"}
                      </button>
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/child/:id"
            element={<ChildDashboard profiles={profiles} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
