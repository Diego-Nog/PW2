import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `http://localhost:5000${coverUrl}` : coverUrl;
};

const AdminGames = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/games');
        setGames(res.data.games || []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudieron cargar los juegos.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [user, navigate]);

  const handleDelete = async (gameId, title) => {
    const confirmed = window.confirm(`¿Eliminar el juego "${title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/games/${gameId}`);
      setGames(prev => prev.filter(g => g._id !== gameId));
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo eliminar el juego.');
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
              Gestionar <span className="cyan-text">Juegos</span>
            </h2>
            <p className="text-secondary mb-0">Pasa el mouse por una card para editar o eliminar.</p>
          </div>

          <button
            className="btn btn-neon px-4"
            onClick={() => navigate('/admin/create-game/new')}
          >
            Create
          </button>
        </div>

        {loading && <p className="text-secondary">Cargando juegos...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && games.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            No hay juegos registrados todavía.
          </div>
        )}

        <div className="row g-4">
          {games.map((game) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={game._id}>
              <div className="admin-game-card h-100">
                <img
                  src={resolveCoverSrc(game.cover_url)}
                  alt={game.title}
                  className="admin-game-image"
                  onError={(e) => {
                    e.currentTarget.src = fallbackCover;
                  }}
                />

                <div className="admin-game-overlay">
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => navigate(`/admin/create-game/new?edit=${game._id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(game._id, game.title)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="p-3">
                  <h6 className="text-white mb-1 text-truncate">{game.title}</h6>
                  <p className="text-secondary mb-0 small text-truncate">
                    {game.developer || 'Sin desarrollador'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGames;
