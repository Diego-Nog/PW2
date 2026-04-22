import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password_hash: '',
    is_admin: false
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) navigate('/');
  }, [user, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/register', {
        username: formData.username,
        email: formData.email,
        password_hash: formData.password_hash,
        is_admin: formData.is_admin
      });
      setMessage('Usuario creado exitosamente.');
      setFormData({ username: '', email: '', password_hash: '', is_admin: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            Crear <span className="cyan-text">Usuario</span>
          </h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-white">Nombre de usuario <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej: jugador123"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                className="form-control bg-dark text-white border-secondary"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Contraseña <span className="text-danger">*</span></label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                placeholder="Contraseña segura"
                required
              />
            </div>

            <div className="mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="is_admin"
                  id="isAdminCheck"
                  checked={formData.is_admin}
                  onChange={handleChange}
                />
                <label className="form-check-label text-white" htmlFor="isAdminCheck">
                  Otorgar permisos de administrador
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin')}
              >
                Volver
              </button>
              <button type="submit" className="btn btn-neon px-5" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
