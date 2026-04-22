import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const fallbackCover = 'https://via.placeholder.com/240x135/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `http://localhost:5000${coverUrl}` : coverUrl;
};

const Library = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/games');
        setGames(res.data.games || []);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar la biblioteca.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-vh-100">
      <Navbar />

      <main className="container mt-5">
        <h3 className="section-title text-white">Colección de Juegos</h3>

        {loading && <p className="text-secondary">Cargando biblioteca...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && games.length === 0 && (
          <div className="game-card p-4 text-center text-secondary mt-3">
            No hay juegos disponibles en tu biblioteca.
          </div>
        )}

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {games.map((game) => (
            <div className="col" key={game._id}>
              <div className="game-card p-3 d-flex align-items-center">
                <img
                  src={resolveCoverSrc(game.cover_url)}
                  className="rounded me-3"
                  alt={game.title}
                  style={{ width: '120px', height: 'auto', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = fallbackCover;
                  }}
                />
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-white">{game.title}</h5>
                  <p className="small text-secondary mb-0">
                    {game.developer || 'Sin desarrollador'}
                  </p>
                </div>
                <Link to={`/games/${game._id}`} className="btn btn-outline-neon btn-sm">
                  Ver info
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Library;