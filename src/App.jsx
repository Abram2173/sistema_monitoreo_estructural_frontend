// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import InspectorDashboard from './components/InspectorDashboard';

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');
  const [role, setRole] = useState(sessionStorage.getItem('role') || '');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        const userRole = response.data.role;
        setRole(userRole);
        sessionStorage.setItem('role', userRole);
        setIsAuthenticated(true);
        if (userRole === 'admin' && window.location.pathname !== '/dashboard') {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error al validar token:', err.response?.data || err.message);
        setIsAuthenticated(false);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post('http://localhost:8000/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err.response?.data || err.message);
    }
    setToken('');
    setRole('');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {isAuthenticated ? (
          <>
            {role === 'admin' && <Route path="/dashboard" element={<AdminDashboard onLogout={handleLogout} role={role} />} />}
            {role === 'supervisor' && <Route path="/dashboard" element={<SupervisorDashboard onLogout={handleLogout} role={role} />} />}
            {role === 'inspector' && <Route path="/dashboard" element={<InspectorDashboard onLogout={handleLogout} role={role} />} />}
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="*" element={<Login setToken={setToken} />} />
          </>
        ) : (
          <Route path="*" element={<Login setToken={setToken} />} />
        )}
      </Routes>
    </div>
  );
};

export default App;