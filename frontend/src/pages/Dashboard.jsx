import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { concertAPI, artistAPI, ticketAPI } from '../utils/api';

const STATUS_COLORS = {
  Upcoming: 'bg-blue-900/40 text-blue-400',
  Ongoing: 'bg-green-900/40 text-green-400',
  Completed: 'bg-gray-700/40 text-gray-400',
  Cancelled: 'bg-red-900/40 text-red-400',
};

export default function Dashboard() {
  const [concerts, setConcerts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      concertAPI.getAll({ limit: 5, page: 1 }),
      artistAPI.getAll({ limit: 6 }),
    ]).then(([c, a]) => {
      setConcerts(c.data || []);
      setArtists(a.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const upcomingCount = concerts.filter(c => c.status === 'Upcoming').length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome to ECHO 🎵</h1>
        <p className="text-gray-400 mt-1">K-Pop World Tour Management Agency</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Artists', value: artists.length, icon: '🎤', color: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/20' },
          { label: 'Concerts', value: concerts.length, icon: '🎵', color: 'from-purple-500/20 to-cyan-500/20', border: 'border-purple-500/20' },
          { label: 'Upcoming Shows', value: upcomingCount, icon: '📅', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/20' },
          { label: 'Collections', value: '5', icon: '🗄️', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`card bg-gradient-to-br ${stat.color} border ${stat.border}`}>
            <div className="text-3xl">{stat.icon}</div>
            <div className="text-2xl font-bold text-white mt-2">{loading ? '...' : stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Concerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Concerts</h2>
            <Link to="/concerts" className="text-sm text-[#9b59d6] hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : (
            <div className="space-y-3">
              {concerts.map(c => (
                <Link key={c._id} to={`/concerts/${c._id}`} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] hover:bg-[#1e1e2e] transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white truncate max-w-48">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {c.artist?.stageName} • {c.venue?.city}
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[c.status] || 'bg-gray-700 text-gray-400'}`}>{c.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Artists */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Artists</h2>
            <Link to="/artists" className="text-sm text-[#9b59d6] hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {artists.map(a => (
                <div key={a._id} className="p-3 rounded-lg bg-[#0a0a0f] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#9b59d6] flex items-center justify-center text-sm font-bold text-white">
                    {a.stageName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{a.stageName}</div>
                    <div className="text-xs text-gray-500">{a.agency}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DB Feature Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">MongoDB Features Implemented</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Aggregation Pipelines', desc: 'Revenue per tour, attendance by country, monthly trends', icon: '⚙️' },
            { title: 'Atomic Concurrency Control', desc: '$inc with $gte:1 condition prevents ticket overselling', icon: '🔒' },
            { title: 'Multi-doc Transactions', desc: 'Ticket booking & seat decrement in single atomic transaction', icon: '💎' },
            { title: 'Geospatial Indexing', desc: '2dsphere index on venues with $near queries', icon: '🌍' },
            { title: 'Text Search Index', desc: 'Full-text search on artists, concerts', icon: '🔍' },
            { title: 'Embedded Documents', desc: 'Setlists, ticket tiers embedded inside Concert documents', icon: '📄' },
          ].map(f => (
            <div key={f.title} className="p-4 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
              <div className="text-xl mb-2">{f.icon}</div>
              <div className="text-sm font-semibold text-white">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
