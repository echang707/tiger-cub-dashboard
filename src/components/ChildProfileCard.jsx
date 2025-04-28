import React from "react";

const ChildProfileCard = ({ profile, onDelete, onEdit }) => {
  if (!profile) return null;

  const {
    id,
    name,
    age,
    gender,
    learningStyle,
    challenges,
    interests,
    createdAt,
    updatedAt,
  } = profile;

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return null;
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm relative">
      <h3 className="text-lg font-bold mb-1">
        {name} (Age {age})
      </h3>
      {gender && <p className="text-sm">Gender: {gender}</p>}
      <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
        {learningStyle}
      </span>
      {challenges && <p className="text-sm">Challenges: {challenges}</p>}
      {interests?.length > 0 && (
        <p className="text-sm">
          Interests: <span className="italic">{interests.join(", ")}</span>
        </p>
      )}

      {/* ⏰ Timestamp */}
      <p className="text-xs text-gray-500 mt-2">
        {updatedAt
          ? `Last updated: ${formatDate(updatedAt)}`
          : createdAt
          ? `Created: ${formatDate(createdAt)}`
          : ""}
      </p>

      {/* Buttons */}
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <button
          onClick={() => onEdit(profile)}
          className="text-blue-500 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ChildProfileCard;
