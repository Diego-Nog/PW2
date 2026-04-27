import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Navbar from '../components/Navbar';
import FloatingManageGamesButton from '../components/FloatingManageGamesButton';
import { useAuth } from '../contexts/AuthContext';

const fallbackCover = 'https://via.placeholder.com/400x560/121212/00F2FE?text=Sin+Portada';

const resolveCoverSrc = (coverUrl) => {
  if (!coverUrl) return fallbackCover;
  return coverUrl.startsWith('/uploads/') ? `${API_URL}${coverUrl}` : coverUrl;
};

const SearchResults = () => {
  const { user } = useAuth();
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const searchQuery = urlParams.get('q')?.trim() || '';
  const filterParams = urlParams.getAll('filter');

  const filterGroups = React.useMemo(() => {
    const groups = { genre: [], dev: [], year: [] };
    filterParams.forEach((f) => {
      const idx = f.indexOf(':');
      const type = f.slice(0, idx);
      const value = f.slice(idx + 1);
      if (groups[type] !== undefined) groups[type].push(value);
    });
    return groups;
  }, [search]);

  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [libraryGameIds, setLibraryGameIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingGameId, setAddingGameId] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/genres`)
      .then((r) => setGenres(r.data.genres || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/games`);
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
      if (!user?.id) { setLibraryGameIds([]); return; }
      try {
        const res = await axios.get(`${API_URL}/api/library/${user.id}`);
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

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        const matches =
          g.title.toLowerCase().includes(lower) ||
          (g.genre_id?.name || '').toLowerCase().includes(lower) ||
          (g.developer || '').toLowerCase().includes(lower) ||
          String(g.release_year ?? '').includes(searchQuery);
        if (!matches) return false;
      }
      if (filterGroups.genre.length > 0) {
        const gameGenreId = g.genre_id?._id || g.genre_id;
        if (!filterGroups.genre.includes(gameGenreId)) return false;
      }
      if (filterGroups.dev.length > 0) {
        if (!filterGroups.dev.includes(g.developer)) return false;
      }
      if (filterGroups.year.length > 0) {
        if (!filterGroups.year.includes(String(g.release_year))) return false;
      }
      return true;
    });
  }, [games, searchQuery, filterGroups]);

  const filterLabel = useMemo(() => {
    const labels = [];
    if (filterGroups.genre.length > 0) {
      const names = filterGroups.genre.map((id) => {
        const found = genres.find((g) => String(g._id) === String(id));
        return found?.name || id;
      });
      labels.push(`Género: ${names.join(', ')}`);
    }
    if (filterGroups.dev.length > 0) labels.push(`Desarrollador: ${filterGroups.dev.join(', ')}`);
    if (filterGroups.year.length > 0) labels.push(`Año: ${filterGroups.year.join(', ')}`);
    return labels.join(' · ') || null;
  }, [filterGroups, genres]);

  const handleAddToLibrary = async (gameId) => {
    if (!user?.id) {
      window.alert('Debes iniciar sesion para agregar juegos a tu biblioteca.');
      return;
    }
    try {
      setAddingGameId(gameId);
      await axios.post(`${API_URL}/api/library`, { user_id: user.id, game_id: gameId });
      setLibraryGameIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
      window.alert('Juego agregado a tu biblioteca.');
    } catch (err) {
      window.alert(err.response?.data?.message || 'No se pudo agregar el juego.');
    } finally {
      setAddingGameId(null);
    }
  };

  const titleText = searchQuery
    ? `Resultados para "${searchQuery}"`
    : filterLabel || 'Todos los juegos';

  return (
    <div className="min-vh-100">
      <Navbar />
      <main className="container mt-5">
        <h3 className="section-title mb-4 text-white">{titleText}</h3>
        {loading && <p className="text-secondary">Cargando juegos...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && filteredGames.length === 0 && (
          <div className="game-card p-4 text-center text-secondary">
            No se encontraron juegos con los filtros seleccionados.
          </div>
        )}
        <div className="row row-cols-2 row-cols-md-5 g-4">
          {filteredGames.map((game) => (
            <div className="col" key={game._id}>
              <div className="game-card home-game-card h-100 d-flex flex-column">
                <Link to={`/games/${game._id}`}>
                  <img
                    src={resolveCoverSrc(game.cover_url)}
                    className="home-game-image"
                    alt={game.title}
                    onError={(e) => { e.currentTarget.src = fallbackCover; }}
                  />
                </Link>
                <div className="p-2 text-center d-flex flex-column flex-grow-1 justify-content-between">
                  <h6 className="text-truncate text-white mb-2">{game.title}</h6>
                  {libraryGameIds.includes(game._id) ? (
                    <button type="button" className="btn btn-success btn-sm w-100 mt-2" disabled>
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

export default SearchResults;
