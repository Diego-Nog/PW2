import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_URL from '../config';

const REPORTS = [
  {
    key: 'top-rated-by-genre',
    label: 'Top Rated por Género',
    description: 'Juegos mejor calificados por categoría (Games + Genres + Reviews)'
  },
  {
    key: 'critic-activity',
    label: 'Actividad de Críticos',
    description: 'Usuarios con mayor volumen de reseñas generadas por mes (Users + Reviews)'
  },
  {
    key: 'launch-trends',
    label: 'Tendencias de Lanzamiento',
    description: 'Años de lanzamiento con más atención actualmente (Games + Reviews)'
  },
  {
    key: 'system-health',
    label: 'Salud del Sistema',
    description: 'Frecuencia de errores en login y publicación (System Logs)'
  }
];

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ── Subcomponentes de visualización ──────────────────────────────────────────

const TopRatedByGenre = ({ data }) => {
  if (!data.length) return <p className="text-secondary">No hay datos disponibles.</p>;
  return (
    <div className="row g-4">
      {data.map((genre) => (
        <div className="col-12 col-md-6" key={genre._id}>
          <div
            className="rounded p-3 h-100"
            style={{ background: '#1a1a1a', border: '1px solid var(--neon-cyan)' }}
          >
            <h6 style={{ color: 'var(--neon-cyan)', marginBottom: '0.75rem' }}>
              🗂️ {genre.genre_name}
            </h6>
            <table className="table table-sm table-dark table-borderless mb-0">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Juego</th>
                  <th>Rating Prom.</th>
                  <th>Reseñas</th>
                </tr>
              </thead>
              <tbody>
                {genre.top_games.map((g, i) => (
                  <tr key={i}>
                    <td className="text-white">{g.game_title}</td>
                    <td>
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        {g.avg_rating}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '0.75rem' }}>/10</span>
                    </td>
                    <td className="text-secondary">{g.review_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

const CriticActivity = ({ data }) => {
  if (!data.length) return <p className="text-secondary">No hay datos disponibles.</p>;
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover table-bordered">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Año</th>
            <th>Mes</th>
            <th>Reseñas publicadas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ color: '#a855f7', fontWeight: 'bold' }}>{row.username}</td>
              <td className="text-white">{row.year}</td>
              <td className="text-white">{MONTH_NAMES[row.month - 1]}</td>
              <td>
                <span className="badge" style={{ background: '#a855f7', fontSize: '0.9rem' }}>
                  {row.review_count}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LaunchTrends = ({ data }) => {
  if (!data.length) return <p className="text-secondary">No hay datos disponibles.</p>;
  const maxReviews = Math.max(...data.map((r) => r.review_count), 1);
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover table-bordered">
        <thead>
          <tr>
            <th>Año de lanzamiento</th>
            <th>Juegos</th>
            <th>Reseñas recibidas</th>
            <th>Rating promedio</th>
            <th style={{ width: '25%' }}>Popularidad relativa</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{row.release_year}</td>
              <td className="text-secondary">{row.game_count}</td>
              <td className="text-white">{row.review_count}</td>
              <td>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{row.avg_rating}</span>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>/10</span>
              </td>
              <td>
                <div
                  style={{
                    height: '10px',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, var(--neon-cyan) ${Math.round(
                      (row.review_count / maxReviews) * 100
                    )}%, #2a2a2a 0%)`
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SystemHealth = ({ data }) => {
  if (!data.length)
    return <p className="text-secondary">No se han registrado errores. ✅</p>;
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover table-bordered">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Frecuencia de errores</th>
            <th>Último detalle</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="text-white">{row.date}</td>
              <td>
                <span
                  className="badge"
                  style={{ background: '#e11d48', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                  {row.action}
                </span>
              </td>
              <td>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{row.count}</span>
              </td>
              <td className="text-secondary" style={{ fontSize: '0.8rem', maxWidth: '300px', wordBreak: 'break-word' }}>
                {row.last_error
                  ? typeof row.last_error === 'object'
                    ? JSON.stringify(row.last_error)
                    : String(row.last_error)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

const AdminReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user || !user.is_admin) {
    navigate('/');
    return null;
  }

  const handleReportChange = async (e) => {
    const key = e.target.value;
    setSelectedReport(key);
    setReportData(null);
    setError(null);

    if (!key) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/reports/${key}`);
      setReportData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const currentReportMeta = REPORTS.find((r) => r.key === selectedReport);

  const renderReport = () => {
    if (loading) return <p className="text-secondary text-center mt-4">Cargando reporte...</p>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;
    if (!reportData) return null;

    switch (selectedReport) {
      case 'top-rated-by-genre':
        return <TopRatedByGenre data={reportData} />;
      case 'critic-activity':
        return <CriticActivity data={reportData} />;
      case 'launch-trends':
        return <LaunchTrends data={reportData} />;
      case 'system-health':
        return <SystemHealth data={reportData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100">
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '960px' }}>
        <div className="game-card p-5">
          <h2 className="section-title mb-2 text-white text-center">
            Reportes del <span className="cyan-text">Sistema</span>
          </h2>
          <p className="text-secondary text-center mb-5">
            Selecciona un reporte para visualizar los datos.
          </p>

          {/* Filtro de selección */}
          <div className="mb-4">
            <label className="form-label text-white fw-bold">Tipo de reporte</label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={selectedReport}
              onChange={handleReportChange}
              style={{ maxWidth: '500px' }}
            >
              <option value="">— Selecciona un reporte —</option>
              {REPORTS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            {currentReportMeta && (
              <div className="mt-2 text-secondary" style={{ fontSize: '0.85rem' }}>
                {currentReportMeta.description}
              </div>
            )}
          </div>

          {/* Contenido del reporte */}
          <div className="mt-3">{renderReport()}</div>

          <div className="text-center mt-5">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin')}
            >
              Volver al Panel de Administración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
