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
    password_hash: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.email.includes('@')) {
      errs.email = 'El correo debe contener @';
    }
    if (formData.password_hash.length < 4) {
      errs.password_hash = 'Mínimo 4 caracteres';
    } else if (!/[A-Z]/.test(formData.password_hash)) {
      errs.password_hash = 'Debe incluir al menos una mayúscula';
    } else if (!/[0-9]/.test(formData.password_hash)) {
      errs.password_hash = 'Debe incluir al menos un número';
    }
    if (!profilePic) {
      errs.profilePic = 'La foto de perfil es obligatoria';
    }
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfilePic(file);
    setFieldErrors(prev => ({ ...prev, profilePic: undefined }));
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
    } else {
      setProfilePicPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password_hash', formData.password_hash);
      if (profilePic) {
        data.append('profile_pic', profilePic);
      }
      await axios.post('http://localhost:5000/api/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/admin/create-user');
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
                className={`form-control bg-dark text-white border-secondary${fieldErrors.email ? ' is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
              {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Contraseña <span className="text-danger">*</span></label>
              <input
                type="password"
                className={`form-control bg-dark text-white border-secondary${fieldErrors.password_hash ? ' is-invalid' : ''}`}
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                placeholder="Contraseña segura"
                required
              />
              {fieldErrors.password_hash && <div className="invalid-feedback">{fieldErrors.password_hash}</div>}
              <div className="text-secondary small mt-1">Mínimo 4 caracteres, 1 mayúscula y 1 número</div>
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Foto de perfil <span className="text-danger">*</span></label>
              <div className="d-flex align-items-center gap-3">
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Vista previa"
                    className="rounded-circle"
                    style={{ width: '52px', height: '52px', objectFit: 'cover', border: '2px solid var(--neon-cyan)' }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '52px', height: '52px', background: '#2a2a2a', border: '2px dashed rgba(255,255,255,0.2)', flexShrink: 0 }}
                  >
                    <span style={{ fontSize: '22px' }}>👤</span>
                  </div>
                )}
                <input
                  type="file"
                  className={`form-control bg-dark text-white border-secondary${fieldErrors.profilePic ? ' is-invalid' : ''}`}
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              {fieldErrors.profilePic && <div className="text-danger small mt-1">{fieldErrors.profilePic}</div>}
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin/create-user')}
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
