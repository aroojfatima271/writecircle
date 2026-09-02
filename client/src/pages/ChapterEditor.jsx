import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';

const ChapterEditor = () => {
  const { chapterId, projectId, slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(chapterId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorNote, setAuthorNote] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [projectSlug, setProjectSlug] = useState(slug || '');

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/chapters/${chapterId}`).then(({ data }) => {
      setTitle(data.data.title);
      setContent(data.data.content);
      setAuthorNote(data.data.authorNote || '');
      setStatus(data.data.status);
      setProjectSlug(data.data.project.slug);
      setLoading(false);
    });
  }, [chapterId, isEditing]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleSave = async (publish) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    const nextStatus = publish ? 'published' : status === 'published' ? 'published' : 'draft';
    try {
      if (isEditing) {
        await api.patch(`/chapters/${chapterId}`, { title, content, authorNote, status: nextStatus });
        toast.success('Chapter saved');
        navigate(`/projects/${projectSlug}/chapters/${chapterId}`);
      } else {
        await api.post(`/projects/${projectId}/chapters`, { title, content, authorNote, status: nextStatus });
        toast.success(publish ? 'Chapter published' : 'Draft saved');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save chapter');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading full />;

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="font-display text-3xl text-ink mb-1">{isEditing ? 'Edit chapter' : 'New chapter'}</h1>
      <p className="text-muted text-sm mb-8">{wordCount.toLocaleString()} words · edits are versioned automatically</p>

      <div className="space-y-5">
        <input
          className="input-field font-display text-xl"
          placeholder="Chapter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input-field font-display leading-relaxed"
          rows={18}
          placeholder="Write your chapter here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div>
          <label className="block text-sm text-inkSoft mb-1.5">Author's note (optional, shown above the chapter)</label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Anything you want reviewers to know before they read?"
            value={authorNote}
            onChange={(e) => setAuthorNote(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary">
            {saving ? 'Saving…' : 'Save as draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary">
            {saving ? 'Publishing…' : 'Publish for feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterEditor;
