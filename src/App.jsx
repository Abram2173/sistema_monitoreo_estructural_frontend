// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import InspectorDashboard from './components/InspectorDashboard';
import { auth, getIdToken } from './firebase'; // Importación corregida

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');
  const [role, setRole] = useState(sessionStorage.getItem('role') || '');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Interceptor para agregar el token a todas las solicitudes
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async config => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  const fetchUserRole = useCallback(async (idToken) => {
    try {
      const startTime = performance.now();
      const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000,
      });
      const userRole = response.data.role;
      console.log('Respuesta de /api/auth/me:', response.data);
      console.log('Rol obtenido:', userRole);
      console.log(`Tiempo para obtener el rol: ${(performance.now() - startTime) / 1000} segundos`);
      setRole(userRole);
      sessionStorage.setItem('role', userRole);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      console.error("Error al obtener el rol del usuario:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        const user = auth.currentUser;
        if (user) {
          const newToken = await getIdToken(user, true);
          sessionStorage.setItem('token', newToken);
          setToken(newToken);
          await fetchUserRole(newToken); // Reintentar con el nuevo token
          return;
        }
      }
      setError(err.response?.data?.detail || 'Error al autenticar. Por favor, inicia sesión nuevamente.');
      setToken('');
      setRole('');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      setIsAuthenticated(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchUserRole(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserRole, token]);

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Error al cerrar sesión en el backend:", err.response?.data || err.message);
    }
    setToken('');
    setRole('');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setIsAuthenticated(false);
    setError('');
    navigate('/login');
  };

  const AppContent = () => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError('');
                navigate('/login');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Login setToken={setToken} />;
    }

    console.log('Renderizando AppContent con token:', token);
    console.log('Renderizando AppContent con role:', role);
    return (
      <div>
        <Routes>
          {role === 'admin' && (
            <Route path="/dashboard" element={<AdminDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          {role === 'supervisor' && (
            <Route path="/dashboard" element={<SupervisorDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          {role === 'inspector' && (
            <Route path="/dashboard" element={<InspectorDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <AppContent />
    </div>
  );
};

export default App;