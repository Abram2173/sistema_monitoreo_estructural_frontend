import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import SupervisorDashboard from './components/SupervisorDashboard';
import InspectorDashboard from './components/InspectorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');
  const [role, setRole] = useState(sessionStorage.getItem('role') || '');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = useCallback(async (idToken) => {
    try {
      const startTime = performance.now();
      const response = await axios.get('http://127.0.0.1:8001/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 5000, // Tiempo de espera de 5 segundos
      });
      const userRole = response.data.role;
      console.log('Rol obtenido:', userRole);
      console.log(`Tiempo para obtener el rol: ${(performance.now() - startTime) / 1000} segundos`);
      setRole(userRole);
      sessionStorage.setItem('role', userRole);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error al obtener el rol del usuario:", err.response?.data || err);
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const storedToken = sessionStorage.getItem('token');
        const storedRole = sessionStorage.getItem('role');
        if (storedToken && storedRole) {
          setToken(storedToken);
          setRole(storedRole);
          setLoading(false);
          navigate('/dashboard');
        } else {
          try {
            const startTime = performance.now();
            const idToken = await Promise.race([
              user.getIdToken(true),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)), // Tiempo de espera de 5 segundos
            ]);
            console.log(`Tiempo para obtener el token de Firebase: ${(performance.now() - startTime) / 1000} segundos`);
            sessionStorage.setItem('token', idToken);
            setToken(idToken);
            fetchUserRole(idToken);
          } catch (error) {
            console.error("Error al obtener el token de Firebase:", error);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            setToken('');
            setRole('');
            setLoading(false);
            navigate('/login');
          }
        }
      } else {
        console.log('No hay usuario autenticado');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        setToken('');
        setRole('');
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, fetchUserRole]);

  const handleLogout = () => {
    auth.signOut();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setToken('');
    setRole('');
    navigate('/login');
  };

  const AppContent = () => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    if (!token) {
      return <Login setToken={setToken} />;
    }

    console.log('Renderizando AppContent con role:', role);
    return (
      <div>
        <Routes>
          {role === "admin" && (
            <Route path="/dashboard" element={<AdminDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          {role === "supervisor" && (
            <Route path="/dashboard" element={<SupervisorDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          {role === "inspector" && (
            <Route path="/dashboard" element={<InspectorDashboard token={token} onLogout={handleLogout} role={role} />} />
          )}
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gris-claro">
      <AppContent />
    </div>
  );
};

export default App;