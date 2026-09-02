import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Literary Fiction', 'Horror', 'Historical Fiction', 'Young Adult', 'Poetry', 'Non-Fiction', 'Other'];
const ACCENTS = ['#7A2E3B', '#3F6656', '#C9A227', '#1B1E2B', '#5C2129'];

const NewProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', synopsis: '', genre: 'Fantasy', tags: '', circle: '', coverAccent: ACCENTS[0] });
  const [circles, setCircles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/circles', { params: { limit: 50 } }).then(({ data }) => setCircles(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/projects', {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        circle: form.circle || undefined,
      });
      toast.success('Project created — add your first chapter');
      navigate(`/projects/${data.data._id}/new-chapter`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-14">
      <h1 className="font-display text-3xl text-ink mb-2">Start a new project</h1>
      <p className="text-muted text-sm mb-8">Set up the story — you'll add chapters next.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Title</label>
          <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Synopsis (20–800 characters)</label>
          <textarea required minLength={20} className="input-field" rows={4} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-inkSoft mb-1.5">Genre</label>
            <select className="input-field" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-inkSoft mb-1.5">Circle (optional)</label>
            <select className="input-field" value={form.circle} onChange={(e) => setForm({ ...form, circle: e.target.value })}>
              <option value="">No circle</option>
              {circles.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Tags (comma separated)</label>
          <input className="input-field" placeholder="magic-system, found-family" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-inkSoft mb-2">Cover accent</label>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setForm({ ...form, coverAccent: a })}
                className={`w-8 h-8 rounded-full border-2 ${form.coverAccent === a ? 'border-ink' : 'border-transparent'}`}
                style={{ backgroundColor: a }}
              />
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </div>
  );
};

export default NewProject;
