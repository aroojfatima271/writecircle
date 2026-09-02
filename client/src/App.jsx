import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import ProjectDetail from './pages/ProjectDetail';
import ChapterReader from './pages/ChapterReader';
import ChapterEditor from './pages/ChapterEditor';
import NewProject from './pages/NewProject';
import Circles from './pages/Circles';
import CircleDetail from './pages/CircleDetail';
import WriterProfile from './pages/WriterProfile';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const App = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/circles" element={<Circles />} />
        <Route path="/circles/:slug" element={<CircleDetail />} />
        <Route path="/writers/:username" element={<WriterProfile />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/projects/:slug/chapters/:chapterId" element={<ChapterReader />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/new-project" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route
          path="/projects/:slug/chapters/:chapterId/edit"
          element={<ProtectedRoute><ChapterEditor /></ProtectedRoute>}
        />
        <Route
          path="/projects/:projectId/new-chapter"
          element={<ProtectedRoute><ChapterEditor /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
