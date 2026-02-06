import { useState, useEffect } from 'react';
import { 
  Mail, MapPin, Calendar, Edit2, Phone, Save, X, Dog, Heart,
  AlertTriangle, Clock, User
} from 'lucide-react';
import '../../css/Profile.css';

const Profile = () => {
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
    adoptionPosts: 0,
    missingPosts: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

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

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [adoptionResponse, missingResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/pets/my-posts`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/missing/my-posts`, { headers })
      ]);

      const adoptionData = adoptionResponse.ok ? await adoptionResponse.json() : { success: false, data: [] };
      const missingData = missingResponse.ok ? await missingResponse.json() : { success: false, data: [] };

      const allPosts = [];
      let adoptionCount = 0;
      let missingCount = 0;

      if (adoptionData?.success && adoptionData.data) {
        const adoptionPosts = adoptionData.data.map(pet => ({
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
          createdAt: pet.created_at
        }));
        allPosts.push(...adoptionPosts);
        adoptionCount = adoptionPosts.length;
      }

      if (missingData?.success && missingData.data) {
        const missingPosts = missingData.data.map(pet => ({
          id: pet.missing_id,
          petName: pet.pet_name,
          breed: pet.breed || 'Mixed',
          petType: pet.species || 'Pet',
          location: pet.last_seen_location || 'Location N/A',
          image: getImageUrl(pet.image_url),
          postType: 'missing',
          status: pet.status,
          lastSeen: pet.last_seen_date,
          gender: pet.gender,
          age: pet.age,
          color: pet.color,
          description: pet.description,
          owner_name: pet.owner_name,
          owner_email: pet.owner_email,
          owner_phone: pet.owner_phone,
          reward: pet.reward,
          createdAt: pet.created_at
        }));
        allPosts.push(...missingPosts);
        missingCount = missingPosts.length;
      }

      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setUserPosts(allPosts);
      setStats({
        totalPosts: allPosts.length,
        adoptionPosts: adoptionCount,
        missingPosts: missingCount
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}${imageUrl}`;
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
    if (post.postType === 'adoption') {
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
    } else {
      setEditFormData({
        petName: post.petName || '',
        species: post.petType?.toLowerCase() || 'dog',
        breed: post.breed || '',
        age: post.age || '',
        gender: post.gender || '',
        color: post.color || '',
        status: post.status || 'missing',
        description: post.description || '',
        location: post.location || '',
        lastSeen: post.lastSeen ? new Date(post.lastSeen).toISOString().split('T')[0] : '',
        reward: post.reward || ''
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
      
      let endpoint, updateData;
      
      if (editingPost.postType === 'adoption') {
        endpoint = `${import.meta.env.VITE_API_URL}/pets/pets/${editingPost.id}`;
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
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/missing/missing-pets/${editingPost.id}`;
        updateData = {
          pet_name: editFormData.petName,
          species: editFormData.species,
          breed: editFormData.breed,
          age: editFormData.age,
          gender: editFormData.gender,
          color: editFormData.color,
          status: editFormData.status,
          description: editFormData.description,
          last_seen_location: editFormData.location,
          last_seen_date: editFormData.lastSeen,
          reward: editFormData.reward
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
      const endpoint = postType === 'adoption' 
        ? `${import.meta.env.VITE_API_URL}/pets/pets/${postId}`
        : `${import.meta.env.VITE_API_URL}/missing/missing-pets/${postId}`;

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

        {/* Stats Grid */}
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
              <div className="stat-number-dashboard">{stats.adoptionPosts}</div>
              <div className="stat-label-dashboard">For Adoption</div>
            </div>
          </div>
          <div className="stat-card-dashboard">
            <div className="stat-icon-wrapper">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number-dashboard">{stats.missingPosts}</div>
              <div className="stat-label-dashboard">Missing Pets</div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="section-header-dashboard">
            <h2 className="section-title-dashboard">Profile Information</h2>
            {!isEditing ? (
              <button className="btn-icon-edit" onClick={handleEditToggle}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-icon-save" onClick={handleSaveProfile}>
                  <Save size={18} />
                  Save
                </button>
                <button className="btn-icon-cancel" onClick={handleEditToggle}>
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
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="form-input"
                      placeholder="Your phone number"
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
        <div className="posts-section">
          <div className="section-header-dashboard">
            <h2 className="section-title-dashboard">My Posts</h2>
          </div>

          {loading ? (
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
            <div className="user-posts-grid">
              {userPosts.map((post) => (
                <div key={`${post.postType}-${post.id}`} className="user-post-card">
                  <div className="post-image-wrapper">
                    <img src={post.image} alt={post.petName} className="post-image" />
                    <div className={`post-type-badge ${post.postType}`}>
                      {post.postType === 'adoption' ? 'For Adoption' : 'Missing'}
                    </div>
                    <div className="post-status-badge">{post.status}</div>
                  </div>
                  <div className="post-content">
                    <h3 className="post-pet-name">{post.petName}</h3>
                    <p className="post-breed">{post.breed} • {post.petType}</p>
                    <div className="post-location">
                      <MapPin size={16} />
                      {post.location}
                    </div>
                    {post.postType === 'missing' && post.lastSeen && (
                      <div className="post-detail-small">
                        <Clock size={14} />
                        Last seen: {new Date(post.lastSeen).toLocaleDateString()}
                      </div>
                    )}
                    <div className="post-actions">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleDeletePost(post.id, post.postType)}
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
          )}
        </div>
      </div>

      {/* Edit Post Modal with Create Post Form Styling */}
      {showEditModal && editingPost && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  <Edit2 size={24} />
                  Edit {editingPost.postType === 'adoption' ? 'Adoption' : 'Missing'} Post
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
                  <Dog size={18} />
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
                  <label className="form-label">Species *</label>
                  <select
                    className="form-input"
                    value={editFormData.species}
                    onChange={(e) => handleEditFormChange('species', e.target.value)}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Breed</label>
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
                  <label className="form-label">Age</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.age}
                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Size</label>
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
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.color}
                      onChange={(e) => handleEditFormChange('color', e.target.value)}
                      placeholder="Color"
                    />
                  </div>
                </div>
              )}

              {editingPost.postType === 'missing' && (
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.color}
                    onChange={(e) => handleEditFormChange('color', e.target.value)}
                    placeholder="Color"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editFormData.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                >
                  {editingPost.postType === 'adoption' ? (
                    <>
                      <option value="available">Available</option>
                      <option value="adopted">Adopted</option>
                      <option value="pending">Pending</option>
                    </>
                  ) : (
                    <>
                      <option value="missing">Missing</option>
                      <option value="found">Found</option>
                      <option value="closed">Closed</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editFormData.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Description"
                  rows="3"
                />
              </div>

              {editingPost.postType === 'adoption' ? (
                <>
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
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={18} />
                      Last Seen Location *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.location}
                      onChange={(e) => handleEditFormChange('location', e.target.value)}
                      placeholder="Last seen location"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Last Seen Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={editFormData.lastSeen}
                        onChange={(e) => handleEditFormChange('lastSeen', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reward</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.reward}
                        onChange={(e) => handleEditFormChange('reward', e.target.value)}
                        placeholder="Reward amount (optional)"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSaveEdit}
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;