import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Adopt from './pages/Adopt';
import Missing from './pages/Missing';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import './css/App.css'

function AppContent() {
  const location = useLocation();
  const noFooterRoutes = ["/login", "/register"]; // pages without footer

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/missing" element={<Missing />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {!noFooterRoutes.includes(location.pathname) && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App;
