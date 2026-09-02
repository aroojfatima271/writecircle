import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-wine text-sm font-medium tracking-wide mb-4">A workshop, not a feed</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink mb-6">
            Finish the draft.<br />Get feedback that actually helps.
          </h1>
          <p className="text-inkSoft text-lg leading-relaxed mb-8 max-w-md">
            Post chapters, get critiques scored on plot, characters, pacing, and prose —
            not just "loved it!" — inside writing circles built around your genre.
          </p>
          <div className="flex items-center gap-4">
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary">
              {user ? 'Go to dashboard' : 'Start writing'}
            </Link>
            <Link to="/explore" className="btn-secondary">Explore stories</Link>
          </div>
        </div>
        <div className="relative">
          <div className="card p-6 rotate-1 shadow-sm">
            <p className="text-xs text-muted mb-2">Chapter 1 · The Wax Seal</p>
            <p className="font-display text-lg leading-relaxed text-ink mb-4">
              "The letter arrived on a Tuesday, which Maren would later think was the least
              dramatic day for her life to end."
            </p>
            <div className="border-t border-ink/10 pt-4 flex items-center gap-3">
              <span className="text-xs bg-gold/15 text-[#8a6c15] px-2 py-1 rounded-full">Prose 5/5</span>
              <span className="text-xs bg-pine/15 text-pine px-2 py-1 rounded-full">Pacing 5/5</span>
              <span className="text-xs text-muted">2 critiques</span>
            </div>
          </div>
          <div className="card p-5 -rotate-2 shadow-sm absolute -bottom-8 -left-8 w-56 hidden md:block bg-paperDim">
            <p className="text-xs text-muted mb-1">Fantasy Worldbuilders</p>
            <p className="font-display text-sm text-ink">42 writers building magic systems together</p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white/40">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-xl text-ink mb-2">Structured critique, not vibes</h3>
            <p className="text-inkSoft text-sm leading-relaxed">
              Every critique scores plot, characters, pacing, and prose separately, plus inline
              comments anchored to the exact line they're about.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink mb-2">Revision history, kept automatically</h3>
            <p className="text-inkSoft text-sm leading-relaxed">
              Every edit is versioned. Go back and see exactly how a chapter evolved — and
              what feedback prompted each change.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink mb-2">Circles, not a crowd</h3>
            <p className="text-inkSoft text-sm leading-relaxed">
              Join genre-focused writing circles so the people reading your fantasy draft
              actually read fantasy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
