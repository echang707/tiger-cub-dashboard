import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const ChildProfileForm = () => {
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    learningStyle: '',
    challenges: '',
    interests: [],
  });

  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});

  const interestOptions = [
    'Art', 'STEM', 'Sports', 'Music', 'Reading', 'Nature', 'Languages',
  ];

  // Handle input/text changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox toggle
  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interest);
      return {
        ...prev,
        interests: isSelected
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  // Basic form validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || isNaN(formData.age)) newErrors.age = 'Valid age is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user) {
      setStatus('You must be logged in.');
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'childProfiles'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStatus('Profile saved! ✅');
      setFormData({
        name: '',
        age: '',
        gender: '',
        learningStyle: '',
        challenges: '',
        interests: [],
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus('Error saving profile.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Child Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            placeholder="Child's name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Age */}
        <div>
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded"
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        {/* Gender */}
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
        >
          <option value="">Gender (optional)</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="nonbinary">Nonbinary</option>
          <option value="preferNot">Prefer not to say</option>
        </select>

        {/* Learning Style */}
        <select
          name="learningStyle"
          value={formData.learningStyle}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded"
        >
          <option value="">Learning Style</option>
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="kinesthetic">Kinesthetic</option>
          <option value="mixed">Mixed</option>
        </select>

        {/* Challenges */}
        <textarea
          name="challenges"
          value={formData.challenges}
          onChange={handleChange}
          placeholder="Parenting challenges (optional)"
          className="w-full p-3 border border-gray-300 rounded"
          rows="3"
        />

        {/* Interests */}
        <div>
          <p className="font-medium mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <label key={interest} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-700 transition"
        >
          Save Profile
        </button>
      </form>

      {/* Status Message */}
      {status && (
        <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
      )}
    </div>
  );
};

export default ChildProfileForm;
