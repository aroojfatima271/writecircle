import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const ACCENTS = ['#7A2E3B', '#3F6656', '#C9A227', '#1B1E2B'];

const Circles = () => {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', genreFocus: '', isPrivate: false, coverAccent: ACCENTS[0] });
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/circles', { params: { limit: 30 } }).then(({ data }) => setCircles(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.post('/circles', form);
      toast.success('Circle created');
      setShowForm(false);
      setForm({ name: '', description: '', genreFocus: '', isPrivate: false, coverAccent: ACCENTS[0] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create circle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="font-display text-4xl text-ink">Writing circles</h1>
        <button onClick={() => (user ? setShowForm((s) => !s) : navigate('/login'))} className="btn-primary text-sm">
          {showForm ? 'Cancel' : 'Start a circle'}
        </button>
      </div>
      <p className="text-muted mb-8">Join a group built around your genre — smaller rooms mean better feedback.</p>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-10 space-y-4 max-w-lg">
          <input required className="input-field" placeholder="Circle name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea required className="input-field" rows={3} placeholder="What's this circle for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input-field" placeholder="Genre focus (optional)" value={form.genreFocus} onChange={(e) => setForm({ ...form, genreFocus: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-inkSoft">
            <input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />
            Private circle
          </label>
          <button type="submit" className="btn-primary">Create circle</button>
        </form>
      )}

      {loading ? <Loading /> : circles.length === 0 ? (
        <EmptyState title="No circles yet" description="Be the first to start one." />
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {circles.map((c) => (
            <Link key={c._id} to={`/circles/${c.slug}`} className="card p-5 hover:border-ink/25 transition-colors">
              <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: c.coverAccent }} />
              <h3 className="font-display text-lg text-ink mb-1.5">{c.name}</h3>
              <p className="text-sm text-inkSoft line-clamp-2 mb-4">{c.description}</p>
              <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-ink/10">
                <span>{c.genreFocus}</span>
                <span>{c.memberCount} member{c.memberCount === 1 ? '' : 's'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Circles;
