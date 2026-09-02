import React from 'react';

const statusStyles = {
  drafting: 'bg-ink/5 text-inkSoft',
  'seeking-feedback': 'bg-gold/15 text-[#8a6c15]',
  completed: 'bg-pine/15 text-pine',
  archived: 'bg-ink/5 text-muted',
};

const statusLabels = {
  drafting: 'Drafting',
  'seeking-feedback': 'Seeking feedback',
  completed: 'Completed',
  archived: 'Archived',
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[status] || statusStyles.drafting}`}>
    {statusLabels[status] || status}
  </span>
);

export default StatusBadge;
