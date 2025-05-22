import React from 'react';
import ReportList from './ReportList';
import logo from '../assets/logo.png';
import { FaSignOutAlt } from 'react-icons/fa';

const InspectorDashboard = ({ token, onLogout }) => {
  return (
    <div className="bg-gris-claro min-h-screen">
      <nav className="bg-black text-blanco p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
          <h1 className="text-xl font-bold">Panel de Inspector</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center bg-rojo text-blanco px-4 py-2 rounded hover:bg-rojo/80 transition"
        >
          <FaSignOutAlt className="mr-2" />
          Cerrar Sesión
        </button>
      </nav>

      <div className="p-6">
        <ReportList token={token} />
      </div>
    </div>
  );
};

export default InspectorDashboard;