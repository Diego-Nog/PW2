import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PendingGameRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    fetchPendingGames();
  }, [user, navigate]);

  const fetchPendingGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/games', {
        params: { only_pending: true }
      });
      setGames(res.data.games || []);
    } catch (err) {
      setError('No se pudieron cargar las peticiones pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gameId) => {
    try {
      await axios.put(`http://localhost:5000/api/games/${gameId}/approve`, {
        is_admin: true
      });
      setActionMessage('Juego aprobado correctamente.');
      setGames(prev => prev.filter(g => g._id !== gameId));
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Error al aprobar el juego.');
    }
  };

  const handleReject = async (gameId) => {
    if (!window.confirm('¿Estás seguro de que deseas rechazar este juego?')) return;
    try {
      await axios.put(`http://localhost:5000/api/games/${gameId}/reject`, {
        is_admin: true
      });
      setActionMessage('Juego rechazado.');
      setGames(prev => prev.filter(g => g._id !== gameId));
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Error al rechazar el juego.');
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="section-title mb-2 text-white">
              Peticiones de <span className="cyan-text">Usuarios</span>
            </h2>
            <p className="text-secondary mb-0">Juegos enviados por usuarios pendientes de revisión.</p>
          </div>
        </div>

        {actionMessage && (
          <div className="alert alert-info alert-dismissible" role="alert">
            {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage(null)} />
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        {loading && <p className="text-secondary">Cargando peticiones...</p>}

        {!loading && !error && games.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            No hay peticiones pendientes.
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="row g-4">
            {games.map(game => (
              <div className="col-12 col-md-6" key={game._id}>
                <div className="admin-genre-card h-100 p-4">
                  <div className="d-flex gap-3">
                    {game.cover_url ? (
                      <img
                        src={
                          game.cover_url.startsWith('/uploads/')
                            ? `http://localhost:5000${game.cover_url}`
                            : game.cover_url
                        }
                        alt={game.title}
                        style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '70px', height: '90px', background: '#2a2a2a',
                          borderRadius: '6px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#555', fontSize: '1.5rem'
                        }}
                      >
                        🎮
                      </div>
                    )}

                    <div className="flex-grow-1 min-width-0">
                      <h5 className="text-white mb-1">{game.title}</h5>
                      <p className="text-secondary mb-1" style={{ fontSize: '0.85rem' }}>
                        {game.developer} {game.release_year ? `· ${game.release_year}` : ''}
                      </p>
                      {game.genre_id?.name && (
                        <span className="genre-tag-badge mb-2 d-inline-block">{game.genre_id.name}</span>
                      )}
                      {game.created_by?.username && (
                        <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)' }}>
                          Enviado por: {game.created_by.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-sm btn-neon flex-grow-1"
                      onClick={() => handleApprove(game._id)}
                    >
                      Aprobar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-grow-1"
                      onClick={() => handleReject(game._id)}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
  );
};

export default PendingGameRequests;
