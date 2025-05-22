import React, { useState, useEffect } from 'react';
import ReportList from './ReportList';
import axios from 'axios';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const SupervisorDashboard = ({ token, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/auth/me', { // Cambia esto a la URL de Heroku en producción
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error('Error al obtener el perfil:', err);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <div className="bg-gris-claro min-h-screen">
      {/* Barra de navegación superior */}
      <nav className="bg-azul-primary text-blanco p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <FaUser className="mr-2 text-xl" />
          <h1 className="text-xl font-bold">Panel de Supervisor</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
        >
          <FaSignOutAlt className="mr-2" />
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Sección de perfil */}
        <div className="mb-6 bg-blanco p-6 rounded-lg shadow-md flex items-center border border-gris-borde">
          <FaUser className="text-azul-secondary mr-4 text-3xl" />
          <div>
            <h2 className="text-xl font-bold text-gris-oscuro mb-2">Mi Perfil</h2>
            {error && <p className="text-rojo mb-2">{error}</p>}
            {profile ? (
              <div>
                <p className="text-gris-oscuro"><strong>Usuario:</strong> {profile.username}</p>
                <p className="text-gris-oscuro"><strong>Rol:</strong> {profile.role}</p>
              </div>
            ) : (
              <p className="text-gray-500">Cargando perfil...</p>
            )}
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-gris-oscuro mb-4">Lista de Reportes</h2>
          <ReportList token={token} />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;