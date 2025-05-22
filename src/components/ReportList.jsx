import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdjustForm from './AdjustForm';
import { FaEdit, FaSyncAlt } from 'react-icons/fa';

const ReportList = ({ token }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [status, setStatus] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token'); // Cambiamos localStorage por sessionStorage
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError(err.response.data.detail || 'No tienes permiso para acceder a esta sección.');
      } else {
        setError('Error al cargar reportes');
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdate = async (reportId) => {
    try {
      const updateData = { status, recommendations };
      const response = await axios.put(`http://127.0.0.1:8000/api/reports/${reportId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.map(report => report.id === reportId ? response.data : report));
      setSelectedReport(null);
      setIsAdjusting(false);
      setStatus('');
      setRecommendations('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar reporte');
    }
  };

  const handleAdjustClick = (report) => {
    const reportCopy = { ...report };
    setSelectedReport(reportCopy);
    setIsAdjusting(true);
    setStatus(report.status);
    setRecommendations(report.recommendations || '');
  };

  const handleCancel = () => {
    setSelectedReport(null);
    setIsAdjusting(false);
    setStatus('');
    setRecommendations('');
  };

  return (
    <div className="bg-blanco p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gris-oscuro flex items-center">
          Lista de Reportes
        </h2>
        <button
          onClick={fetchReports}
          className="flex items-center bg-azul-secondary text-blanco px-4 py-2 rounded hover:bg-azul-secondary/80 transition"
        >
          <FaSyncAlt className="mr-2" />
          Cargar
        </button>
      </div>
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
                  <th className="p-3 text-left text-base font-bold border-b border-gris-borde">Acciones</th>
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
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdjustClick(report)}
                          className="flex items-center bg-verde text-blanco px-2 py-1 rounded hover:bg-verde/80 text-sm font-medium transition"
                        >
                          <FaEdit className="mr-1" />
                          Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {isAdjusting && selectedReport ? (
        <AdjustForm
          report={selectedReport}
          onSave={handleUpdate}
          onCancel={handleCancel}
          status={status}
          setStatus={setStatus}
          recommendations={recommendations}
          setRecommendations={setRecommendations}
        />
      ) : (
        <p className="mt-4 text-gray-500">Selecciona un reporte para ajustar.</p>
      )}
    </div>
  );
};

export default ReportList;