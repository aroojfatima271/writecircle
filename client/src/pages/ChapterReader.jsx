import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const emptyRatings = { plot: 0, characters: 0, pacing: 0, prose: 0 };

const ChapterReader = () => {
  const { slug, chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [critiques, setCritiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState(emptyRatings);
  const [overallComment, setOverallComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/chapters/${chapterId}`)
      .then(({ data }) => {
        setChapter(data.data);
        return api.get(`/chapters/${chapterId}/critiques`);
      })
      .then(({ data }) => setCritiques(data.data))
      .catch(() => setChapter(null))
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => { load(); }, [load]);

  const isAuthor = user && chapter && String(user.id) === String(chapter.project.author._id);
  const alreadyReviewed = user && critiques.some((c) => String(c.reviewer._id) === String(user.id));

  const handleSubmitCritique = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (Object.values(ratings).some((v) => v === 0)) {
      toast.error('Please rate all four categories');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/chapters/${chapterId}/critiques`, { ratings, overallComment });
      setCritiques((c) => [data.data, ...c]);
      setChapter((ch) => ({ ...ch, critiqueCount: ch.critiqueCount + 1 }));
      setRatings(emptyRatings);
      setOverallComment('');
      toast.success('Critique submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit critique');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (critiqueId) => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/critiques/${critiqueId}/helpful`);
    setCritiques((cs) => cs.map((c) => (c._id === critiqueId ? { ...c, helpfulVotes: data.marked ? [...c.helpfulVotes, user.id] : c.helpfulVotes.filter((v) => v !== user.id) } : c)));
  };

  if (loading) return <Loading full />;
  if (!chapter) return <EmptyState title="Chapter not found" />;

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <Link to={`/projects/${slug}`} className="text-sm text-wine hover:underline mb-6 inline-block">
        ← Back to {chapter.project.title}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-muted mb-1">Chapter {chapter.order}</p>
          <h1 className="font-display text-3xl text-ink">{chapter.title}</h1>
        </div>
        {isAuthor && (
          <Link to={`/projects/${slug}/chapters/${chapterId}/edit`} className="btn-secondary text-sm">Edit</Link>
        )}
      </div>

      {chapter.authorNote && (
        <div className="bg-gold/10 border border-gold/30 rounded-sm p-4 mb-8 text-sm text-inkSoft italic">
          <span className="font-medium not-italic text-ink">Author's note: </span>{chapter.authorNote}
        </div>
      )}

      <article className="prose-chapter font-display text-lg leading-relaxed text-ink whitespace-pre-line max-w-prose mb-16">
        {chapter.content}
      </article>

      <div className="border-t border-ink/10 pt-10">
        <h2 className="font-display text-2xl text-ink mb-6">
          Critiques <span className="text-muted text-base font-body">({critiques.length})</span>
        </h2>

        {!isAuthor && user && !alreadyReviewed && (
          <form onSubmit={handleSubmitCritique} className="card p-6 mb-8 space-y-4">
            <h3 className="font-medium text-ink">Leave a structured critique</h3>
            <StarRating label="Plot" value={ratings.plot} onChange={(v) => setRatings((r) => ({ ...r, plot: v }))} />
            <StarRating label="Characters" value={ratings.characters} onChange={(v) => setRatings((r) => ({ ...r, characters: v }))} />
            <StarRating label="Pacing" value={ratings.pacing} onChange={(v) => setRatings((r) => ({ ...r, pacing: v }))} />
            <StarRating label="Prose" value={ratings.prose} onChange={(v) => setRatings((r) => ({ ...r, prose: v }))} />
            <textarea
              className="input-field"
              rows={4}
              placeholder="What worked? What would make the next draft stronger? (min 10 characters)"
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
              required
              minLength={10}
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting…' : 'Submit critique'}
            </button>
          </form>
        )}
        {isAuthor && (
          <p className="text-sm text-muted mb-8">You can't critique your own chapter — but you'll be notified when others do.</p>
        )}
        {alreadyReviewed && <p className="text-sm text-muted mb-8">You've already critiqued this chapter. Thank you!</p>}
        {!user && <p className="text-sm text-muted mb-8"><Link to="/login" className="text-wine hover:underline">Log in</Link> to leave a critique.</p>}

        {critiques.length === 0 ? (
          <EmptyState title="No critiques yet" description="Be the first to give this chapter feedback." />
        ) : (
          <div className="space-y-6">
            {critiques.map((c) => (
              <div key={c._id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar user={c.reviewer} size="sm" />
                    <span className="text-sm font-medium text-ink">{c.reviewer.displayName}</span>
                    <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <StarRating label="Plot" value={c.ratings.plot} readOnly />
                  <StarRating label="Characters" value={c.ratings.characters} readOnly />
                  <StarRating label="Pacing" value={c.ratings.pacing} readOnly />
                  <StarRating label="Prose" value={c.ratings.prose} readOnly />
                </div>
                <p className="text-sm text-inkSoft leading-relaxed mb-3">{c.overallComment}</p>
                {c.lineComments?.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {c.lineComments.map((lc, i) => (
                      <div key={i} className="bg-ink/5 rounded-sm p-3 text-xs">
                        <p className="italic text-muted mb-1">"{lc.quote}"</p>
                        <p className="text-inkSoft">{lc.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => handleHelpful(c._id)} className="text-xs text-muted hover:text-wine">
                  ⌣ Helpful ({c.helpfulVotes.length})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterReader;
