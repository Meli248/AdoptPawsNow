import { useState, useEffect } from 'react';
import { 
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Phone,
  Save,
  X,
  Dog,
  Heart,
  AlertTriangle,
  Clock
} from 'lucide-react';
import '../../css/Profile.css';

const Profile = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinedDate: ''
  });
  const [editedData, setEditedData] = useState({ ...userData });
  const [stats, setStats] = useState({
    totalPosts: 0,
    adoptionPosts: 0,
    missingPosts: 0
  });

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No access token found');
          loadFallbackUserData();
          setProfileLoading(false);
          return;
        }

        console.log('Fetching profile with token:', token.substring(0, 20) + '...');

        // FIXED: Changed from /api/auth/profile to /auth/profile since VITE_API_URL already has /api
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Profile response status:', response.status);

        if (!response.ok) {
          console.error('Profile fetch failed:', response.status, response.statusText);
          loadFallbackUserData();
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        
        if (data.success && data.user) {
          const user = data.user;
          const profileData = {
            name: user.name || user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            joinedDate: user.created_at 
              ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
              : 'Recently'
          };
          setUserData(profileData);
          setEditedData(profileData);
          
          // Save to localStorage for future fallback
          localStorage.setItem('user_name', profileData.name);
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
      // Try to get basic info from localStorage
      const userEmail = localStorage.getItem('user_email');
      const userName = localStorage.getItem('user_name');
      
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

    fetchUserProfile();
  }, []);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No access token for posts');
          setLoading(false);
          return;
        }

        console.log('Fetching user posts...');

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // FIXED: Changed from /api/pets/my-posts to /pets/my-posts
        const adoptionPromise = fetch(`${import.meta.env.VITE_API_URL}/pets/my-posts`, {
          method: 'GET',
          headers
        }).then(res => res.ok ? res.json() : null);
        
        // FIXED: Changed from /api/missing/my-posts to /missing/my-posts
        const missingPromise = fetch(`${import.meta.env.VITE_API_URL}/missing/my-posts`, {
          method: 'GET',
          headers
        }).then(res => res.ok ? res.json() : null);

        const [adoptionData, missingData] = await Promise.all([adoptionPromise, missingPromise]);
        
        console.log('Adoption data:', adoptionData);
        console.log('Missing data:', missingData);

        const allPosts = [];
        let adoptionCount = 0;
        let missingCount = 0;

        // Add adoption posts
        if (adoptionData && adoptionData.success && adoptionData.data) {
          const adoptionPosts = adoptionData.data.map(pet => ({
            id: pet.pet_id,
            petName: pet.name,
            breed: pet.breed || 'Mixed',
            petType: pet.species || 'Pet',
            location: pet.location || 'Location N/A',
            image: getImageUrl(pet.image_url),
            postType: 'adoption',
            status: pet.status,
            age: pet.age,
            createdAt: pet.created_at
          }));
          allPosts.push(...adoptionPosts);
          adoptionCount = adoptionPosts.length;
        }

        // Add missing posts
        if (missingData && missingData.success && missingData.data) {
          const missingPosts = missingData.data.map(pet => ({
            id: `missing-${pet.missing_id}`,
            petName: pet.pet_name,
            breed: pet.breed || 'Mixed',
            petType: pet.species || 'Pet',
            location: pet.last_seen_location || 'Location N/A',
            image: getImageUrl(pet.image_url),
            postType: 'missing',
            status: pet.status,
            lastSeen: pet.last_seen_date,
            createdAt: pet.reported_date || pet.created_at
          }));
          allPosts.push(...missingPosts);
          missingCount = missingPosts.length;
        }

        // Sort by creation date (most recent first)
        allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('Total posts fetched:', allPosts.length);
        
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

    fetchUserPosts();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
    if (imageUrl.startsWith('http')) return imageUrl;
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${import.meta.env.VITE_API_URL}${cleanUrl}`;
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedData({ ...userData });
    }
    setIsEditing(!isEditing);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to update your profile.');
        return;
      }

      console.log('Updating profile with data:', editedData);

      // FIXED: Changed from /api/auth/profile to /auth/profile
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedData.name,
          phone: editedData.phone,
          location: editedData.location
        })
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      
      if (data.success) {
        setUserData(editedData);
        setIsEditing(false);
        
        // Update localStorage
        localStorage.setItem('user_name', editedData.name);
        
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId, postType) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to delete posts.');
        return;
      }

      let endpoint = '';
      let actualId = postId;

      if (postType === 'adoption') {
        // FIXED: Changed from /api/pets/${postId} to /pets/${postId}
        endpoint = `/pets/pets/${postId}`;
      } else {
        // Remove 'missing-' prefix if present
        actualId = postId.toString().replace('missing-', '');
        // FIXED: Changed from /api/missing/${actualId} to /missing/missing-pets/${actualId}
        endpoint = `/missing/missing-pets/${actualId}`;
      }

      console.log('Deleting post:', { postId, actualId, postType, endpoint });

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from state
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      
      // Update stats
      setStats(prev => ({
        totalPosts: prev.totalPosts - 1,
        adoptionPosts: postType === 'adoption' ? prev.adoptionPosts - 1 : prev.adoptionPosts,
        missingPosts: postType === 'missing' ? prev.missingPosts - 1 : prev.missingPosts
      }));

      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post.');
    }
  };

  if (profileLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Welcome{userData.name ? `, ${userData.name}` : ''}!</h1>
            <p className="dashboard-subtitle">Manage your pet posts and track their status.</p>
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

        {/* Profile Information Section */}
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
                      placeholder="Your phone"
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

        {/* Your Pet Posts Section */}
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
                    {post.image && (
                      <img 
                        src={post.image} 
                        alt={post.petName} 
                        className="post-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=400&fit=crop';
                        }}
                      />
                    )}
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
                      <button className="btn btn-sm btn-secondary">Edit</button>
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
    </div>
  );
};

export default Profile;