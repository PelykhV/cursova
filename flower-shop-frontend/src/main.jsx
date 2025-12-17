import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import MyNotificationsPage from './pages/MyNotificationsPage.jsx';
import AdminCustomersPage from './pages/AdminCustomersPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';
import AdminBouquetsPage from './pages/AdminBouquetsPage.jsx';
import AdminOptionsPage from './pages/AdminOptionsPage.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import './styles/public.css';
import './styles/admin.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* публічний layout */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <App />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      <Route
        path="/order"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <OrderPage />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <ProfilePage />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/orders"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <MyOrdersPage />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/notifications"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <MyNotificationsPage />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      {/* адмінський layout */}
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminOrdersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminCustomersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bouquets"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminBouquetsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/options"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminOptionsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
