import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import GenreBadge from '../components/GenreBadge';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/users/${user.username}`)
      .then(({ data }) => setMyProjects(data.data.projects))
      .finally(() => setLoading(false));
  }, [user.username]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-4xl text-ink">Welcome back, {user.displayName.split(' ')[0]}</h1>
        <Link to="/new-project" className="btn-primary text-sm">New project</Link>
      </div>
      <p className="text-muted mb-10">
        {user.stats.critiquesGiven} critiques given · {user.stats.critiquesReceived} critiques received
      </p>

      <h2 className="font-display text-2xl text-ink mb-4">Your projects</h2>
      {loading ? (
        <Loading />
      ) : !myProjects || myProjects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Start your first story and add a chapter to get feedback from the community."
          action={<Link to="/new-project" className="btn-primary">Start a project</Link>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {myProjects.map((p) => (
            <Link key={p._id} to={`/projects/${p.slug}`} className="card p-5 hover:border-ink/25 transition-colors">
              <div className="w-full h-1.5 rounded-full mb-3" style={{ backgroundColor: p.coverAccent }} />
              <div className="flex items-center gap-2 mb-2">
                <GenreBadge genre={p.genre} />
                <StatusBadge status={p.status} />
              </div>
              <h3 className="font-display text-lg text-ink mb-1">{p.title}</h3>
              <p className="text-xs text-muted">{p.chapterCount} chapters · {p.followerCount} following</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
