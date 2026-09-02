import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Literary Fiction', 'Horror', 'Historical Fiction', 'Young Adult', 'Poetry', 'Non-Fiction'];

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', displayName: '', password: '', bio: '' });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleGenre = (g) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, genres });
      toast.success('Account created — welcome to WriteCircle');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Join WriteCircle</h1>
      <p className="text-muted text-sm mb-8">Set up your writer profile in under a minute.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-inkSoft mb-1.5">Username</label>
            <input required className="input-field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="maya_ink" />
          </div>
          <div>
            <label className="block text-sm text-inkSoft mb-1.5">Display name</label>
            <input required className="input-field" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Maya Alcaraz" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Email</label>
          <input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Password</label>
          <input type="password" required minLength={8} className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Short bio (optional)</label>
          <textarea className="input-field" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What do you write?" />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-2">Genres you write (optional)</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleGenre(g)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  genres.includes(g) ? 'bg-wine text-paper border-wine' : 'border-ink/15 text-inkSoft hover:border-ink/40'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Already have an account? <Link to="/login" className="text-wine hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
