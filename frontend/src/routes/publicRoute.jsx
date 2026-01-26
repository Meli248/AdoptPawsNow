import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem('access_token');

  // If user is already logged in, don't let them see Login/Register
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;