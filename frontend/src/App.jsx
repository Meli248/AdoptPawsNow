import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/privateRoute';
import PublicRoute from './routes/publicRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Shared Pages (both public and private)
import Home from './pages/private/Home';
import About from './pages/public/About';

// Private Pages
import Adopt from './pages/private/Adopt';
import Missing from './pages/private/Missing';
import Profile from './pages/private/profile';

function App() {
  const isAuthenticated = localStorage.getItem('access_token');

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Shared Routes - Accessible to both public and authenticated users */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Private Routes - Accessible only when logged in */}
        <Route element={<PrivateRoute />}>
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/missing" element={<Missing />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Root path redirects based on auth status */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? <Navigate to="/home" replace /> 
              : <Navigate to="/home" replace />
          } 
        />

        {/* Catch all - redirect to home */}
        <Route 
          path="*" 
          element={<Navigate to="/home" replace />} 
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;