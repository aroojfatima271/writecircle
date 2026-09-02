import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const StatCard = ({ label, value }) => (
  <div className="card p-5">
    <p className="text-xs text-muted mb-1">{label}</p>
    <p className="font-display text-3xl text-ink">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = () => {
    setLoading(true);
    api.get('/admin/stats').then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  };

  const loadUsers = (search = '') => {
    setLoading(true);
    api.get('/admin/users', { params: { search, limit: 25 } }).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };

  const loadReports = () => {
    setLoading(true);
    api.get('/admin/reports', { params: { status: 'open' } }).then(({ data }) => setReports(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'overview') loadOverview();
    if (tab === 'users') loadUsers();
    if (tab === 'reports') loadReports();
  }, [tab]);

  const handleBanToggle = async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/ban`);
    setUsers((us) => us.map((u) => (u._id === id ? { ...u, isBanned: data.isBanned } : u)));
    toast.success(data.isBanned ? 'User suspended' : 'User reinstated');
  };

  const handleResolve = async (id, status) => {
    await api.patch(`/admin/reports/${id}`, { status });
    setReports((rs) => rs.filter((r) => r._id !== id));
    toast.success(`Report ${status}`);
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <h1 className="font-display text-4xl text-ink mb-1">Admin panel</h1>
      <p className="text-muted mb-8">Community health, at a glance.</p>

      <div className="flex gap-1 border-b border-ink/10 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-wine text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : tab === 'overview' && stats ? (
        <div>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <StatCard label="Writers" value={stats.userCount} />
            <StatCard label="Projects" value={stats.projectCount} />
            <StatCard label="Circles" value={stats.circleCount} />
            <StatCard label="Critiques given" value={stats.critiqueCount} />
            <StatCard label="Open reports" value={stats.openReports} />
            <StatCard label="Suspended accounts" value={stats.bannedCount} />
          </div>
          <h2 className="font-display text-2xl text-ink mb-4">Projects by genre</h2>
          <div className="space-y-2">
            {stats.genreBreakdown.map((g) => (
              <div key={g._id} className="flex items-center gap-3">
                <span className="text-sm text-inkSoft w-40">{g._id}</span>
                <div className="flex-1 bg-ink/5 rounded-full h-2">
                  <div
                    className="bg-wine h-2 rounded-full"
                    style={{ width: `${(g.count / stats.projectCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'users' ? (
        <div>
          <form onSubmit={(e) => { e.preventDefault(); loadUsers(userSearch); }} className="flex gap-2 mb-6 max-w-sm">
            <input className="input-field" placeholder="Search by username or email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            <button type="submit" className="btn-secondary">Search</button>
          </form>
          <div className="card divide-y divide-ink/10">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{u.displayName} <span className="text-muted font-normal">@{u.username}</span></p>
                  <p className="text-xs text-muted">{u.email} · {u.role}{u.isBanned ? ' · suspended' : ''}</p>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => handleBanToggle(u._id)} className={`text-xs px-3 py-1.5 rounded-full border ${u.isBanned ? 'border-pine text-pine' : 'border-wine text-wine'}`}>
                    {u.isBanned ? 'Reinstate' : 'Suspend'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <EmptyState title="No open reports" description="The queue is clear." />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="card p-4">
                <p className="text-sm text-ink mb-1">
                  <strong>{r.targetType}</strong> reported by {r.reporter?.displayName || 'a user'}
                </p>
                <p className="text-sm text-inkSoft mb-3">{r.reason}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleResolve(r._id, 'resolved')} className="text-xs px-3 py-1.5 rounded-full border border-pine text-pine">Resolve</button>
                  <button onClick={() => handleResolve(r._id, 'dismissed')} className="text-xs px-3 py-1.5 rounded-full border border-ink/20 text-muted">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};

export default AdminDashboard;
