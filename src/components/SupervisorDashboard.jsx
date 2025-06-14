// src/components/SupervisorDashboard.jsx
import React, { useState } from 'react';
import ReportList from './ReportList';
import logo from '../assets/logo.png';
import { FaSignOutAlt, FaSyncAlt } from 'react-icons/fa';

const SupervisorDashboard = ({ token, onLogout, role }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (role !== 'supervisor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-red-500">No tienes permiso para acceder a este panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-black text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
          <h1 className="text-xl font-bold">Panel de Supervisor</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <FaSyncAlt className="mr-2" />
            Actualizar
          </button>
          <button
            onClick={onLogout}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            <FaSignOutAlt className="mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="p-6">
        <ReportList token={token} key={refreshKey} />
      </div>
    </div>
  );
};

export default SupervisorDashboard;