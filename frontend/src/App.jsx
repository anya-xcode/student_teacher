import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    return token ? { token, role, name } : null;
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);
    setAuth(data);
  };

  const logout = () => {
    localStorage.clear();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children, role }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" />;
  if (role && auth.role !== role) return <Navigate to={`/${auth.role}`} />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
