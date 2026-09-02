import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import GenreBadge from '../components/GenreBadge';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import Pagination from '../components/Pagination';

const GENRES = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Literary Fiction', 'Horror', 'Historical Fiction', 'Young Adult', 'Poetry', 'Non-Fiction', 'Other'];

const Explore = () => {
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const genre = params.get('genre') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    api
      .get('/projects', { params: { search: params.get('search') || '', genre, sort, page, limit: 9 } })
      .then(({ data }) => {
        setProjects(data.data);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', search);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <h1 className="font-display text-4xl text-ink mb-2">Explore stories</h1>
      <p className="text-muted mb-8">Search, filter by genre, and find drafts that want a reader.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            className="input-field"
            placeholder="Search titles, synopses, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select className="input-field md:w-48" value={genre} onChange={(e) => updateParam('genre', e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="input-field md:w-48" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most-followed">Most followed</option>
          <option value="most-chapters">Most chapters</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No stories match yet" description="Try a different genre or search term." />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p.slug}`} className="card p-5 hover:border-ink/25 transition-colors flex flex-col">
                <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: p.coverAccent }} />
                <div className="flex items-center gap-2 mb-2">
                  <GenreBadge genre={p.genre} />
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="font-display text-lg text-ink mb-1.5 leading-snug">{p.title}</h3>
                <p className="text-sm text-inkSoft line-clamp-3 mb-4 flex-1">{p.synopsis}</p>
                <div className="flex items-center justify-between pt-3 border-t border-ink/10">
                  <div className="flex items-center gap-2">
                    <Avatar user={p.author} size="sm" />
                    <span className="text-xs text-muted">{p.author?.displayName}</span>
                  </div>
                  <span className="text-xs text-muted">{p.chapterCount} ch · {p.followerCount} following</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
};

export default Explore;
