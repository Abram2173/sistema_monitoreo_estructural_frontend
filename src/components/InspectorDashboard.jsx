import React from 'react';
import InspectorReportForm from './InspectorReportForm';

const InspectorDashboard = ({ token, onLogout }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-azul">Panel de Inspector</h1>
        <button
          onClick={onLogout}
          className="bg-naranja text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="w-full">
        <InspectorReportForm token={token} />
      </div>
    </div>
  );
};

export default InspectorDashboard;