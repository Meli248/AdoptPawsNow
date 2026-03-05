import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail, MapPin, Calendar, Edit2, Phone, Save, X, Dog, Heart,
  AlertTriangle, Clock, User, Hash, FileText, Palette, Activity, Layout
} from 'lucide-react';
import '../../css/Profile.css';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().refine(val => !val || /^\d{10}$/.test(val), {
    message: 'Phone number must be exactly 10 digits.'
  }),
  location: z.string().optional()
});

const editPostSchema = z.object({
  petName: z.string().min(1, 'Pet name is required'),
  petType: z.enum(['dog', 'cat', 'bird', 'other']).optional(),
  species: z.enum(['dog', 'cat', 'bird', 'other']).optional(),
  breed: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  reason: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  vaccinated: z.boolean().optional(),
  neutered: z.boolean().optional(),
  contact_name: z.string().min(1, 'Contact Name is required'),
  contact_email: z.string().email('Invalid email address').min(1, 'Contact Email is required'),
  contact_phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone cannot be more than 15 digits'),
  location: z.string().optional()
});

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

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: ''
    }
  });
  const {
    register: registerEditPost,
    handleSubmit: handleEditPostSubmit,
    formState: { errors: editPostErrors },
    reset: resetEditPostForm,
    setValue: setEditPostValue
  } = useForm({
    resolver: zodResolver(editPostSchema)
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    adopted: 0,
    postPosts: 0
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
          postPosts: 0
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
        resetProfileForm({
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location
        });

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
      resetProfileForm({
        name: fallbackData.name,
        phone: fallbackData.phone,
        location: fallbackData.location
      });
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
      const [petsResponse, postResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/pets/my-posts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/post/my-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (petsResponse.status === 401 || postResponse.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const petsData = petsResponse.ok ? await petsResponse.json() : { success: false, data: [] };
      const postData = postResponse.ok ? await postResponse.json() : { success: false, data: [] };

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

      if (postData?.success && postData.data) {
        const postPosts = postData.data.map(req => ({
          id: req.application_id,
          petName: req.pet_name,
          breed: req.breed || 'Mixed',
          petType: req.pet_type,
          location: req.location || 'Post Request',
          image: getImageUrl(req.image_url),
          postType: 'post',
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
        allPosts.push(...postPosts);
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
    if (!isEditing) {
      resetProfileForm({
        name: userData.name,
        phone: userData.phone,
        location: userData.location
      });
    }
    setIsEditing(!isEditing);
  };

  const onProfileSubmit = async (data) => {
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
          name: data.name,
          phone: data.phone,
          location: data.location
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedData = { ...userData, name: data.name, phone: data.phone, location: data.location };
        setUserData(updatedData);
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user', data.name);
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
    if (post.postType === 'post') {
      resetEditPostForm({
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
      resetEditPostForm({
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

  const onEditPostSubmit = async (data) => {
    try {
      const token = localStorage.getItem('access_token');
      let endpoint;
      let updateData;

      if (editingPost.postType === 'post') {
        endpoint = `${import.meta.env.VITE_API_URL}/post/${editingPost.id}`;
        updateData = {
          pet_name: data.petName,
          pet_type: data.petType,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          reason: data.reason,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          location: data.location
        };
      } else {
        endpoint = `${import.meta.env.VITE_API_URL}/pets/${editingPost.id}`;
        updateData = {
          name: data.petName,
          species: data.species,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          size: data.size,
          color: data.color,
          status: data.status,
          description: data.description,
          vaccinated: data.vaccinated,
          neutered: data.neutered,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone
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
        const responseData = await response.json();
        alert(responseData.message || 'Failed to update post');
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
      const endpoint = postType === 'post'
        ? `${import.meta.env.VITE_API_URL}/post/${postId}`
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

  const handleAccountDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Your account has been successfully deleted.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        window.dispatchEvent(new Event('storage'));
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An expected error occurred while deleting your account.');
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
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-icon-edit" onClick={handleEditToggle} style={{ width: 'auto' }}>
                  <Edit2 size={18} />
                  Edit Profile
                </button>
                <button
                  className="btn-icon-delete"
                  onClick={handleAccountDelete}
                  style={{ width: 'auto' }}
                >
                  <AlertTriangle size={18} />
                  Delete Account
                </button>
              </div>
            ) : null}
          </div>

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <div className="profile-basic-info-section">
                  <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={18} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...registerProfile('name')}
                      autoComplete="name"
                      className={`form-input ${profileErrors.name ? 'error' : ''}`}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: profileErrors.name ? '2px solid red' : '2px solid #e9ecef',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                    />
                    {profileErrors.name && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{profileErrors.name.message}</span>}
                  </div>
                </div>

                <div className="profile-details-grid">
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <Mail size={20} />
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Email</span>
                      <span className="profile-detail-value">
                        {userData.email || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <Phone size={20} />
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Phone</span>
                      <input
                        type="tel"
                        {...registerProfile('phone')}
                        autoComplete="tel"
                        className={`form-input ${profileErrors.phone ? 'error' : ''}`}
                        placeholder="Your 10-digit phone number"
                        maxLength={10}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: profileErrors.phone ? '2px solid red' : '2px solid #e9ecef',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          marginTop: '4px'
                        }}
                      />
                      {profileErrors.phone && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{profileErrors.phone.message}</span>}
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="profile-detail-content">
                      <span className="profile-detail-label">Location</span>
                      <input
                        type="text"
                        {...registerProfile('location')}
                        autoComplete="street-address"
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

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
                  <button type="submit" className="btn btn-primary btn-icon-save" style={{ width: '120px', minWidth: '120px', justifyContent: 'center', margin: 0 }}>
                    <Save size={18} />
                    Save
                  </button>
                  <button type="button" className="btn btn-secondary btn-icon-cancel" onClick={handleEditToggle} style={{ width: '120px', minWidth: '120px', justifyContent: 'center', margin: 0 }}>
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-basic-info-section">
                <div style={{ width: '100%' }}>
                  <h3 className="profile-name">{userData.name || 'User'}</h3>
                  <p className="profile-role">Pet Enthusiast</p>
                  
                  <div className="profile-details-grid" style={{ marginTop: '30px' }}>
                    <div className="profile-detail-item">
                      <div className="profile-detail-icon">
                        <Mail size={20} />
                      </div>
                      <div className="profile-detail-content">
                        <span className="profile-detail-label">Email</span>
                        <span className="profile-detail-value">
                          {userData.email || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className="profile-detail-item">
                      <div className="profile-detail-icon">
                        <Phone size={20} />
                      </div>
                      <div className="profile-detail-content">
                        <span className="profile-detail-label">Phone</span>
                        <span className="profile-detail-value">
                          {userData.phone || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className="profile-detail-item">
                      <div className="profile-detail-icon">
                        <MapPin size={20} />
                      </div>
                      <div className="profile-detail-content">
                        <span className="profile-detail-label">Location</span>
                        <span className="profile-detail-value">
                          {userData.location || 'Not provided'}
                        </span>
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
            )}
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
                            : post.description || (post.postType === 'adoption' ? 'A wonderful pet looking for a loving home.' : 'Post Request')}
                        </p>

                        <div className="pet-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'stretch' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                            style={{ flex: 1, width: '50%', margin: 0, padding: 0, boxSizing: 'border-box', minHeight: '44px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', lineHeight: 'normal' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id, post.postType); }}
                            style={{ flex: 1, width: '50%', margin: 0, padding: 0, boxSizing: 'border-box', minHeight: '44px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', lineHeight: 'normal', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                          >
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
                {favorites.filter(pet => pet.status === 'available' || !pet.status).length === 0 ? (
                  <div className="no-posts-container" style={{ gridColumn: '1/-1' }}>
                    <Heart size={40} style={{ margin: '0 auto', display: 'block', color: '#ccc' }} />
                    <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>No available favorites yet.</p>
                  </div>
                ) : (
                  favorites.filter(pet => pet.status === 'available' || !pet.status).map((pet) => (
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
                  Edit {editingPost.postType === 'adoption' ? 'Adoption' : 'Post'} Post
                </h2>
                <p className="modal-subtitle">Update the details of your post</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="create-post-form" onSubmit={handleEditPostSubmit(onEditPostSubmit)}>
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Pet Name *
                </label>
                <input
                  type="text"
                  className={`form-input ${editPostErrors.petName ? 'error' : ''}`}
                  {...registerEditPost('petName')}
                  placeholder="Pet name"
                />
                {editPostErrors.petName && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.petName.message}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Dog size={18} />
                    Species *
                  </label>
                  <select
                    className="form-input"
                    {...registerEditPost(editingPost.postType === 'post' ? 'petType' : 'species')}
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
                    {...registerEditPost('breed')}
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
                    {...registerEditPost('age')}
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
                    {...registerEditPost('gender')}
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
                        {...registerEditPost('size')}
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
                        {...registerEditPost('color')}
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
                      {...registerEditPost('status')}
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
                      {...registerEditPost('description')}
                      placeholder="Description"
                      rows="3"
                    />
                  </div>

                  <div className="form-row checkbox-row">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          {...registerEditPost('vaccinated')}
                        />
                        <span>Vaccinated</span>
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          {...registerEditPost('neutered')}
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
                      className={`form-input ${editPostErrors.contact_name ? 'error' : ''}`}
                      {...registerEditPost('contact_name')}
                      placeholder="Contact name"
                    />
                    {editPostErrors.contact_name && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.contact_name.message}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <Mail size={18} />
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        className={`form-input ${editPostErrors.contact_email ? 'error' : ''}`}
                        {...registerEditPost('contact_email')}
                        placeholder="Contact email"
                      />
                      {editPostErrors.contact_email && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.contact_email.message}</span>}
                    </div>
                  </div>
                </>
              )}

              {editingPost.postType === 'post' && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={18} />
                      Location
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      {...registerEditPost('location')}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <FileText size={18} />
                      Reason for Post
                    </label>
                    <textarea
                      className="form-textarea"
                      {...registerEditPost('reason')}
                      rows="3"
                      placeholder="Reason..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <User size={18} />
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      className={`form-input ${editPostErrors.contact_name ? 'error' : ''}`}
                      autoComplete="name"
                      {...registerEditPost('contact_name')}
                      placeholder="Contact name"
                    />
                    {editPostErrors.contact_name && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.contact_name.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={18} />
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      className={`form-input ${editPostErrors.contact_email ? 'error' : ''}`}
                      autoComplete="email"
                      {...registerEditPost('contact_email')}
                      placeholder="Contact email"
                    />
                    {editPostErrors.contact_email && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.contact_email.message}</span>}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  className={`form-input ${editPostErrors.contact_phone ? 'error' : ''}`}
                  autoComplete="tel"
                  {...registerEditPost('contact_phone')}
                  placeholder="Contact phone"
                />
                {editPostErrors.contact_phone && <span className="error-msg" style={{ color: 'red', fontSize: '13px' }}>{editPostErrors.contact_phone.message}</span>}
              </div>

              <div className="form-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
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
            </form>
          </div>
        </div>
      )}
    </div >
  );
};

export default Profile;