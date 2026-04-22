import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password_hash: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      if (formData.password_hash) {
        data.append('password_hash', formData.password_hash);
      }
      if (profilePic) {
        data.append('profile_pic', profilePic);
      }

      const response = await axios.put(`http://localhost:5000/api/users/${user.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      login(response.data.user);
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            Mi Perfil
          </h2>

          <div className="text-center mb-4">
            <img
              src={user.profile_pic ? `http://localhost:5000${user.profile_pic}` : '/default-avatar.png'}
              alt="Profile"
              className="rounded-circle mb-3"
              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
            />
            <h4 className="text-white">{user.username}</h4>
            <p className="text-secondary">{user.email}</p>
          </div>

          {!isEditing ? (
            <div className="text-center">
              <button
                className="btn btn-neon w-100 mb-3"
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
              {user.is_admin && (
                <button
                  className="btn btn-outline-info w-100"
                  onClick={() => navigate('/admin')}
                >
                  Acceder a Administración
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-white">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  className="form-control"
                  name="password_hash"
                  value={formData.password_hash}
                  onChange={handleChange}
                  placeholder="Deja vacío para mantener la actual"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white">Foto de Perfil</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-neon">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;