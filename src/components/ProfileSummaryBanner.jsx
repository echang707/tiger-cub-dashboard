import React from 'react';

const ProfileSummaryBanner = ({ profile }) => {
  if (!profile) return null;

  const { name, age, learningStyle, interests } = profile;
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm text-blue-900">
      <p className="text-sm">🎉 Welcome back!</p>
      <p className="text-md font-medium">
        You’re supporting <span className="font-semibold">{name}</span>, a {age}-year-old{' '}
        {learningStyle?.toLowerCase()} learner who loves{' '}
        <span className="italic">{interests?.join(', ') || 'exploring new things'}</span>.
      </p>
    </div>
  );
};

export default ProfileSummaryBanner;