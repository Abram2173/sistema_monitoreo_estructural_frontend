// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/logo.png';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      console.log('Token obtenido de Firebase:', token);
      sessionStorage.setItem('token', token);
      setToken(token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      setError('Credenciales inválidas o usuario no encontrado');
    }
  };

  return (
    <div className="bg-blue-400 h-screen w-screen">
      <div className="flex flex-col items-center flex-1 h-full justify-center px-4 sm:px-0">
        <div className="flex rounded-lg shadow-lg w-full sm:w-3/4 lg:w-1/2 bg-white sm:mx-0" style={{ height: '500px' }}>
          <div className="flex flex-col w-full md:w-1/2 p-4">
            <div className="flex flex-col flex-1 justify-center mb-8">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10px' }}>
                <img src={logo} alt="Logo Sistema de Monitoreo Estructural" style={{ height: '200px', width: 'auto' }} />
              </div>
              <h1 className="text-4xl text-center font-thin text-gray-800">Bienvenido de Vuelta</h1>
              <div className="w-full mt-4">
                <form className="w-3/4 mx-auto" onSubmit={handleLogin}>
                  {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                  <div className="flex flex-col mt-4">
                    <input
                      type="email"
                      className="flex-grow h-8 px-2 border rounded border-gray-400 focus:outline-none focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo"
                      required
                    />
                  </div>
                  <div className="flex flex-col mt-4">
                    <input
                      type="password"
                      className="flex-grow h-8 px-2 rounded border border-gray-400 focus:outline-none focus:border-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      required
                    />
                  </div>
                  <div className="flex flex-col mt-8">
                    <button
                      type="submit"
                      className="relative rounded-full bg-blue-500 px-4 py-2 font-mono font-bold text-white transition-colors duration-300 ease-linear hover:bg-blue-700"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="hidden md:block md:w-1/2 rounded-r-lg"
            style={{
              background: `url('https://images.pexels.com/photos/139205/pexels-photo-139205.jpeg?auto=compress&cs=tinysrgb&w=600')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;