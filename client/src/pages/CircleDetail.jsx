import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import GenreBadge from '../components/GenreBadge';
import { useAuth } from '../context/AuthContext';

const CircleDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/circles/${slug}`)
      .then(({ data }) => {
        setCircle(data.data);
        return api.get('/projects', { params: { circle: data.data._id, limit: 12 } });
      })
      .then(({ data }) => setProjects(data.data))
      .catch(() => setCircle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const isMember = user && circle?.members?.some((m) => String(m.user._id) === String(user.id));

  const handleJoinLeave = async () => {
    if (!user) return navigate('/login');
    try {
      if (isMember) await api.post(`/circles/${circle._id}/leave`);
      else await api.post(`/circles/${circle._id}/join`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  if (loading) return <Loading full />;
  if (!circle) return <EmptyState title="Circle not found" />;

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: circle.coverAccent }} />
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs text-muted mb-2">{circle.genreFocus} · {circle.memberCount} members</p>
          <h1 className="font-display text-4xl text-ink mb-3">{circle.name}</h1>
          <p className="text-inkSoft max-w-prose">{circle.description}</p>
        </div>
        <button onClick={handleJoinLeave} className={isMember ? 'btn-secondary' : 'btn-primary'}>
          {isMember ? 'Leave circle' : 'Join circle'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-ink mb-4">Projects in this circle</h2>
          {projects.length === 0 ? (
            <EmptyState title="No projects here yet" description="Members can attach a project to this circle when creating it." />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <Link key={p._id} to={`/projects/${p.slug}`} className="card p-4 flex items-center justify-between hover:border-ink/25 transition-colors">
                  <div>
                    <GenreBadge genre={p.genre} />
                    <h3 className="font-display text-lg text-ink mt-1.5">{p.title}</h3>
                  </div>
                  <span className="text-xs text-muted">{p.chapterCount} ch</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl text-ink mb-4">Members</h2>
          <div className="space-y-3">
            {circle.members.map((m) => (
              <Link key={m.user._id} to={`/writers/${m.user.username}`} className="flex items-center gap-2">
                <Avatar user={m.user} size="sm" />
                <span className="text-sm text-inkSoft">{m.user.displayName}</span>
                {m.role === 'moderator' && <span className="text-xs text-gold">· mod</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleDetail;
