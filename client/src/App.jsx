  import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import CreateReview from './pages/CreateReview';
import Library from './pages/Library';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminGames from './pages/AdminGames';
import AdminGenres from './pages/AdminGenres';
import CreateGenre from './pages/CreateGenre';
import CreateUser from './pages/CreateUser';
import UserRequests from './pages/UserRequests';
import UserGames from './pages/UserGames';
import UserGamePanel from './pages/UserGamePanel';
import PendingGameRequests from './pages/PendingGameRequests';
import SearchResults from './pages/SearchResults';
import AdminReports from './pages/AdminReports';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games/:gameId" element={<ProtectedRoute><GameDetail /></ProtectedRoute>} />
          <Route path="/games/:gameId/review" element={<ProtectedRoute><CreateReview /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-game" element={<ProtectedRoute><AdminGames /></ProtectedRoute>} />
          <Route path="/admin/create-game/new" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/create-genre" element={<ProtectedRoute><AdminGenres /></ProtectedRoute>} />
          <Route path="/admin/create-genre/new" element={<ProtectedRoute><CreateGenre /></ProtectedRoute>} />
          <Route path="/admin/create-user" element={<ProtectedRoute><UserRequests /></ProtectedRoute>} />
          <Route path="/admin/create-user/new" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
          <Route path="/admin/user-requests" element={<ProtectedRoute><PendingGameRequests /></ProtectedRoute>} />
          <Route path="/my-games" element={<ProtectedRoute><UserGames /></ProtectedRoute>} />
          <Route path="/my-games/new" element={<ProtectedRoute><UserGamePanel /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;