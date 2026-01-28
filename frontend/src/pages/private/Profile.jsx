import { useState } from 'react';
import { 
  Plus, 
  Grid, 
  CheckCircle, 
  AlertTriangle, 
  Dog, 
  Cat,
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Phone
} from 'lucide-react';
import CreatePostModal from '../../components/Createpost';
import '../../css/Profile.css';

const Profile = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  // User data - In production, this would come from authentication context or API
  const userData = {
    name: 'maiyachuman',
    email: 'maiya.chuman@example.com',
    phone: '+977 9812345678',
    location: 'Kathmandu, Nepal',
    joinedDate: 'January 2024',
    avatar: 'https://ui-avatars.com/api/?name=Maiya+Chuman&background=6d9282&color=fff&size=128'
  };

  // Stats data
  const stats = [
    {
      icon: <Grid size={24} />,
      number: '500+',
      label: 'Total Posts',
      color: '#6d9282'
    },
    {
      icon: <CheckCircle size={24} />,
      number: '300+',
      label: 'Adopted',
      color: '#6d9282'
    },
    {
      icon: <AlertTriangle size={24} />,
      number: '50+',
      label: 'Missing',
      color: '#f59e0b'
    },
    {
      icon: <Dog size={24} />,
      number: '400+',
      label: 'Dogs',
      color: '#f97316'
    },
    {
      icon: <Cat size={24} />,
      number: '150+',
      label: 'Cats',
      color: '#8b5cf6'
    }
  ];

  const handleCreatePost = (postData) => {
    console.log('Post created:', postData);
    // Add the new post to userPosts
    const newPost = {
      id: Date.now(),
      ...postData,
      createdAt: new Date().toISOString()
    };
    setUserPosts([newPost, ...userPosts]);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Welcome, {userData.name}!</h1>
            <p className="dashboard-subtitle">Manage your pet posts and track their status.</p>
          </div>
          <button 
            className="btn btn-primary btn-create-post"
            onClick={() => setShowCreatePostModal(true)}
          >
            <Plus size={20} />
            Create New Post
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-dashboard">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card-dashboard">
              <div className="stat-icon-wrapper" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-number-dashboard">{stat.number}</div>
                <div className="stat-label-dashboard">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Information Section */}
        <div className="profile-section">
          <div className="section-header-dashboard">
            <h2 className="section-title-dashboard">Profile Information</h2>
            <button className="btn-icon-edit">
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
          
          <div className="profile-card">
            <div className="profile-avatar-section">
              <img src={userData.avatar} alt={userData.name} className="profile-avatar" />
              <div className="profile-basic-info">
                <h3 className="profile-name">{userData.name}</h3>
                <p className="profile-role">Pet Enthusiast</p>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <Mail size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">{userData.email}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <Phone size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">{userData.phone}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <MapPin size={20} />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Location</span>
                  <span className="profile-detail-value">{userData.location}</span>
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
          
          {userPosts.length === 0 ? (
            <div className="no-posts-container">
              <div className="no-posts-icon">
                <Dog size={48} />
              </div>
              <h3 className="no-posts-title">No posts yet</h3>
              <p className="no-posts-subtitle">Start by creating your first pet post.</p>
              <button 
                className="btn btn-primary btn-create-post-center"
                onClick={() => setShowCreatePostModal(true)}
              >
                <Plus size={20} />
                Create New Post
              </button>
            </div>
          ) : (
            <div className="user-posts-grid">
              {userPosts.map((post) => (
                <div key={post.id} className="user-post-card">
                  <div className="post-image-wrapper">
                    <img src={post.image} alt={post.petName} className="post-image" />
                    <div className={`post-type-badge ${post.postType}`}>
                      {post.postType === 'adoption' ? 'For Adoption' : 'Missing'}
                    </div>
                  </div>
                  <div className="post-content">
                    <h3 className="post-pet-name">{post.petName}</h3>
                    <p className="post-breed">{post.breed} • {post.petType}</p>
                    <p className="post-location">
                      <MapPin size={14} />
                      {post.location}
                    </p>
                    <div className="post-actions">
                      <button className="btn btn-sm btn-secondary">Edit</button>
                      <button className="btn btn-sm btn-outline">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Profile;