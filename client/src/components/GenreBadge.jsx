import React from 'react';

const GenreBadge = ({ genre }) => (
  <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-ink/5 text-inkSoft border border-ink/10">
    {genre}
  </span>
);

export default GenreBadge;
