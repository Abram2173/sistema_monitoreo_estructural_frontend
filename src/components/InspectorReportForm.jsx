import React, { useState, useEffect } from 'react';
import InspectorReportForm from './InspectorReportForm';
import axios from 'axios';

const InspectorDashboard = ({ token, onLogout }) => {
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
    <div className="bg-gris-claro p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gris-oscuro">Panel de Inspector</h1>
        <button
          onClick={onLogout}
          className="bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Sección de perfil */}
      <div className="mb-6 bg-blanco p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gris-oscuro mb-4">Mi Perfil</h2>
        {error && <p className="text-rojo mb-4">{error}</p>}
        {profile ? (
          <div>
            <p><strong>Usuario:</strong> {profile.username}</p>
            <p><strong>Rol:</strong> {profile.role}</p>
          </div>
        ) : (
          <p className="text-gray-500">Cargando perfil...</p>
        )}
      </div>

      {/* Formulario para subir reportes */}
      <div className="w-full">
        <InspectorReportForm token={token} />
      </div>
    </div>
  );
};

export default InspectorDashboard;