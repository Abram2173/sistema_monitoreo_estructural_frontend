import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportList from './ReportList';
import logo from '../assets/logo.png';
import { FaSignOutAlt, FaSyncAlt } from 'react-icons/fa';

const SupervisorDashboard = ({ token, onLogout }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState('');

    // Actualizar last_activity al montar el componente y al refrescar
    useEffect(() => {
        const updateActivity = async () => {
            try {
                await axios.post('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/update-activity', {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Actividad del supervisor actualizada al montar');
            } catch (err) {
                setError('Error al actualizar la actividad al montar');
                console.error(err);
            }
        };
        if (token) updateActivity();
    }, [token]);

    const handleRefresh = async () => {
        setRefreshKey(prevKey => prevKey + 1);
        try {
            await axios.post('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/update-activity', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Actividad actualizada al refrescar');
        } catch (err) {
            setError('Error al actualizar la actividad al refrescar');
            console.error(err);
        }
    };

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
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <ReportList token={token} key={refreshKey} />
            </div>
        </div>
    );
};

export default SupervisorDashboard;