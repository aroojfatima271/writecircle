import React from 'react';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        className="btn-secondary !px-3 !py-1.5 text-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-muted px-2">Page {page} of {pages}</span>
      <button
        className="btn-secondary !px-3 !py-1.5 text-sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
