import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_URL from '../config';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password_hash: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, formData);
      alert(response.data.message);
      login(response.data.user);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="game-card p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="fw-bold mb-4 neon-text">IDENTIFÍCATE</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="email" className="form-control" placeholder="Correo electrónico" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <input type="password" className="form-control" placeholder="Contraseña" name="password_hash" value={formData.password_hash} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-neon w-100 mb-3">ENTRAR</button>
          </form>
          <p className="small mb-0 text-secondary">
            ¿ERES NUEVO? <Link to="/register" className="cyan-text fw-bold">REGÍSTRATE AQUÍ</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
