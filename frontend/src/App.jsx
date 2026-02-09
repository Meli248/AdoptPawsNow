import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/privateRoute';
import PublicRoute from './routes/publicRoute'; // Ensure this logic exists too
import AdminRoute from './routes/Adminroute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import About from './pages/public/About';

// Pages from the 'private' folder (based on your VS Code explorer)
import Home from './pages/private/Home';
import Adopt from './pages/private/Adopt';
import Profile from './pages/private/Profile';
import PetDetail from './pages/private/Petdetail'; // Note: lowercase 'd' in filename
import AdminDashboard from './pages/private/Admindashboard'; // Note: lowercase 'd'
import ManageUsers from './pages/private/Manageusers'; // Note: lowercase 'u'
import SurrenderRequest from './pages/private/SurrenderRequest'; // Added
import AdminSurrenderRequests from './pages/private/AdminSurrenderRequests';
import AdminAdoptionRequests from './pages/private/AdminAdoptionRequests';
import AdminCreatePost from './pages/private/AdminCreatePost';
import AdminEditPet from './pages/private/AdminEditPet';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* 1. Public Routes: Only for guest users */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 2. Open Routes: Accessible to everyone */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* 3. Private Routes: Requires any logged-in user */}
        <Route element={<PrivateRoute />}>
          <Route path="/pet/:petId" element={<PetDetail />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/surrender-request" element={<SurrenderRequest />} /> {/* Added */}
        </Route>

        {/* 4. Admin Routes: Requires logged-in user AND 'admin' role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/surrender-requests" element={<AdminSurrenderRequests />} />
          <Route path="/admin/adoption-requests" element={<AdminAdoptionRequests />} />
          <Route path="/admin/create-post" element={<AdminCreatePost />} />
          <Route path="/admin/edit-pet/:id" element={<AdminEditPet />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;