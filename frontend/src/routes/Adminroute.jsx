import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;