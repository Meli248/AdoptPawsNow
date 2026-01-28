import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/privateRoute';
import PublicRoute from './routes/publicRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import About from './pages/public/About';

// Private Pages
import Dashboard from './pages/private/Dashboard';
import Adopt from './pages/private/Adopt';
import Home from './pages/private/Home';
import Missing from './pages/private/Missing';
// import Profile from './pages/private/Profile';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Private Routes - Accessible only when logged in */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/missing" element={<Missing />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Route>

        {/* Root path redirects to home (private) or login (public) */}
        <Route 
          path="/" 
          element={
            localStorage.getItem('access_token') 
              ? <Navigate to="/home" replace /> 
              : <Navigate to="/login" replace />
          } 
        />

        {/* Catch all - redirect to home or login based on auth status */}
        <Route 
          path="*" 
          element={
            localStorage.getItem('access_token') 
              ? <Navigate to="/home" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;