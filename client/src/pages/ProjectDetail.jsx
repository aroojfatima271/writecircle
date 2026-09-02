import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import GenreBadge from '../components/GenreBadge';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/projects/${slug}`)
      .then(({ data }) => {
        setProject(data.data.project);
        setChapters(data.data.chapters);
        return api.get(`/projects/${data.data.project._id}/comments`);
      })
      .then(({ data }) => setComments(data.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const isAuthor = user && project && String(user.id) === String(project.author._id);
  const isFollowing = user && project?.followers?.includes(user.id);

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post(`/projects/${project._id}/follow`);
    setProject((p) => ({ ...p, followerCount: data.followerCount, followers: data.following ? [...(p.followers || []), user.id] : p.followers.filter((f) => f !== user.id) }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!commentBody.trim()) return;
    const { data } = await api.post(`/projects/${project._id}/comments`, { body: commentBody });
    setComments((c) => [data.data, ...c]);
    setCommentBody('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project and everything in it? This cannot be undone.')) return;
    await api.delete(`/projects/${project._id}`);
    toast.success('Project deleted');
    navigate('/dashboard');
  };

  if (loading) return <Loading full />;
  if (!project) return <EmptyState title="Project not found" description="It may have been removed." />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: project.coverAccent }} />
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GenreBadge genre={project.genre} />
            <StatusBadge status={project.status} />
            {project.circle && (
              <Link to={`/circles/${project.circle.slug}`} className="text-xs text-wine hover:underline">
                {project.circle.name}
              </Link>
            )}
          </div>
          <h1 className="font-display text-4xl text-ink mb-3">{project.title}</h1>
          <Link to={`/writers/${project.author.username}`} className="flex items-center gap-2 w-fit">
            <Avatar user={project.author} size="sm" />
            <span className="text-sm text-inkSoft">{project.author.displayName}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthor ? (
            <>
              <Link to={`/projects/${project._id}/new-chapter`} className="btn-primary text-sm">Add chapter</Link>
              <button onClick={handleDelete} className="btn-secondary text-sm !border-wine !text-wine">Delete</button>
            </>
          ) : (
            <button onClick={handleFollow} className={isFollowing ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
              {isFollowing ? 'Following' : 'Follow'} · {project.followerCount}
            </button>
          )}
        </div>
      </div>

      <p className="text-inkSoft leading-relaxed max-w-prose mb-6">{project.synopsis}</p>

      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((t) => <span key={t} className="text-xs text-muted">#{t}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-ink">Chapters</h2>
        <span className="text-sm text-muted">{project.totalWordCount.toLocaleString()} words total</span>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          title="No published chapters yet"
          description={isAuthor ? 'Add your first chapter to start collecting feedback.' : 'Check back soon.'}
        />
      ) : (
        <div className="space-y-2 mb-14">
          {chapters.map((c) => (
            <Link
              key={c._id}
              to={`/projects/${project.slug}/chapters/${c._id}`}
              className="card p-4 flex items-center justify-between hover:border-ink/25 transition-colors"
            >
              <div>
                <span className="text-xs text-muted">Chapter {c.order}</span>
                <h3 className="font-display text-lg text-ink">{c.title}</h3>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{c.wordCount.toLocaleString()} words</p>
                <p>{c.critiqueCount} critique{c.critiqueCount === 1 ? '' : 's'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-display text-2xl text-ink mb-4">Discussion</h2>
        <form onSubmit={handleComment} className="flex gap-2 mb-6">
          <input
            className="input-field"
            placeholder={user ? 'Leave an encouraging note or question…' : 'Log in to comment'}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            disabled={!user}
          />
          <button type="submit" className="btn-secondary" disabled={!user}>Post</button>
        </form>
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <Avatar user={c.author} size="sm" />
              <div>
                <p className="text-sm">
                  <span className="font-medium text-ink">{c.author.displayName}</span>{' '}
                  <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-inkSoft">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
