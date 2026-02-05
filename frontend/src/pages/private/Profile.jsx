import { useState, useEffect } from 'react';
import { 
  Mail, MapPin, Calendar, Edit2, Phone, Save, X, Dog, Heart,
  AlertTriangle, Clock
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

      const data = await response.json();

      if (data.success) {
        setUserData(editedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        localStorage.setItem('user_name', editedData.name);
        localStorage.setItem('user', editedData.name);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // ✅ NEW: Handle Edit Post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditFormData({
      petName: post.petName,
      breed: post.breed,
      species: post.petType,
      age: post.age || '',
      gender: post.gender || '',
      size: post.size || '',
      color: post.color || '',
      description: post.description || '',
      location: post.location || '',
      status: post.status || '',
      // For adoption posts
      vaccinated: post.vaccinated || false,
      neutered: post.neutered || false,
      contact_name: post.contact_name || '',
      contact_email: post.contact_email || '',
      contact_phone: post.contact_phone || '',
      // For missing posts
      lastSeen: post.lastSeen ? new Date(post.lastSeen).toISOString().split('T')[0] : '',
      owner_name: post.owner_name || '',
      owner_email: post.owner_email || '',
      owner_phone: post.owner_phone || '',
      reward: post.reward || ''
    });
    setShowEditModal(true);
  };

  // ✅ NEW: Handle Edit Form Input Change
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ NEW: Handle Save Edit
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please log in to update your post');
        return;
      }

      const endpoint = editingPost.postType === 'adoption'
        ? `${import.meta.env.VITE_API_URL}/pets/pets/${editingPost.id}`
        : `${import.meta.env.VITE_API_URL}/missing/missing-pets/${editingPost.id}`;

      let body;
      if (editingPost.postType === 'adoption') {
        body = {
          name: editFormData.petName,
          breed: editFormData.breed,
          species: editFormData.species,
          age: editFormData.age,
          gender: editFormData.gender,
          size: editFormData.size,
          color: editFormData.color,
          description: editFormData.description,
          status: editFormData.status,
          vaccinated: editFormData.vaccinated,
          neutered: editFormData.neutered,
          contact_name: editFormData.contact_name,
          contact_email: editFormData.contact_email,
          contact_phone: editFormData.contact_phone
        };
      } else {
        body = {
          pet_name: editFormData.petName,
          breed: editFormData.breed,
          species: editFormData.species,
          age: editFormData.age,
          gender: editFormData.gender,
          color: editFormData.color,
          description: editFormData.description,
          last_seen_location: editFormData.location,
          last_seen_date: editFormData.lastSeen,
          status: editFormData.status,
          reward: editFormData.reward
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
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
    <div className="profile-container">
      <div className="container">
        {/* Simple Welcome Message */}
        <div className="welcome-banner">
          <h1 className="welcome-text">Welcome, {userData.name || 'Friend'}! 👋</h1>
          <p className="welcome-subtitle">Manage your pet posts and profile</p>
        </div>

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
                <div style={{ width: '100%', marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-dark)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="profile-edit-input"
                    placeholder="Your name"
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
                      className="profile-edit-input-small"
                      placeholder="Your phone number"
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
                      className="profile-edit-input-small"
                      placeholder="Your location"
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

        <div className="posts-section">
          <h2 className="section-title-dashboard">Your Pet Posts</h2>
          
          {loading ? (
            <div className="no-posts-container">
              <p>Loading your posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="no-posts-container">
              <div className="no-posts-icon">
                <Dog size={48} />
              </div>
              <h3 className="no-posts-title">No posts yet</h3>
              <p className="no-posts-subtitle">Your adoption and missing pet posts will appear here.</p>
            </div>
          ) : (
            <div className="user-posts-grid">
              {userPosts.map((post) => (
                <div key={post.id} className="user-post-card">
                  <div className="post-image-wrapper">
                    <img 
                      src={post.image} 
                      alt={post.petName} 
                      className="post-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
                      }}
                    />
                    <div className={`post-type-badge ${post.postType}`}>
                      {post.postType === 'adoption' ? (
                        <><Heart size={14} /> For Adoption</>
                      ) : (
                        <><AlertTriangle size={14} /> Missing</>
                      )}
                    </div>
                    {post.status && (
                      <div className="post-status-badge">
                        {post.status}
                      </div>
                    )}
                  </div>
                  <div className="post-content">
                    <h3 className="post-pet-name">{post.petName}</h3>
                    <p className="post-breed">{post.breed} • {post.petType}</p>
                    <div style={{ marginBottom: '12px' }}>
                      <p className="post-location">
                        <MapPin size={14} />
                        {post.location}
                      </p>
                      {post.postType === 'adoption' && post.age && (
                        <p className="post-detail-small">
                          <Clock size={14} />
                          {post.age}
                        </p>
                      )}
                      {post.postType === 'missing' && post.lastSeen && (
                        <p className="post-detail-small">
                          <Clock size={14} />
                          Last seen: {new Date(post.lastSeen).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="post-actions">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleDeletePost(post.id, post.postType)}
                      >
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

      {/* ✅ NEW: Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit {editingPost.postType === 'adoption' ? 'Adoption' : 'Missing Pet'} Post</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Pet Name *</label>
                  <input
                    type="text"
                    value={editFormData.petName}
                    onChange={(e) => handleEditFormChange('petName', e.target.value)}
                    placeholder="Pet name"
                  />
                </div>

                <div className="form-group">
                  <label>Species *</label>
                  <select
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
                  <label>Breed</label>
                  <input
                    type="text"
                    value={editFormData.breed}
                    onChange={(e) => handleEditFormChange('breed', e.target.value)}
                    placeholder="Breed"
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    value={editFormData.age}
                    onChange={(e) => handleEditFormChange('age', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => handleEditFormChange('gender', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                {editingPost.postType === 'adoption' && (
                  <div className="form-group">
                    <label>Size</label>
                    <select
                      value={editFormData.size}
                      onChange={(e) => handleEditFormChange('size', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => handleEditFormChange('color', e.target.value)}
                    placeholder="Color"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
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

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleEditFormChange('description', e.target.value)}
                    placeholder="Description"
                    rows="3"
                  />
                </div>

                {editingPost.postType === 'adoption' ? (
                  <>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editFormData.vaccinated}
                          onChange={(e) => handleEditFormChange('vaccinated', e.target.checked)}
                        />
                        Vaccinated
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editFormData.neutered}
                          onChange={(e) => handleEditFormChange('neutered', e.target.checked)}
                        />
                        Neutered/Spayed
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Contact Name *</label>
                      <input
                        type="text"
                        value={editFormData.contact_name}
                        onChange={(e) => handleEditFormChange('contact_name', e.target.value)}
                        placeholder="Contact name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Email *</label>
                      <input
                        type="email"
                        value={editFormData.contact_email}
                        onChange={(e) => handleEditFormChange('contact_email', e.target.value)}
                        placeholder="Contact email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        value={editFormData.contact_phone}
                        onChange={(e) => handleEditFormChange('contact_phone', e.target.value)}
                        placeholder="Contact phone"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Last Seen Location *</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => handleEditFormChange('location', e.target.value)}
                        placeholder="Last seen location"
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Seen Date *</label>
                      <input
                        type="date"
                        value={editFormData.lastSeen}
                        onChange={(e) => handleEditFormChange('lastSeen', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reward</label>
                      <input
                        type="text"
                        value={editFormData.reward}
                        onChange={(e) => handleEditFormChange('reward', e.target.value)}
                        placeholder="Reward amount (optional)"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveEdit}
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;