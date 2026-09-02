import React from 'react';

// A five-point rating control. Read-only mode renders filled/empty dots;
// interactive mode is used inside the critique form.
const StarRating = ({ value, onChange, label, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-between gap-3">
      {label && <span className="text-sm text-inkSoft w-24 shrink-0">{label}</span>}
      <div className="flex gap-1">
        {stars.map((s) => (
          <button
            type="button"
            key={s}
            disabled={readOnly}
            onClick={() => onChange && onChange(s)}
            className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center transition-colors ${
              s <= value ? 'bg-gold border-gold text-ink' : 'border-ink/20 text-transparent'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-gold'}`}
          >
            •
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
