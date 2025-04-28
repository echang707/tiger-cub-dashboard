// src/ChildDashboard.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProfiles } from "../context/ProfilesContext";
import { useAuth } from "../context/AuthContext";
import activities from "../data/activities.json";
import ChildNotes from "./ChildNotes";
import {
  addGoal,
  updateGoalDone,
  deleteGoal,
  subscribeToGoals,
} from "../firebase/firestoreGoals";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  addFavorite,
  deleteFavorite,
  subscribeToFavorites,
} from "../firebase/firestoreFavorites";

const ChildDashboard = () => {
  const { id } = useParams();
  const { profiles } = useProfiles();
  const { user } = useAuth();
  const profile = profiles.find((p) => p.id === id);

  const [completedGoals, setCompletedGoals] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalDueDate, setNewGoalDueDate] = useState("");

  useEffect(() => {
    if (!profile || !user) return;

    const unsubscribe = subscribeToFavorites(
      user.uid,
      profile.id,
      (snapshot) => {
        const fetchedFavorites = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(fetchedFavorites);
      }
    );

    return () => unsubscribe();
  }, [profile, user]);

  useEffect(() => {
    if (!profile || !user) return;

    const unsubscribe = subscribeToGoals(user.uid, profile.id, (snapshot) => {
      const fetchedGoals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(fetchedGoals);

      // Update completed goals and total goals dynamically
      const completed = fetchedGoals.filter((goal) => goal.done).length;
      setCompletedGoals(completed);
      setTotalGoals(fetchedGoals.length);
    });

    return () => unsubscribe();
  }, [profile, user]);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      await addGoal(
        user.uid,
        profile.id,
        newGoal,
        newGoalDueDate ? Timestamp.fromDate(new Date(newGoalDueDate)) : null
      );
      setNewGoal("");
      setNewGoalDueDate("");
      toast.success("Goal added!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add goal.");
    }
  };
  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(user.uid, profile.id, goalId);
      toast.success("Goal deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete goal.");
    }
  };

  const handleToggleGoal = async (goalId, done) => {
    try {
      await updateGoalDone(user.uid, profile.id, goalId, !done);
      toast.success("Goal updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update goal.");
    }
  };

  const handleAddFavorite = async (name, link) => {
    try {
      await addFavorite(user.uid, profile.id, name, link);
      toast.success("Activity saved to favorites!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save favorite.");
    }
  };

  const handleDeleteFavorite = async (favoriteId) => {
    try {
      await deleteFavorite(user.uid, profile.id, favoriteId);
      toast.success("Favorite removed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove favorite.");
    }
  };

  const suggestedModules = activities
    .filter((activity) =>
      activity.learningStyles.includes(profile.learningStyle)
    )
    .slice(0, 2);

  if (!profile) {
    return (
      <div className="text-center mt-10 text-gray-500">Child not found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10 mt-12 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">
        Welcome to {profile.name}’s Dashboard
      </h2>

      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
          🐯
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.name}</p>
          <p className="text-sm text-gray-600">Age: {profile.age}</p>
          <p className="text-sm text-gray-600">
            Learning Style: {profile.learningStyle}
          </p>
        </div>
      </div>

      {/* Interests */}
      <div className="mb-6">
        <h3 className="font-semibold text-sm mb-1 text-indigo-700">
          Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.interests?.length > 0 ? (
            profile.interests.map((interest, i) => (
              <span
                key={i}
                className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
              >
                #{interest}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No interests saved</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-indigo-700 mb-2">
          Weekly Progress
        </h3>
        <div className="bg-gray-200 rounded-full h-4 w-full overflow-hidden mb-1">
          <div
            className="bg-indigo-500 h-full transition-all"
            style={{
              width: `${totalGoals ? (completedGoals / totalGoals) * 100 : 0}%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-700">
          {completedGoals} of {totalGoals} goals completed
        </p>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-indigo-700 mb-2">
          Badges Earned
        </h3>
        <div className="flex gap-2 flex-wrap text-lg">
          <span title="Loves to read">📚</span>
          <span title="Creative spirit">🎨</span>
          <span title="Curious learner">🔍</span>
        </div>
      </div>

      {/* 🎯 Learning Goals */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-indigo-700 mb-2">
          🎯 Learning Goals
        </h3>
        <ul className="space-y-2 mb-4">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center justify-between p-2 border-b"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => handleToggleGoal(goal.id, goal.done)}
                  className="accent-indigo-600"
                />
                <span
                  className={
                    goal.done ? "line-through text-gray-500 text-sm" : "text-sm"
                  }
                >
                  {goal.text}
                </span>
                {goal.dueDate && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Due: {goal.dueDate.toDate().toLocaleDateString()})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="text-red-500 text-xs hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Add New Goal */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a custom goal..."
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="date"
            value={newGoalDueDate}
            onChange={(e) => setNewGoalDueDate(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleAddGoal}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* AI Module Suggestions */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-indigo-700 mb-2">
          📘 Suggested Modules
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-800">
          {suggestedModules.map((module, i) => (
            <li key={i}>
              <a
                href={module.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {module.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Saved Favorites */}
      <div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className="text-sm text-indigo-700 font-semibold hover:underline mb-2"
        >
          {showFavorites ? "Hide Saved Activities" : "⭐ Show Saved Activities"}
        </button>

        {showFavorites &&
          (favorites.length > 0 ? (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-800 space-y-1">
              {favorites.map((fav) => (
                <li key={fav.id} className="flex items-center justify-between">
                  <a
                    href={fav.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {fav.name}
                  </a>
                  <button
                    onClick={() => handleDeleteFavorite(fav.id)}
                    className="text-red-500 text-xs hover:underline ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              🌟 No favorites saved yet — find an activity to get started!
            </p>
          ))}
      </div>

      {/* Child Notes */}
      <ChildNotes childId={profile.id} />
    </div>
  );
};

export default ChildDashboard;
