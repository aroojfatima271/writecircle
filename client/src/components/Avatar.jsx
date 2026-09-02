import React from 'react';

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };

const Avatar = ({ user, size = 'md' }) => {
  if (!user) return null;
  const initials = (user.displayName || user.username || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-medium text-paper shrink-0`}
      style={{ backgroundColor: user.avatarColor || '#7A2E3B' }}
      title={user.displayName}
    >
      {initials}
    </div>
  );
};

export default Avatar;
