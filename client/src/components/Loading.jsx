import React from 'react';

const Loading = ({ full = false, label = 'Loading' }) => (
  <div className={full ? 'min-h-[60vh] flex items-center justify-center' : 'flex items-center justify-center py-12'}>
    <div className="flex items-center gap-3 text-muted">
      <span className="w-4 h-4 rounded-full border-2 border-wine border-t-transparent animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  </div>
);

export default Loading;
