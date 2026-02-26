import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated) {
    return userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;