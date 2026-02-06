import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;