import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api';

export default function StudentDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({}); // { assignmentId: text }

  const fetch = async () => {
    const { data } = await api.get('/api/assignments');
    setAssignments(data);
  };

  useEffect(() => { fetch(); }, []);

  const submitAnswer = async (id) => {
    const answer = answers[id]?.trim();
    if (!answer) return;
    try {
      await api.post(`/api/assignments/${id}/submit`, { answer });
      setAnswers({ ...answers, [id]: '' });
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const isPastDue = (date) => new Date() > new Date(date);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Student Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {auth.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {assignments.length === 0 && <p className="text-gray-400 text-center mt-10">No published assignments available.</p>}

        {assignments.map((a) => (
          <div key={a._id} className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{a.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isPastDue(a.dueDate) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4">
              {a.mySubmission ? (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-indigo-600 mb-1">Your Submission</p>
                  <p className="text-sm text-gray-700">{a.mySubmission.answer}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(a.mySubmission.submittedAt).toLocaleString()}</p>
                </div>
              ) : isPastDue(a.dueDate) ? (
                <p className="text-sm text-red-500">Deadline has passed — submission closed.</p>
              ) : (
                <div className="flex gap-2">
                  <textarea
                    value={answers[a._id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [a._id]: e.target.value })}
                    placeholder="Type your answer..."
                    rows={2}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => submitAnswer(a._id)}
                    className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition self-end"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
