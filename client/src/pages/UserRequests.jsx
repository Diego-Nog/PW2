import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_URL from '../config';

const resolveProfilePicSrc = (profilePic) => {
  if (!profilePic || profilePic === 'default_avatar.png') return '/default-avatar.png';
  return profilePic.startsWith('http') ? profilePic : `${API_URL}/uploads/${profilePic}`;
};

const UserRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data.users || res.data);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      setActionMessage('Usuario eliminado correctamente.');
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      setActionMessage('Error al eliminar el usuario.');
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5 pb-5">
        <div className="mb-4">
          <h2 className="section-title mb-2 text-white">
            Gestionar <span className="cyan-text">Usuarios</span>
          </h2>
          <p className="text-secondary mb-0">Administra y elimina usuarios registrados.</p>
        </div>

        {actionMessage && (
          <div className="alert alert-info alert-dismissible" role="alert">
            {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage(null)} />
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="game-card overflow-hidden">
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-secondary small">
              {loading ? 'Cargando...' : `${users.length} usuario${users.length !== 1 ? 's' : ''} registrado${users.length !== 1 ? 's' : ''}`}
            </span>
            <button
              className="btn btn-neon px-4"
              onClick={() => navigate('/admin/create-user/new')}
            >
              Crear Usuario
            </button>
          </div>

          {loading && <p className="text-secondary text-center py-4">Cargando usuarios...</p>}

          {!loading && !error && users.length === 0 && (
            <p className="text-center text-secondary py-4">No hay usuarios registrados todavía.</p>
          )}

          {!loading && users.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                <thead>
                  <tr style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <th className="text-white-50 fw-semibold" style={{ background: 'transparent' }}>Usuario</th>
                    <th className="text-white-50 fw-semibold" style={{ background: 'transparent' }}>Email</th>
                    <th className="text-white-50 fw-semibold text-center" style={{ background: 'transparent' }}>Rol</th>
                    <th className="text-white-50 fw-semibold text-center" style={{ background: 'transparent' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td style={{ background: 'transparent' }}>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={resolveProfilePicSrc(u.profile_pic)}
                            alt={u.username}
                            className="rounded-circle"
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                          />
                          <span className="text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="text-secondary" style={{ background: 'transparent' }}>{u.email}</td>
                      <td className="text-center" style={{ background: 'transparent' }}>
                        {u.is_admin
                          ? <span className="badge" style={{ background: 'var(--neon-cyan)', color: '#000' }}>Admin</span>
                          : <span className="badge bg-secondary">Usuario</span>
                        }
                      </td>
                      <td className="text-center" style={{ background: 'transparent' }}>
                        {u._id !== user.id && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(u._id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin')}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRequests;
