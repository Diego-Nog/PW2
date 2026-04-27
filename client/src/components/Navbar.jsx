import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [selectedDevs, setSelectedDevs] = useState(new Set());
  const [selectedYears, setSelectedYears] = useState(new Set());
  const [openSections, setOpenSections] = useState({ genre: false, dev: false, year: false });
  const dropdownRef = useRef(null);

  // Fetch filter data once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [genresRes, gamesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/genres'),
          axios.get('http://localhost:5000/api/games'),
        ]);
        setGenres(genresRes.data.genres || []);
        const gamesList = gamesRes.data.games || [];
        const devSet = [...new Set(gamesList.map((g) => g.developer).filter(Boolean))].sort();
        const yearSet = [...new Set(gamesList.map((g) => g.release_year).filter(Boolean))].sort((a, b) => b - a);
        setDevelopers(devSet);
        setYears(yearSet);
      } catch {
        // silently ignore
      }
    };
    loadFilters();
  }, []);

  // Sync checkboxes from URL when navigating
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filters = params.getAll('filter');
    const g = new Set();
    const d = new Set();
    const y = new Set();
    filters.forEach((f) => {
      const idx = f.indexOf(':');
      const type = f.slice(0, idx);
      const value = f.slice(idx + 1);
      if (type === 'genre') g.add(value);
      if (type === 'dev') d.add(value);
      if (type === 'year') y.add(value);
    });
    setSelectedGenres(g);
    setSelectedDevs(d);
    setSelectedYears(y);
    setSearchText(params.get('q') || '');
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildParams = () => {
    const params = new URLSearchParams();
    const q = searchText.trim();
    if (q) params.set('q', q);
    selectedGenres.forEach((v) => params.append('filter', `genre:${v}`));
    selectedDevs.forEach((v) => params.append('filter', `dev:${v}`));
    selectedYears.forEach((v) => params.append('filter', `year:${v}`));
    return params;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?${buildParams().toString()}`);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const applyFilters = () => {
    navigate(`/search?${buildParams().toString()}`);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const clearFilters = () => {
    setSelectedGenres(new Set());
    setSelectedDevs(new Set());
    setSelectedYears(new Set());
  };

  const totalSelected = selectedGenres.size + selectedDevs.size + selectedYears.size;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-lg">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="neon-text">GAME</span>SENSE
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`}>
        <form className="d-flex flex-grow-1 mx-lg-5 my-2 my-lg-0 search-container" onSubmit={handleSearch}>
          <div className="input-group position-relative" ref={dropdownRef}>
            <button
              className="btn btn-dark dropdown-toggle border-secondary"
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Filtros
              {totalSelected > 0 && (
                <span className="badge bg-warning text-dark ms-1">{totalSelected}</span>
              )}
            </button>

            {dropdownOpen && (
              <div
                className="position-absolute bg-dark border border-secondary rounded shadow-lg"
                style={{ top: '100%', left: 0, zIndex: 1050, minWidth: '240px', maxHeight: '460px', overflowY: 'auto' }}
              >
                {/* Género */}
                <button
                  type="button"
                  className="w-100 d-flex align-items-center justify-content-between px-3 py-2 border-0 border-bottom border-secondary bg-transparent"
                  style={{ color: '#00f2fe', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
                  onClick={() => toggleSection('genre')}
                >
                  <span>GÉNERO</span>
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: openSections.genre ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                </button>
                {openSections.genre && (
                  <>
                    {genres.length === 0 && <div className="px-3 py-1 text-secondary small">Sin datos</div>}
                    {genres.map((g) => (
                      <label
                        key={g._id}
                        className="dropdown-item text-white d-flex align-items-center gap-2 px-4 py-1"
                        style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGenres.has(g._id)}
                          onChange={() => toggle(setSelectedGenres, g._id)}
                          style={{ accentColor: '#00f2fe' }}
                        />
                        {g.name}
                      </label>
                    ))}
                  </>
                )}

                {/* Desarrollador */}
                <button
                  type="button"
                  className="w-100 d-flex align-items-center justify-content-between px-3 py-2 border-0 border-top border-bottom border-secondary bg-transparent"
                  style={{ color: '#00f2fe', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
                  onClick={() => toggleSection('dev')}
                >
                  <span>DESARROLLADOR</span>
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: openSections.dev ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                </button>
                {openSections.dev && (
                  <>
                    {developers.length === 0 && <div className="px-3 py-1 text-secondary small">Sin datos</div>}
                    {developers.map((dev) => (
                      <label
                        key={dev}
                        className="dropdown-item text-white d-flex align-items-center gap-2 px-4 py-1"
                        style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDevs.has(dev)}
                          onChange={() => toggle(setSelectedDevs, dev)}
                          style={{ accentColor: '#00f2fe' }}
                        />
                        {dev}
                      </label>
                    ))}
                  </>
                )}

                {/* Año de lanzamiento */}
                <button
                  type="button"
                  className="w-100 d-flex align-items-center justify-content-between px-3 py-2 border-0 border-top border-bottom border-secondary bg-transparent"
                  style={{ color: '#00f2fe', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
                  onClick={() => toggleSection('year')}
                >
                  <span>AÑO DE LANZAMIENTO</span>
                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: openSections.year ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                </button>
                {openSections.year && (
                  <>
                    {years.length === 0 && <div className="px-3 py-1 text-secondary small">Sin datos</div>}
                    {years.map((yr) => (
                      <label
                        key={yr}
                        className="dropdown-item text-white d-flex align-items-center gap-2 px-4 py-1"
                        style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedYears.has(String(yr))}
                          onChange={() => toggle(setSelectedYears, String(yr))}
                          style={{ accentColor: '#00f2fe' }}
                        />
                        {yr}
                      </label>
                    ))}
                  </>
                )}

                <div className="d-flex gap-2 px-3 py-2 border-top border-secondary">
                  <button type="button" className="btn btn-warning btn-sm flex-grow-1" onClick={applyFilters}>
                    Aplicar
                  </button>
                  {totalSelected > 0 && (
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            )}

            <input
              type="text"
              className="form-control"
              placeholder="Buscar por título, género, desarrollador o año..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button className="btn btn-warning" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </form>

        <div className="navbar-nav align-items-lg-center ms-lg-auto mt-2 mt-lg-0">
          <Link className="nav-link fw-bold" to="/library" onClick={() => setMenuOpen(false)}>
            <i className="bi bi-controller me-1"></i>Mi Biblioteca
          </Link>
          {user ? (
            <div className="d-flex align-items-center mt-2 mt-lg-0 ms-lg-3 gap-2">
              <Link to="/profile" className="d-flex align-items-center text-decoration-none" onClick={() => setMenuOpen(false)}>
                <img
                  src={user.profile_pic ? `http://localhost:5000${user.profile_pic}` : '/default-avatar.png'}
                  alt="Profile"
                  className="rounded-circle me-2"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <span className="text-white me-2">{user.username}</span>
              </Link>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => { logout(); setMenuOpen(false); }}>Cerrar Sesión</button>
            </div>
          ) : (
            <Link className="btn btn-neon mt-2 mt-lg-0 ms-lg-3" to="/login" onClick={() => setMenuOpen(false)}>Identifícate</Link>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;