import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ChildNotes = ({ childId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [noteTag, setNoteTag] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTag, setEditTag] = useState("");

  const fetchNotes = async () => {
    if (!user) return;
    const notesRef = collection(
      db,
      "users",
      user.uid,
      "childProfiles",
      childId,
      "notes"
    );
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotes(data);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const notesRef = collection(
      db,
      "users",
      user.uid,
      "childProfiles",
      childId,
      "notes"
    );
    await addDoc(notesRef, {
      text: newNote.trim(),
      tag: noteTag.trim(),
      createdAt: serverTimestamp(),
    });
    setNewNote("");
    setNoteTag("");
    fetchNotes();
  };

  const deleteNote = async (noteId) => {
    const noteRef = doc(
      db,
      "users",
      user.uid,
      "childProfiles",
      childId,
      "notes",
      noteId
    );
    await deleteDoc(noteRef);
    fetchNotes();
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
    setEditTag(note.tag || "");
  };

  const saveEdit = async () => {
    const noteRef = doc(
      db,
      "users",
      user.uid,
      "childProfiles",
      childId,
      "notes",
      editingId
    );
    await updateDoc(noteRef, {
      text: editText.trim(),
      tag: editTag.trim(),
    });
    setEditingId(null);
    fetchNotes();
  };

  useEffect(() => {
    if (childId) fetchNotes();
  }, [childId]);

  return (
    <div className="mt-8">
      <h3 className="text-md font-semibold text-indigo-700 mb-2">
        📝 Running Log / Notes
      </h3>

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800 relative"
          >
            {editingId === note.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full mb-2 p-1 border rounded text-sm"
                />
                <input
                  type="text"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  placeholder="Tag (optional)"
                  className="w-full mb-2 p-1 border rounded text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-white bg-indigo-600 px-2 py-1 rounded text-xs hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 text-xs hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium">{note.text}</p>
                {note.tag && (
                  <span className="inline-block mt-1 text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    #{note.tag}
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => startEditing(note)}
                    className="text-indigo-600 text-xs hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Tag (optional)"
          value={noteTag}
          onChange={(e) => setNoteTag(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={addNote}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ChildNotes;
