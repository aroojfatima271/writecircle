import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import GenreBadge from '../components/GenreBadge';
import StatusBadge from '../components/StatusBadge';

const WriterProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data.data.profile);
        setProjects(data.data.projects);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <Loading full />;
  if (!profile) return <EmptyState title="Writer not found" />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <div className="flex items-center gap-4 mb-3">
        <Avatar user={profile} size="lg" />
        <div>
          <h1 className="font-display text-3xl text-ink">{profile.displayName}</h1>
          <p className="text-muted text-sm">@{profile.username}</p>
        </div>
      </div>
      {profile.bio && <p className="text-inkSoft max-w-prose mb-4">{profile.bio}</p>}
      {profile.genres?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {profile.genres.map((g) => <GenreBadge key={g} genre={g} />)}
        </div>
      )}
      <div className="flex items-center gap-6 text-sm text-muted mb-10 border-y border-ink/10 py-4">
        <span><strong className="text-ink">{profile.stats.critiquesGiven}</strong> critiques given</span>
        <span><strong className="text-ink">{profile.stats.critiquesReceived}</strong> critiques received</span>
        <span><strong className="text-ink">{projects.length}</strong> projects</span>
      </div>

      <h2 className="font-display text-2xl text-ink mb-4">Projects</h2>
      {projects.length === 0 ? (
        <EmptyState title="No public projects yet" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p.slug}`} className="card p-4 hover:border-ink/25 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <GenreBadge genre={p.genre} />
                <StatusBadge status={p.status} />
              </div>
              <h3 className="font-display text-lg text-ink mb-1">{p.title}</h3>
              <p className="text-sm text-inkSoft line-clamp-2">{p.synopsis}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WriterProfile;
