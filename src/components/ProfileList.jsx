import React from "react";
import { useNavigate } from "react-router-dom";
import ChildProfileCard from "./ChildProfileCard";

const ProfileList = ({ profiles, onDelete, onEdit }) => {
  const navigate = useNavigate();

  if (!profiles || profiles.length === 0) {
    return <p className="text-sm text-gray-500">No saved profiles yet.</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        You have {profiles.length} saved{" "}
        {profiles.length === 1 ? "profile" : "profiles"}.
      </p>
      <h3 className="text-lg font-semibold">Saved Profiles:</h3>
      {profiles.map((profile) => (
        <div key={profile.id} className="bg-white p-4 rounded-xl shadow-md">
          <ChildProfileCard
            profile={profile}
            onDelete={onDelete}
            onEdit={onEdit}
          />
          <button
            onClick={() => navigate(`/child/${profile.id}`)}
            className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
          >
            View Dashboard
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProfileList;
