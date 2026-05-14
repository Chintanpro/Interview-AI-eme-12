import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './lib/store';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import CompanyPrep from './pages/CompanyPrep';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Progress from './pages/Progress';
import SalaryCoach from './pages/SalaryCoach';
import Settings from './pages/Settings';
import SessionComplete from './pages/SessionComplete';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="interview" element={<InterviewSetup />} />
            <Route path="interview/session/:sessionId" element={<InterviewSession />} />
            <Route path="interview/session/:sessionId/complete" element={<SessionComplete />} />
            <Route path="company-prep" element={<CompanyPrep />} />
            <Route path="resume" element={<ResumeAnalysis />} />
            <Route path="progress" element={<Progress />} />
            <Route path="salary" element={<SalaryCoach />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster position="top-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
