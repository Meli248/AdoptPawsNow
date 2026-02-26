import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, MapPin, Calendar, Edit2, Phone, Save, X, Dog, Heart,
  AlertTriangle, Clock, User, Hash, FileText, Palette, Activity, Layout
} from 'lucide-react';
import '../../css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('user_role') === 'admin';
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: ''
  });
  const [editedData, setEditedData] = useState({ ...userData });
  const [editFormData, setEditFormData] = useState({});
  const [stats, setStats] = useState({
    totalPosts: 0,
    adopted: 0,
    surrenderPosts: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats({
          totalPosts: Number(data.data.totalPosts) || 0,
          adopted: Number(data.data.adopted) || 0,
          surrenderPosts: 0
        });
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        loadFallbackUserData();
        setProfileLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('user_email');
          navigate('/login');
          return;
        }
        console.error('Profile fetch failed:', response.status);
        loadFallbackUserData();
        setProfileLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        const profileData = {
          name: user.name || user.username || user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          joinedDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently'
        };
        setUserData(profileData);
        setEditedData(profileData);

        localStorage.setItem('user_name', profileData.name);
        localStorage.setItem('user', profileData.name);
        localStorage.setItem('user_email', profileData.email);
      } else {
        loadFallbackUserData();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      loadFallbackUserData();
    } finally {
      setProfileLoading(false);
    }
  };

  const loadFallbackUserData = () => {
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user') || localStorage.getItem('user_name');

    if (userEmail || userName) {
      const fallbackData = {
        name: userName || '',
        email: userEmail || '',
        phone: '',
        location: '',
        joinedDate: 'Recently'
      };
      setUserData(fallbackData);
      setEditedData(fallbackData);
    }
  };

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    fetchUserFavorites();
    fetchStats();
  }, []);
  /* Restore fetchUserFavorites and fetchUserPosts */
  const fetchUserFavorites = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.ok ? await response.json() : { success: false, data: [] };

      if (data.success && data.data) {
        const formattedFavs = data.data.map(pet => ({
          id: pet.pet_id,
          petName: pet.name,
          breed: pet.breed || 'Mixed',
          petType: pet.species || 'Pet',
          location: pet.location || 'Not specified',
          image: getImageUrl(pet.image_url),
          status: pet.status,
          age: pet.age,
          gender: pet.gender,
          contact_name: pet.contact_name,
          description: pet.description
        }));
        setFavorites(formattedFavs);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // If admin, fetch global counts for stats
      const [petsResponse, surrenderResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/pets/my-posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/surrender/my-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (petsResponse.status === 401 || surrenderResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const petsData = petsResponse.ok ? await petsResponse.json() : { success: false, data: [] };
      const surrenderData = surrenderResponse.ok ? await surrenderResponse.json() : { success: false, data: [] };

      const allPosts = [];
      let adoptionCount = 0;

      if (petsData?.success && petsData.data) {
        const adoptionPosts = petsData.data.map(pet => ({
          id: pet.pet_id,
          petName: pet.name,
          breed: pet.breed || 'Mixed',
          petType: pet.species || 'Pet',
          location: pet.contact_name || 'Not specified',
          image: getImageUrl(pet.image_url),
          postType: 'adoption',
          status: pet.status,
          age: pet.age,
          gender: pet.gender,
          size: pet.size,
          color: pet.color,
          description: pet.description,
          vaccinated: pet.vaccinated,
          neutered: pet.neutered,
          contact_name: pet.contact_name,
          contact_email: pet.contact_email,
          contact_phone: pet.contact_phone,
          contact_type: pet.contact_type,
          createdAt: pet.created_at
        }));
        allPosts.push(...adoptionPosts);
        adoptionCount = adoptionPosts.length;
      }

      if (surrenderData?.success && surrenderData.data) {
        const surrenderPosts = surrenderData.data.map(req => ({
          id: req.application_id,
          petName: req.pet_name,
          breed: req.breed || 'Mixed',
          petType: req.pet_type,
          location: req.location || 'Surrender Request',
          image: getImageUrl(req.image_url),
          postType: 'surrender',
          status: req.status, // pending, approved, rejected
          age: req.age,
          gender: req.gender,
          description: req.reason, // Store raw reason
          reason: req.reason,     // Store raw reason explicitly
          contact_name: req.contact_name,
          contact_email: req.contact_email,
          contact_phone: req.contact_phone,
          createdAt: req.created_at
        }));
        allPosts.push(...surrenderPosts);
      }

      // Sort by newest first
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setUserPosts(allPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
    if (imageUrl.startsWith('http')) return imageUrl;

    // Strip '/api' from the end of VITE_API_URL if it exists
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

    // Ensure imageUrl starts with / if it doesn't
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

    return `${baseUrl}${cleanPath}`;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (editedData.phone && !phoneRegex.test(editedData.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please log in to update your profile');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedData.name,
          phone: editedData.phone,
          location: editedData.location
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(editedData);
        localStorage.setItem('user_name', editedData.name);
        localStorage.setItem('user', editedData.name);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    if (post.postType === 'surrender') {
      setEditFormData({
        petName: post.petName || '',
        petType: post.petType?.toLowerCase() || 'dog',
        breed: post.breed || '',
        age: post.age || '',
        gender: post.gender || 'unknown',
        reason: post.reason || '',
        contact_name: post.contact_name || '',
        contact_email: post.contact_email || '',
        contact_phone: post.contact_phone || '',
        location: post.location || ''
      });
    } else {
      setEditFormData({
        petName: post.petName || '',
        species: post.petType?.toLowerCase() || 'dog',
        breed: post.breed || '',
        age: post.age || '',
        gender: post.gender || '',
        size: post.size || 'medium',
        color: post.color || '',
        status: post.status || 'available',
        description: post.description || '',
        vaccinated: post.vaccinated || false,
        neutered: post.neutered || false,
        contact_name: post.contact_name || '',
        contact_email: post.contact_email || '',
        contact_phone: post.contact_phone || ''
      });
    }
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      let endpoint;
      let updateData;

      if (editingPost.postType === 'surrender') {
        endpoint = `${import.meta.env.VITE_API_URL}/surrender/${editingPost.id}`;
        updateData = {
          pet_name: editFormData.petName,
          pet_type: editFormData.petType,
          breed: editFormData.breed,
          age: editFormData.age,
          gender: editFormData.gender,
          reason: editFormData.reason,
          contact_name: editFormData.contact_name,
          contact_email: editFormData.contact_email,
          contact_phone: editFormData.contact_phone,
          location: editFormData.location
        };
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/pets/${editingPost.id}`;
        updateData = {
          name: editFormData.petName,
          species: editFormData.species,
          breed: editFormData.breed,
          age: editFormData.age,
          gender: editFormData.gender,
          size: editFormData.size,
          color: editFormData.color,
          status: editFormData.status,
          description: editFormData.description,
          vaccinated: editFormData.vaccinated,
          neutered: editFormData.neutered,
          contact_name: editFormData.contact_name,
          contact_email: editFormData.contact_email,
          contact_phone: editFormData.contact_phone
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Post updated successfully!');
        setShowEditModal(false);
        setEditingPost(null);
        fetchUserPosts();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleDeletePost = async (postId, postType) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const endpoint = postType === 'surrender'
        ? `${import.meta.env.VITE_API_URL}/surrender/${postId}`
        : `${import.meta.env.VITE_API_URL}/pets/pets/${postId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Post deleted successfully!');
        fetchUserPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (profileLoading) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="no-posts-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Welcome back, {userData.name || 'Friend'}!</h1>
            <p className="dashboard-subtitle">Manage your profile and pet posts</p>
          </div>
        </div>

        {/* Stats Grid - only for regular users */}
        {!isAdmin && (
          <div className="stats-grid-dashboard">
            <div className="stat-card-dashboard">
              <div className="stat-icon-wrapper">
                <Dog size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number-dashboard">{stats.totalPosts}</div>
                <div className="stat-label-dashboard">Total Posts</div>
              </div>
            </div>
            <div className="stat-card-dashboard">
              <div className="stat-icon-wrapper">
                <Heart size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number-dashboard">{stats.adopted}</div>
                <div className="stat-label-dashboard">Adopted</div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="profile-section">
          <div className="section-header-dashboard">
            <h2 className="section-title-dashboard">Profile Information</h2>
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={handleEditToggle}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleSaveProfile} style={{ width: '100%' }}>
                  <Save size={18} />
                  Save
                </button>
                <button className="btn btn-secondary" onClick={handleEditToggle} style={{ width: '100%' }}>
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-card">
            <div className="profile-basic-info-section">
              {!isEditing ? (
                <>
                  <h3 className="profile-name">{userData.name || 'User'}</h3>
                  <p className="profile-role">Pet Enthusiast</p>
                </>
              ) : (
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                  <label className="form-label">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="form-input"
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <Mail size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">{userData.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <Phone size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Phone</span>
                  {!isEditing ? (
                    <span className="profile-detail-value">{userData.phone || 'Not provided'}</span>
                  ) : (
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('phone', val);
                      }}
                      className="form-input"
                      placeholder="Your 10-digit phone number"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        marginTop: '4px'
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <MapPin size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Location</span>
                  {!isEditing ? (
                    <span className="profile-detail-value">{userData.location || 'Not provided'}</span>
                  ) : (
                    <input
                      type="text"
                      value={editedData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="form-input"
                      placeholder="Your location"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e9ecef',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        marginTop: '4px'
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <Calendar size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">{userData.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {!isAdmin && (
          <div className="posts-section">
            <div className="section-header-dashboard" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                className={`section-title-dashboard ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === 'posts' ? '3px solid var(--primary-color)' : 'none', paddingBottom: '5px', cursor: 'pointer', opacity: activeTab === 'posts' ? 1 : 0.5 }}
              >
                My Posts
              </button>
              <button
                className={`section-title-dashboard ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
                style={{ background: 'none', border: 'none', borderBottom: activeTab === 'favorites' ? '3px solid var(--primary-color)' : 'none', paddingBottom: '5px', cursor: 'pointer', opacity: activeTab === 'favorites' ? 1 : 0.5 }}
              >
                Favorites
              </button>
            </div>

            {activeTab === 'posts' ? (
              loading ? (
                <div className="no-posts-container">
                  <p>Loading posts...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="no-posts-container">
                  <div className="no-posts-icon">
                    <Dog size={40} />
                  </div>
                  <h3 className="no-posts-title">No Posts Yet</h3>
                  <p className="no-posts-subtitle">
                    Start by creating your first post to help pets find homes or reunite missing pets with their families.
                  </p>
                </div>
              ) : (
                <div className="pets-grid">
                  {userPosts.map((post) => (
                    <div
                      key={`${post.postType}-${post.id}`}
                      className="pet-card fade-in"
                      onClick={() => post.postType === 'adoption' && navigate(`/pet/${post.id}`)}
                      style={{ cursor: post.postType === 'adoption' ? 'pointer' : 'default' }}
                    >
                      <div className="pet-image-wrapper">
                        <img src={post.image} alt={post.petName} className="pet-image" />
                        <div className={`pet-status ${post.status === 'available' || !post.status ? 'available' : 'unavailable'}`}>
                          {post.status === 'available' || !post.status ? 'Available' : post.status}
                        </div>
                      </div>
                      <div className="pet-info">
                        <h3 className="pet-name">{post.petName}</h3>
                        <p className="pet-breed">
                          {post.breed} • {post.petType} {post.age && `• ${post.age} years`}
                        </p>
                        <div className="pet-location">
                          <MapPin size={16} />
                          {post.location}
                        </div>
                        <p className="pet-description">
                          {post.description && post.description.length > 50
                            ? `${post.description.substring(0, 50)}...`
                            : post.description || (post.postType === 'adoption' ? 'A wonderful pet looking for a loving home.' : 'Surrender Request')}
                        </p>

                        <div className="post-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id, post.postType); }}
                            style={{ color: '#dc2626' }}
                          >
                            <X size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Favorites Tab
              <div className="pets-grid">
                {favorites.length === 0 ? (
                  <div className="no-posts-container" style={{ gridColumn: '1/-1' }}>
                    <Heart size={40} style={{ margin: '0 auto', display: 'block', color: '#ccc' }} />
                    <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>No favorites yet.</p>
                  </div>
                ) : (
                  favorites.map((pet) => (
                    <div key={pet.id} className="pet-card fade-in">
                      <div className="pet-image-wrapper">
                        <img src={pet.image} alt={pet.petName} className="pet-image" />
                        <div className={`pet-status ${pet.status === 'available' || !pet.status ? 'available' : 'unavailable'}`}>
                          {pet.status === 'available' || !pet.status ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                      <div className="pet-info">
                        <h3 className="pet-name">{pet.petName}</h3>
                        <p className="pet-breed">
                          {pet.breed} • {pet.petType}
                        </p>
                        <div className="pet-location">
                          <MapPin size={16} />
                          {pet.location}
                        </div>
                        <p className="pet-description">
                          {pet.description?.substring(0, 100)}...
                        </p>
                        <button
                          onClick={() => navigate(`/pet/${pet.id}`)}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', marginTop: '10px' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {showEditModal && editingPost && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  <Edit2 size={24} />
                  Edit {editingPost.postType === 'adoption' ? 'Adoption' : 'Surrender'} Post
                </h2>
                <p className="modal-subtitle">Update the details of your post</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="create-post-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Pet Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.petName}
                  onChange={(e) => handleEditFormChange('petName', e.target.value)}
                  placeholder="Pet name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Dog size={18} />
                    Species *
                  </label>
                  <select
                    className="form-input"
                    value={editingPost.postType === 'surrender' ? editFormData.petType : editFormData.species}
                    onChange={(e) => handleEditFormChange(editingPost.postType === 'surrender' ? 'petType' : 'species', e.target.value)}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Hash size={18} />
                    Breed
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.breed}
                    onChange={(e) => handleEditFormChange('breed', e.target.value)}
                    placeholder="Breed"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={18} />
                    Age
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.age}
                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    Gender
                  </label>
                  <select
                    className="form-input"
                    value={editFormData.gender}
                    onChange={(e) => handleEditFormChange('gender', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              {editingPost.postType === 'adoption' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <Layout size={18} />
                        Size
                      </label>
                      <select
                        className="form-input"
                        value={editFormData.size}
                        onChange={(e) => handleEditFormChange('size', e.target.value)}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Palette size={18} />
                        Color
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.color}
                        onChange={(e) => handleEditFormChange('color', e.target.value)}
                        placeholder="Color"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Activity size={18} />
                      Status
                    </label>
                    <select
                      className="form-input"
                      value={editFormData.status}
                      onChange={(e) => handleEditFormChange('status', e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="adopted">Adopted</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FileText size={18} />
                      Description
                    </label>
                    <textarea
                      className="form-textarea"
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      placeholder="Description"
                      rows="3"
                    />
                  </div>

                  <div className="form-row checkbox-row">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editFormData.vaccinated}
                          onChange={(e) => handleEditFormChange('vaccinated', e.target.checked)}
                        />
                        <span>Vaccinated</span>
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editFormData.neutered}
                          onChange={(e) => handleEditFormChange('neutered', e.target.checked)}
                        />
                        <span>Neutered/Spayed</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.contact_name}
                      onChange={(e) => handleEditFormChange('contact_name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <Mail size={18} />
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        value={editFormData.contact_email}
                        onChange={(e) => handleEditFormChange('contact_email', e.target.value)}
                        placeholder="Contact email"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingPost.postType === 'surrender' && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={18} />
                      Location
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.location}
                      onChange={(e) => handleEditFormChange('location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <FileText size={18} />
                      Reason for Surrender
                    </label>
                    <textarea
                      className="form-textarea"
                      value={editFormData.reason}
                      onChange={(e) => handleEditFormChange('reason', e.target.value)}
                      rows="3"
                      placeholder="Reason..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Contact Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.contact_name}
                      onChange={(e) => handleEditFormChange('contact_name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={18} />
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={editFormData.contact_email}
                      onChange={(e) => handleEditFormChange('contact_email', e.target.value)}
                      placeholder="Contact email"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={editFormData.contact_phone}
                  onChange={(e) => handleEditFormChange('contact_phone', e.target.value)}
                  placeholder="Contact phone"
                />
              </div>

              <div className="form-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  <Save size={18} /> Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Profile;