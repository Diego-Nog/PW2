import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FloatingManageGamesButton from '../components/FloatingManageGamesButton';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `http://localhost:5000${coverUrl}` : coverUrl;
};

const Home = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [libraryGameIds, setLibraryGameIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingGameId, setAddingGameId] = useState(null);

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

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) {
        setLibraryGameIds([]);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/library/${user.id}`);
        const gameIds = (res.data.library || [])
          .map((item) => item.game_id?._id || item.game_id)
          .filter(Boolean);
        setLibraryGameIds(gameIds);
      } catch {
        setLibraryGameIds([]);
      }
    };

    fetchLibrary();
  }, [user]);

  const featuredGame = useMemo(() => games[0], [games]);

  const handleAddToLibrary = async (gameId) => {
    if (!user?.id) {
      window.alert('Debes iniciar sesion para agregar juegos a tu biblioteca.');
      return;
    }

    try {
      setAddingGameId(gameId);
      await axios.post('http://localhost:5000/api/library', {
        user_id: user.id,
        game_id: gameId
      });
      setLibraryGameIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
      window.alert('Juego agregado a tu biblioteca.');
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo agregar el juego.');
    } finally {
      setAddingGameId(null);
    }
  };

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
                  {libraryGameIds.includes(game._id) ? (
                    <button
                      type="button"
                      className="btn btn-success btn-sm w-100 mt-2"
                      disabled
                    >
                      Agregado a biblioteca
                    </button>
                  ) : (
                  <button
                    type="button"
                    className="btn btn-outline-neon btn-sm w-100 mt-2"
                    onClick={() => handleAddToLibrary(game._id)}
                    disabled={addingGameId === game._id}
                  >
                    {addingGameId === game._id ? 'Agregando...' : 'Agregar a biblioteca'}
                  </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <FloatingManageGamesButton />
    </div>
  );
};

export default Home;