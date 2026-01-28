import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check if token exists in Local Storage
  const token = localStorage.getItem('access_token');

  // If no token, redirect to login
  // If token exists, render the child routes (Outlet)
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;