import React, { useState, useEffect, useMemo } from "react";
import {
  addFavorite,
  deleteFavorite,
  subscribeToFavorites,
} from "../firebase/firestoreFavorites";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import ProfileList from "./ProfileList";
import ProfileSummaryBanner from "./ProfileSummaryBanner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import activities from "../data/activities.json";

const ChildProfileForm = () => {
  const { user } = useAuth();
  const {
    profiles: savedProfiles,
    fetchProfiles,
    deleteProfile,
  } = useProfiles();
  const [editId, setEditId] = useState(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    learningStyle: "",
    challenges: "",
    interests: [],
  });

  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    if (!user || !selectedChildId) return;

    const unsubscribe = subscribeToFavorites(
      user.uid,
      selectedChildId,
      (snapshot) => {
        const fetchedFavorites = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(fetchedFavorites);
      }
    );

    return () => unsubscribe();
  }, [user, selectedChildId]);

  const today = new Date().toISOString().slice(0, 10);
  const parentingTips = [
    "🐾 Visual learners thrive with diagrams and colorful charts.",
    "💡 Kinesthetic learners often process emotions best through physical activity.",
    "📖 Reading out loud builds both language skills and emotional bonds.",
    "🎶 Children who love music often benefit from rhythm-based memory games.",
    "🌱 Every child develops at their own pace — growth isn’t always linear.",
    "🏃 Movement breaks can improve focus in all types of learners.",
    "🧩 Let your child struggle a little — that’s how real growth happens!",
    "❤️ Connection before correction leads to a better behavior and trust.",
  ];
  const randomTip =
    parentingTips[Math.floor(Math.random() * parentingTips.length)];
  const interestOptions = [
    "Art",
    "STEM",
    "Sports",
    "Music",
    "Reading",
    "Nature",
    "Languages",
  ];

  const activityLinksMap = {};
  activities.forEach((activity) => {
    activity.learningStyles.forEach((style) => {
      if (!activityLinksMap[style]) activityLinksMap[style] = [];
      activityLinksMap[style].push({
        name: activity.name,
        link: activity.link,
      });
    });
  });

  const todayActivity = useMemo(() => {
    if (!savedProfiles.length) return null;
    const currentStyle = savedProfiles[0]?.learningStyle;
    const styleActivities = activityLinksMap[currentStyle] || [];
    if (!styleActivities.length) return null;
    const seed = [...today, ...currentStyle].reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    return styleActivities[seed % styleActivities.length];
  }, [savedProfiles, today]);

  const handleLogout = () => {
    toast.success("👋 You’ve been logged out successfully.", {
      autoClose: 700,
      onClose: async () => await signOut(auth),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(interest);
      return {
        ...prev,
        interests: isSelected
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.age || isNaN(formData.age))
      errs.age = "Valid age is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user) return toast.error("You must be logged in.");

    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "childProfiles", editId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Profile updated! ✅");
      } else {
        await addDoc(collection(db, "users", user.uid, "childProfiles"), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        toast.success("Profile saved! ✅");
      }

      setFormData({
        name: "",
        age: "",
        gender: "",
        learningStyle: "",
        challenges: "",
        interests: [],
      });
      setEditId(null);
      fetchProfiles();
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile.");
    }
  };

  const handleEdit = (profile) => {
    setEditId(profile.id);
    setFormData({
      name: profile.name,
      age: profile.age,
      gender: profile.gender || "",
      learningStyle: profile.learningStyle || "",
      challenges: profile.challenges || "",
      interests: profile.interests || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await deleteProfile(id);
    toast.info("Profile deleted.");
  };

  const saveToFavorites = async (activity) => {
    if (!user) {
      toast.error("You must be logged in to save activities.");
      return;
    }

    if (!selectedChildId) {
      toast.error("Please select a child to save the activity for.");
      return;
    }

    try {
      await addFavorite(
        user.uid,
        selectedChildId,
        activity.name,
        activity.link
      );
      toast.success("⭐ Activity saved to favorites!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save favorite.");
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-800">
          🐯 Welcome to A Tiger Cub!
        </h1>
        <p className="mt-2 text-gray-600 text-lg max-w-xl mx-auto">
          Helping parents guide their kids through emotional and cultural
          growth.
        </p>
      </div>
      <div className="max-w-6xl mx-auto mt-10 flex flex-col md:flex-row gap-6">
        <ToastContainer position="top-right" autoClose={2500} />

        {/* LEFT PANEL */}
        <div className="w-full md:w-2/3 bg-white p-8 rounded-2xl shadow-xl">
          {savedProfiles.length === 0 && (
            <div className="text-center text-gray-500 mb-4">
              <p className="text-sm">
                No saved profiles yet. Add your child's info to get started!
              </p>
            </div>
          )}

          {savedProfiles.length > 0 && (
            <ProfileSummaryBanner profile={savedProfiles[0]} />
          )}

          <h2 className="text-2xl font-bold mb-6 text-center">
            {editId ? "Edit Child Profile" : "Create Child Profile"}
          </h2>
          {/* Form code here */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <label className="block mb-1 font-medium">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Child's name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}

            {/* Age Field */}
            <label className="block mb-1 font-medium mt-4">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

            {/* Gender */}
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded mt-4"
            >
              <option value="">Gender (optional)</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Nonbinary</option>
              <option value="preferNot">Prefer not to say</option>
            </select>

            {/* Learning Style */}
            <label className="block font-medium mt-4 mb-1">
              Learning Style
            </label>
            <select
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              <option value="">Select a style</option>
              <option value="Inquiry-based">Inquiry-based</option>
              <option value="Hands-on">Hands-on</option>
              <option value="Visual">Visual</option>
              <option value="Kinesthetic">Kinesthetic</option>
              <option value="Experiential">Experiential</option>
            </select>

            {/* Challenges */}
            <label className="block font-medium mt-4 mb-1">
              Parenting Challenges
            </label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="(optional)"
              rows="3"
              className="w-full p-3 border border-gray-300 rounded"
            />

            {/* Interests */}
            <label className="block font-medium mt-4 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 rounded-full border text-sm cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    #{interest}
                  </button>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-6">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition w-full"
              >
                {editId ? "Update Profile" : "Save Profile"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({
                      name: "",
                      age: "",
                      gender: "",
                      learningStyle: "",
                      challenges: "",
                      interests: [],
                    });
                    setStatus("");
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel Editing
                </button>
              )}

              {/* Show Saved Profiles Button */}
              {savedProfiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfiles(true);
                    fetchProfiles();
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full"
                >
                  {showProfiles ? "Hide Saved Profiles" : "View Saved Profiles"}
                </button>
              )}
            </div>
          </form>

          {/* Saved profiles list */}
          {showProfiles && savedProfiles.length > 0 && (
            <div className="mt-8">
              <ProfileList
                profiles={savedProfiles}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 w-full text-center text-sm text-red-600 hover:underline"
          >
            Log Out
          </button>

          {status && (
            <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
          )}
        </div>

        {/* RIGHT SIDE: Sidebar Info Blocks */}
        <div className="w-full md:w-1/3 space-y-4">
          {savedProfiles.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-yellow-800 font-medium">
                Parenting Tip:
              </p>
              <p className="text-sm text-yellow-900 mt-1">{randomTip}</p>
            </div>
          )}
          {savedProfiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose Child to Save Activities For
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Select a child --</option>
                {savedProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} (Age {profile.age})
                  </option>
                ))}
              </select>
            </div>
          )}

          {todayActivity && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm">
              <p className="text-sm text-green-800 font-semibold">
                🌞 Today’s Suggested Activity
              </p>
              <a
                href={todayActivity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-900 font-medium mt-1 hover:underline"
              >
                {todayActivity.name}
              </a>
              <button
                onClick={() => saveToFavorites(todayActivity)}
                className="mt-2 text-sm text-green-700 hover:underline"
              >
                ⭐ Save to Favorites
              </button>
            </div>
          )}

          {savedProfiles.length > 0 &&
            activityLinksMap[savedProfiles[0].learningStyle]?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 shadow-sm">
                <p className="text-sm text-indigo-800 font-medium">
                  Suggested Activities for {savedProfiles[0].learningStyle}{" "}
                  Learner:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-indigo-900 space-y-2">
                  {activityLinksMap[savedProfiles[0].learningStyle]
                    .slice(0, 3)
                    .map((activity, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-700 hover:underline"
                        >
                          {activity.name}
                        </a>
                        <button
                          onClick={() => saveToFavorites(activity)}
                          className="text-sm text-green-600 hover:underline ml-2"
                        >
                          ⭐ Save
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            {favorites.length > 0 ? (
              <>
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="text-sm text-indigo-700 font-semibold hover:underline mb-2"
                >
                  {showFavorites
                    ? "Hide Saved Activities"
                    : "⭐ Show Saved Activities"}
                </button>

                {showFavorites && (
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-indigo-900">
                      Your Saved Activities
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {favorites.map((fav, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center"
                        >
                          <div className="flex justify-between items-center">
                            <a
                              href={fav.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-700 hover:underline"
                            >
                              {fav.name}
                            </a>
                            <button
                              onClick={async () => {
                                if (!user || !selectedChildId) return;
                                try {
                                  await deleteFavorite(
                                    user.uid,
                                    selectedChildId,
                                    fav.id
                                  );
                                  toast.success("❌ Activity removed");
                                } catch (error) {
                                  console.error(error);
                                  toast.error("Failed to remove favorite.");
                                }
                              }}
                              className="text-red-500 text-xs ml-2 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 italic">
                🌟 No favorites saved yet — find an activity to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildProfileForm;
