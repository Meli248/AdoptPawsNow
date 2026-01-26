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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/home" element={<Home />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;