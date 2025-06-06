import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import SupervisorDashboard from './components/SupervisorDashboard';
import InspectorDashboard from './components/InspectorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './firebase';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';

const App = () => {
    const [token, setToken] = useState(sessionStorage.getItem('token') || '');
    const [role, setRole] = useState(sessionStorage.getItem('role') || '');
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lastAuthStateChange, setLastAuthStateChange] = useState(0);
    const [error, setError] = useState(''); // Nuevo estado para errores
    const navigate = useNavigate();

    const fetchUserRole = useCallback(async (idToken) => {
        try {
            const startTime = performance.now();
            const response = await axios.get('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/auth/me', {
                headers: { Authorization: `Bearer ${idToken}` },
                timeout: 10000,
            });
            const userRole = response.data.role;
            console.log('Respuesta de /api/auth/me:', response.data);
            console.log('Rol obtenido:', userRole);
            console.log(`Tiempo para obtener el rol: ${(performance.now() - startTime) / 1000} segundos`);
            setRole(userRole);
            sessionStorage.setItem('role', userRole);
            setIsAuthenticated(true);
            setError(''); // Limpiar cualquier error
        } catch (err) {
            console.error("Error al obtener el rol del usuario:", err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Error al autenticar. Por favor, inicia sesión nuevamente.');
            setToken('');
            setRole('');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            setIsAuthenticated(false);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const now = Date.now();
            if (now - lastAuthStateChange < 1000) {
                console.log('Ignorando cambio de estado de autenticación repetido');
                return;
            }
            setLastAuthStateChange(now);

            if (user) {
                console.log('Usuario autenticado en Firebase:', user.email);
                try {
                    const idToken = await Promise.race([
                        getIdToken(user, true),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
                    ]);
                    console.log('Token renovado:', idToken);
                    sessionStorage.setItem('token', idToken);
                    setToken(idToken);
                    await fetchUserRole(idToken);
                } catch (error) {
                    console.error("Error al renovar el token de Firebase:", error.message);
                    setError('Error al renovar la sesión. Por favor, inicia sesión nuevamente.');
                    setToken('');
                    setRole('');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('role');
                    setIsAuthenticated(false);
                    setLoading(false);
                    navigate('/login');
                }
            } else {
                console.log('No hay usuario autenticado');
                setToken('');
                setRole('');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('role');
                setIsAuthenticated(false);
                setLoading(false);
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [fetchUserRole, lastAuthStateChange, navigate]);

    const handleLogout = async () => {
        try {
            if (token) {
                await axios.post('https://sistema-monitoreo-backend-2d6d5d68221a.herokuapp.com/api/auth/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error("Error al cerrar sesión en el backend:", err.response?.data || err.message);
        }
        auth.signOut();
        setToken('');
        setRole('');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        setIsAuthenticated(false);
        setError('');
        navigate('/login');
    };

    const AppContent = () => {
        if (loading) {
            return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
        }

        if (error) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-blanco p-6 rounded-lg shadow-md text-center">
                        <h2 className="text-2xl font-bold text-gris-oscuro mb-4">Error</h2>
                        <p className="text-rojo mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError('');
                                navigate('/login');
                            }}
                            className="bg-azul-secundario text-blanco px-4 py-2 rounded hover:bg-azul-secundario/80 transition"
                        >
                            Volver a Iniciar Sesión
                        </button>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return <Login setToken={setToken} />;
        }

        console.log('Renderizando AppContent con token:', token);
        console.log('Renderizando AppContent con role:', role);
        return (
            <div>
                <Routes>
                    {role === "admin" && (
                        <Route path="/dashboard" element={<AdminDashboard token={token} onLogout={handleLogout} role={role} />} />
                    )}
                    {role === "supervisor" && (
                        <Route path="/dashboard" element={<SupervisorDashboard token={token} onLogout={handleLogout} role={role} />} />
                    )}
                    {role === "inspector" && (
                        <Route path="/dashboard" element={<InspectorDashboard token={token} onLogout={handleLogout} role={role} />} />
                    )}
                    <Route path="*" element={<Login setToken={setToken} />} />
                </Routes>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gris-claro">
            <AppContent />
        </div>
    );
};

export default App;