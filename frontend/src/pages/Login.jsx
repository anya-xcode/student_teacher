import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) navigate(`/${auth.role}`, { replace: true });
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data);
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] font-sans relative overflow-hidden text-gray-200">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>

      <div className="relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-10 w-full max-w-md mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Assignment Portal</h1>
          <p className="text-gray-400 text-sm font-medium">Please sign in to your internal account</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email address</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] text-white rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26a5.5 5.5 0 017.746 7.746l-1.536-1.536a3.5 3.5 0 00-4.674-4.674L7.968 6.553z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="login-btn"
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : 'Access Portal'}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <p className="text-xs text-center text-gray-500 font-medium">
            Demo Credentials:<br/>
            <span className="text-gray-400 inline-block mt-1">teacher@test.com / student1@test.com</span><br/>
            <span className="text-gray-400">Password: password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
