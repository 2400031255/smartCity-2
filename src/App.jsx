import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Portal from './pages/Portal';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import Places from './pages/Places';
import Services from './pages/Services';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

function PrivateRoute({ children, adminOnly }) {
  const { user } = useAuth();
  if (!user) {
    const expiry = localStorage.getItem('sessionExpiry');
    const expired = expiry && Date.now() > Number(expiry);
    return <Navigate to="/" state={{ expired }} replace />;
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><Layout><ReportIssue /></Layout></PrivateRoute>} />
          <Route path="/issues" element={<PrivateRoute><Layout><MyIssues /></Layout></PrivateRoute>} />
          <Route path="/places" element={<PrivateRoute><Layout><Places /></Layout></PrivateRoute>} />
          <Route path="/services" element={<PrivateRoute><Layout><Services /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><Layout><AdminPanel /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
