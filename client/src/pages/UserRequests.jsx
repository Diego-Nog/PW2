import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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
      const res = await axios.get('http://localhost:5000/api/users');
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
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
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

      <div className="container mt-5" style={{ maxWidth: '900px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-4 text-white text-center">
            Peticiones de <span className="cyan-text">Usuarios</span>
          </h2>

          {actionMessage && (
            <div className="alert alert-info alert-dismissible" role="alert">
              {actionMessage}
              <button type="button" className="btn-close" onClick={() => setActionMessage(null)} />
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p className="text-secondary text-center">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-secondary text-center">No hay usuarios registrados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th className="text-center">Admin</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={u.profile_pic && u.profile_pic !== 'default_avatar.png'
                              ? `http://localhost:5000/uploads/${u.profile_pic}`
                              : '/default-avatar.png'}
                            alt={u.username}
                            className="rounded-circle"
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                          />
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{u.email}</td>
                      <td className="text-center">
                        {u.is_admin
                          ? <span className="badge" style={{ background: 'var(--neon-cyan)', color: '#000' }}>Admin</span>
                          : <span className="badge bg-secondary">Usuario</span>
                        }
                      </td>
                      <td className="text-center">
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
    </div>
  );
};

export default UserRequests;
