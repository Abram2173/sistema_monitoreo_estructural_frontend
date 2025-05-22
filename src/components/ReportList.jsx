import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportList = ({ token }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar los reportes');
      }
    };
    fetchReports();
  }, [token]);

  return (
    <div className="bg-blanco p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Lista de Reportes</h2>
      {error && <p className="text-rojo mb-4">{error}</p>}
      {!error && reports.length === 0 ? (
        <p className="text-gray-500">No hay reportes disponibles.</p>
      ) : (
        !error && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-gris-muyClaro text-gris-oscuro">
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">ID</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Inspector</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Ubicación</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Riesgo</th>
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr
                    key={report.id}
                    className={`border-b border-gris-borde ${index % 2 === 0 ? 'bg-blanco' : 'bg-gris-muyClaro'} hover:bg-gris-medio transition`}
                  >
                    <td className="p-3 text-gris-oscuro text-sm">{report.id}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{report.inspector_name}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{report.location}</td>
                    <td className="p-3 text-gris-oscuro text-sm">{report.risk_level}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize
                          ${report.status === 'Pendiente' ? 'bg-azulPendiente text-azul-secondary' : ''}
                          ${report.status === 'Aprobado' ? 'bg-verdeAprobado text-verde' : ''}
                          ${report.status === 'Rechazado' ? 'bg-rojoRechazado text-rojo' : ''}`}
                      >
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default ReportList;