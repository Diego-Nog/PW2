import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_URL from '../config';

const Register = () => {
  const supportsProfilePicUpload = API_URL.includes('localhost') || API_URL.includes('127.0.0.1');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password_hash: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) {
      newErrors.email = 'El correo debe contener @';
    }
    if (formData.password_hash.length < 4) {
      newErrors.password_hash = 'Mínimo 4 caracteres';
    } else if (!/[A-Z]/.test(formData.password_hash)) {
      newErrors.password_hash = 'Debe incluir al menos una mayúscula';
    } else if (!/[0-9]/.test(formData.password_hash)) {
      newErrors.password_hash = 'Debe incluir al menos un número';
    }
    if (supportsProfilePicUpload && !profilePic) {
      newErrors.profilePic = 'La foto de perfil es obligatoria';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setProfilePic(file);
    setErrors(prev => ({ ...prev, profilePic: undefined }));
    if (file) {
      setProfilePicPreview(URL.createObjectURL(file));
    } else {
      setProfilePicPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password_hash', formData.password_hash);
      if (supportsProfilePicUpload && profilePic) {
        data.append('profile_pic', profilePic);
      }
      await axios.post(`${API_URL}/api/users/register`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100">
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            Nuevo <span className="cyan-text">Jugador</span>
          </h2>

          {serverError && <div className="alert alert-danger">{serverError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-white">Nombre de usuario <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Ej: jugador123"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Correo electrónico <span className="text-danger">*</span></label>
              <input
                type="email"
                className={`form-control bg-dark text-white border-secondary${errors.email ? ' is-invalid' : ''}`}
                placeholder="correo@ejemplo.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Contraseña <span className="text-danger">*</span></label>
              <input
                type="password"
                className={`form-control bg-dark text-white border-secondary${errors.password_hash ? ' is-invalid' : ''}`}
                placeholder="Contraseña segura"
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                required
              />
              {errors.password_hash && <div className="invalid-feedback">{errors.password_hash}</div>}
              <div className="text-secondary small mt-1">Mínimo 4 caracteres, 1 mayúscula y 1 número</div>
            </div>

            <div className="mb-4">
              <label className="form-label text-white">
                Foto de perfil {supportsProfilePicUpload && <span className="text-danger">*</span>}
              </label>
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
                  className={`form-control bg-dark text-white border-secondary${errors.profilePic ? ' is-invalid' : ''}`}
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!supportsProfilePicUpload}
                />
              </div>
              {!supportsProfilePicUpload && (
                <div className="text-secondary small mt-1">En la version desplegada la cuenta se crea sin foto de perfil.</div>
              )}
              {errors.profilePic && <div className="text-danger small mt-1">{errors.profilePic}</div>}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <p className="small mb-0 text-secondary">
                ¿Ya tienes cuenta? <Link to="/login" className="cyan-text fw-bold">Inicia sesión</Link>
              </p>
              <button type="submit" className="btn btn-neon px-5" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
