import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
