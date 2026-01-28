import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem('access_token');

  // If user is already logged in, redirect them to home
  // If not logged in, show the public pages (Outlet)
  return token ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;