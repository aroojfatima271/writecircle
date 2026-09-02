import React from 'react';

const Footer = () => (
  <footer className="border-t border-ink/10 mt-24">
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="font-display text-lg text-ink">Write<span className="text-wine">Circle</span></p>
      <p className="text-sm text-muted">A workshop for writers — built as a MERN-stack portfolio project.</p>
    </div>
  </footer>
);

export default Footer;
