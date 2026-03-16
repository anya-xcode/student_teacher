import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api';

export default function TeacherDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [editId, setEditId] = useState(null);
  const [subs, setSubs] = useState(null); // { assignmentId, list }
  const [error, setError] = useState('');

  const fetch = async () => {
    const params = filter !== 'All' ? { status: filter } : {};
    const { data } = await api.get('/api/assignments', { params });
    setAssignments(data);
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.dueDate) return setError('All fields required');
    try {
      if (editId) {
        await api.put(`/api/assignments/${editId}`, form);
        setEditId(null);
      } else {
        await api.post('/api/assignments', form);
      }
      setForm({ title: '', description: '', dueDate: '' });
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const changeStatus = async (id, status) => {
    await api.patch(`/api/assignments/${id}/status`, { status });
    fetch();
  };

  const deleteA = async (id) => {
    await api.delete(`/api/assignments/${id}`);
    fetch();
  };

  const viewSubs = async (id) => {
    const { data } = await api.get(`/api/assignments/${id}/submissions`);
    setSubs({ id, list: data });
  };

  const markReviewed = async (subId) => {
    await api.patch(`/api/submissions/${subId}/review`);
    viewSubs(subs.id);
  };

  const startEdit = (a) => {
    setEditId(a._id);
    setForm({ title: a.title, description: a.description, dueDate: a.dueDate.slice(0, 10) });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const statusColor = { Draft: 'bg-yellow-100 text-yellow-700', Published: 'bg-green-100 text-green-700', Completed: 'bg-gray-200 text-gray-600' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Teacher Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {auth.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-lg mb-3">{editId ? 'Edit' : 'Create'} Assignment</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                {editId ? 'Update' : 'Create'}
              </button>
              {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', dueDate: '' }); }} className="w-full text-sm text-gray-500 hover:underline">Cancel</button>}
            </form>
          </div>
        </div>

        {/* Right: Assignments List */}
        <div className="md:col-span-2">
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['All', 'Draft', 'Published', 'Completed'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm font-medium transition ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {s}
              </button>
            ))}
          </div>

          {assignments.length === 0 && <p className="text-gray-400 text-sm">No assignments found.</p>}

          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status]}`}>{a.status}</span>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {a.status === 'Draft' && (
                    <>
                      <button onClick={() => changeStatus(a._id, 'Published')} className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600">Publish</button>
                      <button onClick={() => startEdit(a)} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600">Edit</button>
                      <button onClick={() => deleteA(a._id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600">Delete</button>
                    </>
                  )}
                  {a.status === 'Published' && (
                    <button onClick={() => changeStatus(a._id, 'Completed')} className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600">Mark Completed</button>
                  )}
                  <button onClick={() => viewSubs(a._id)} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200">
                    Submissions ({a.submissionCount || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Modal */}
      {subs && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSubs(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-lg mb-4">Submissions</h2>
            {subs.list.length === 0 && <p className="text-gray-400 text-sm">No submissions yet.</p>}
            {subs.list.map((s) => (
              <div key={s._id} className="border-b py-3 last:border-0">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{s.student?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{s.answer}</p>
                <div className="mt-1">
                  {s.reviewed
                    ? <span className="text-xs text-green-600">✓ Reviewed</span>
                    : <button onClick={() => markReviewed(s._id)} className="text-xs text-indigo-600 hover:underline">Mark Reviewed</button>
                  }
                </div>
              </div>
            ))}
            <button onClick={() => setSubs(null)} className="mt-4 w-full text-sm text-gray-500 hover:underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
