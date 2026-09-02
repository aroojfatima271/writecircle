import React from 'react';

const EmptyState = ({ title, description, action }) => (
  <div className="text-center py-16 px-6 border border-dashed border-ink/15 rounded-sm bg-white/40">
    <h3 className="font-display text-xl text-ink mb-1.5">{title}</h3>
    {description && <p className="text-muted text-sm max-w-sm mx-auto mb-5">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
