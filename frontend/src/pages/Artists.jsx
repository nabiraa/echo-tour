import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { artistAPI } from '../utils/api';

const EMPTY_FORM = { stageName: '', realName: '', nationality: 'South Korea', agency: '', genre: 'K-Pop', debutYear: 2020 };

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await artistAPI.getAll({ search: search || undefined });
      setArtists(res.data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, genre: form.genre.split(',').map(g => g.trim()) };
      if (editing) {
        await artistAPI.update(editing._id, payload);
        toast.success('Artist updated!');
      } else {
        await artistAPI.create(payload);
        toast.success('Artist created!');
      }
      setShowForm(false); setEditing(null); setForm(EMPTY_FORM); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this artist?')) return;
    try { await artistAPI.delete(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const startEdit = (a) => {
    setEditing(a);
    setForm({ stageName: a.stageName, realName: a.realName || '', nationality: a.nationality, agency: a.agency, genre: a.genre?.join(', ') || 'K-Pop', debutYear: a.debutYear || 2020 });
    setShowForm(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Artists</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); }} className="btn-primary">+ Add Artist</button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input className="input max-w-sm" placeholder="Search artists..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        <button className="btn-secondary" onClick={load}>Search</button>
      </div>

      {/* Artist Form */}
      {showForm && (
        <div className="card border border-[#9b59d6]/40">
          <h3 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit Artist' : 'Add New Artist'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Stage Name *</label><input className="input" required value={form.stageName} onChange={e => setForm({ ...form, stageName: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Real Name</label><input className="input" value={form.realName} onChange={e => setForm({ ...form, realName: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Nationality *</label><input className="input" required value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Agency *</label><input className="input" required value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Genre (comma-separated)</label><input className="input" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Debut Year</label><input className="input" type="number" value={form.debutYear} onChange={e => setForm({ ...form, debutYear: parseInt(e.target.value) })} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Save Artist</button>
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Artists Grid */}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {artists.map(a => (
            <div key={a._id} className="card hover:border-[#9b59d6]/40 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#9b59d6] flex items-center justify-center text-xl font-bold text-white">
                  {a.stageName?.[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{a.stageName}</div>
                  <div className="text-xs text-gray-500">{a.agency}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Nationality</span><span className="text-gray-300">{a.nationality}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Debut</span><span className="text-gray-300">{a.debutYear || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Members</span><span className="text-gray-300">{a.members?.length || 0}</span></div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.genre?.map(g => <span key={g} className="badge bg-purple-900/40 text-purple-400">{g}</span>)}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => startEdit(a)} className="btn-secondary text-xs flex-1">Edit</button>
                <button onClick={() => handleDelete(a._id)} className="btn-danger text-xs flex-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
