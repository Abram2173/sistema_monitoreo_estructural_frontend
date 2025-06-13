import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaChevronDown, FaChevronUp, FaSyncAlt, FaTrash } from 'react-icons/fa';
import logo from '../assets/logo.png';
import UserList from './UserList'; // Asegúrate de que UserList.jsx esté importado

const AdminDashboard = ({ onLogout, role }) => {
  const [token] = useState(sessionStorage.getItem('token') || '');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);
  const [currentView, setCurrentView] = useState('gestion');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/users/status', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setReports(reportsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar los datos');
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el reporte ${reportId}?`)) return;
    try {
      await axios.delete(`https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar el reporte');
    }
  };

  const toggleReportDetails = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-red-500">No tienes permiso para acceder a este panel.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => (status === 'active' ? 'green' : 'red');

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-black text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo Sistema de Monitoreo Estructural" className="h-40 mr-10" />
          <h1 className="text-xl font-bold">Panel de Administrador</h1>
        </div>
        <button onClick={onLogout} className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          <FaSignOutAlt className="mr-2" /> Cerrar Sesión
        </button>
      </nav>

      <div className="p-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setCurrentView('gestion')}
            className={`px-4 py-2 rounded font-medium transition ${currentView === 'gestion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setCurrentView('reportes')}
            className={`px-4 py-2 rounded font-medium transition ${currentView === 'reportes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Visualizar Reportes
          </button>
          <button
            onClick={() => setCurrentView('asignacion')}
            className={`px-4 py-2 rounded font-medium transition ${currentView === 'asignacion' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Asignar Reportes
          </button>
          <button
            onClick={() => setCurrentView('estatus')}
            className={`px-4 py-2 rounded font-medium transition ${currentView === 'estatus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Estatus de Usuarios
          </button>
        </div>

        {currentView === 'gestion' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h2>
            <UserList token={token} />
          </div>
        )}

        {currentView === 'reportes' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Visualizar Reportes</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {reports.length === 0 ? (
              <p className="text-gray-500">No hay reportes disponibles.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">ID</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Inspector</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Ubicación</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Riesgo</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Estado</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Supervisor Asignado</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <React.Fragment key={report.id}>
                        <tr className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                          <td className="p-3 text-gray-700 text-sm">{report.id}</td>
                          <td className="p-3 text-gray-700 text-sm">{report.inspector_name}</td>
                          <td className="p-3 text-gray-700 text-sm">{report.location}</td>
                          <td className="p-3 text-gray-700 text-sm">{report.risk_level}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${report.status === 'Pendiente' ? 'bg-blue-100 text-blue-800' : ''} ${report.status === 'Aprobado' ? 'bg-green-100 text-green-800' : ''} ${report.status === 'Rechazado' ? 'bg-red-100 text-red-800' : ''}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700 text-sm">{report.assigned_supervisor || 'No asignado'}</td>
                          <td className="p-3">
                            <button onClick={() => toggleReportDetails(report.id)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm font-medium transition mr-2">
                              {expandedReport === report.id ? <FaChevronUp /> : <FaChevronDown />} {expandedReport === report.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                            </button>
                            <button onClick={() => handleDeleteReport(report.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm font-medium transition">
                              <FaTrash className="inline mr-1" /> Eliminar
                            </button>
                          </td>
                        </tr>
                        {expandedReport === report.id && (
                          <tr className="bg-gray-100">
                            <td colSpan="7" className="p-4">
                              <div className="border rounded-lg p-4 bg-white">
                                <h3 className="text-lg font-bold mb-2">Detalles del Reporte</h3>
                                <p><strong>Descripción:</strong> {report.description}</p>
                                <p><strong>Medidas:</strong></p>
                                <ul className="list-disc pl-5">
                                  <li>Deformación: {report.measurements.deformacion} mm</li>
                                  <li>Temperatura: {report.measurements.temperatura} °C</li>
                                  <li>Vibración: {report.measurements.vibracion} mm/s</li>
                                </ul>
                                <p><strong>Comentarios:</strong> {report.comments || 'Sin comentarios'}</p>
                                <p><strong>Recomendaciones:</strong> {report.recommendations || 'Sin recomendaciones'}</p>
                                <p><strong>Fecha de Creación:</strong> {new Date(report.created_at).toLocaleString()}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentView === 'estatus' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estatus de Usuarios</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {users.length === 0 ? (
              <p className="text-gray-500">No hay usuarios disponibles.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">UID</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Email</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Estatus</th>
                      <th className="p-3 text-left text-base font-bold border-b border-gray-300">Última vez visto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="border-b border-gray-300 hover:bg-gray-100 transition">
                        <td className="p-3 text-gray-700 text-sm">{user.uid}</td>
                        <td className="p-3 text-gray-700 text-sm">{user.email}</td>
                        <td className="p-3">
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatusColor(user.status) }}></span>
                          {user.status}
                        </td>
                        <td className="p-3 text-gray-700 text-sm">
                          {user.last_seen ? new Date(user.last_seen.seconds * 1000).toLocaleString() : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;