// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorDashboard from './SupervisorDashboard';
import AdminDashboard from './AdminDashboard';
import InspectorDashboard from './InspectorDashboard';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token no válido');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error al verificar el token:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {user.role === 'admin' ? (
        <AdminDashboard onLogout={onLogout} role={user.role} />
      ) : user.role === 'supervisor' ? (
        <SupervisorDashboard onLogout={onLogout} role={user.role} />
      ) : user.role === 'inspector' ? (
        <InspectorDashboard onLogout={onLogout} role={user.role} />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
            <p className="text-red-500">No tienes un rol válido para acceder a este panel.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;