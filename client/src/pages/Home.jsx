import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `http://localhost:5000${coverUrl}` : coverUrl;
};

const Home = () => {
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
        setError(err.response?.data?.message || 'No se pudieron cargar los juegos.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const featuredGame = useMemo(() => games[0], [games]);

  return (
    <div className="min-vh-100">

      <Navbar />

      <header className="hero-section mb-5">
        <div className="container h-100">
          <div className="row align-items-end h-100 pb-5">
            <div className="col-md-8">
              <span className="badge bg-info text-dark mb-2 fw-bold">DESTACADO</span>
              <h1 className="display-3 fw-bold text-white">{featuredGame?.title || 'Catálogo GameSense'}</h1>
              <p className="lead cyan-text">
                {featuredGame
                  ? `Explora reseñas y detalles de ${featuredGame.title}.`
                  : 'La comunidad ha hablado. Lee las últimas reseñas.'}
              </p>
            </div>
          </div>
        </div>
      </header>


      <main className="container">
        <h3 className="section-title mb-4 text-white">Populares</h3>
        {loading && <p className="text-secondary">Cargando juegos...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && games.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            No hay juegos registrados todavía.
          </div>
        )}

        <div className="row row-cols-2 row-cols-md-5 g-4">
          {games.map((game) => (
            <div className="col" key={game._id}>
              <div className="game-card home-game-card h-100 d-flex flex-column">
                <Link to={`/games/${game._id}`}>
                  <img
                    src={resolveCoverSrc(game.cover_url)}
                    className="home-game-image"
                    alt={game.title}
                    onError={(e) => {
                      e.currentTarget.src = fallbackCover;
                    }}
                  />
                </Link>
                <div className="p-2 text-center d-flex flex-column flex-grow-1 justify-content-between">
                  <h6 className="text-truncate text-white mb-2">{game.title}</h6>
                  <Link to={`/games/${game._id}`} className="btn btn-outline-neon btn-sm w-100 mt-2">Reseñar</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;