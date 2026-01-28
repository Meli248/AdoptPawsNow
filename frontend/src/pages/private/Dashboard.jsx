import { Link } from 'react-router-dom';
import { Plus, ClipboardList, CheckCircle, AlertTriangle, Dog, Cat, MapPin, Edit, Trash2, PawPrint } from 'lucide-react';
import '../../css/Dashboard.css';

const Dashboard = () => {
  const user = localStorage.getItem('user') || 'maiyachuman';

  const stats = [
    { icon: <ClipboardList size={28} />, label: 'Total Posts', value: '500+', color: '#6b9080' },
    { icon: <CheckCircle size={28} />, label: 'Adopted', value: '300+', color: '#28a745' },
    { icon: <AlertTriangle size={28} />, label: 'Missing', value: '50+', color: '#ffc107' },
    { icon: <Dog size={28} />, label: 'Dogs', value: '400+', color: '#17a2b8' },
    { icon: <Cat size={28} />, label: 'Cats', value: '150+', color: '#e83e8c' }
  ];

  const userPosts = [
    {
      id: 1,
      name: 'boduu',
      type: 'For Adoption',
      breed: 'dsxzgd',
      age: '3',
      location: 'patan',
      description: 'fs',
      status: 'For Adoption',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <div>
            <h1 className="dashboard-title">Welcome, {user}!</h1>
            <p className="dashboard-subtitle">Manage your pet posts and track their status.</p>
          </div>
          <Link to="/adopt" className="btn btn-primary">
            <Plus size={20} />
            Create New Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid fade-in">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                borderTop: `4px solid ${stat.color}`
              }}
            >
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* User Posts Section */}
        <div className="posts-section fade-in">
          <div className="section-header">
            <h2 className="section-title">Your Pet Posts</h2>
            {userPosts.length === 0 && (
              <Link to="/adopt" className="btn btn-secondary">
                <Plus size={20} />
                Create New Post
              </Link>
            )}
          </div>

          {userPosts.length > 0 ? (
            <div className="posts-grid">
              {userPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-image-wrapper">
                    <img src={post.image} alt={post.name} className="post-image" />
                    <div className="post-status-badge">
                      {post.status}
                    </div>
                  </div>
                  <div className="post-content">
                    <h3 className="post-name">{post.name}</h3>
                    <div className="post-meta">
                      <span className="post-breed">{post.breed} • {post.age}</span>
                    </div>
                    <div className="post-location">
                      <MapPin size={16} />
                      {post.location}
                    </div>
                    <p className="post-description">{post.description}</p>
                    <div className="post-actions">
                      <button className="btn-action btn-edit">
                        <Edit size={18} />
                        Edit
                      </button>
                      <button className="btn-action btn-delete">
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <PawPrint size={80} />
              </div>
              <h3 className="empty-title">No posts yet</h3>
              <p className="empty-description">Start by creating your first pet post.</p>
              <Link to="/adopt" className="btn btn-primary">
                <Plus size={20} />
                Create New Post
              </Link>
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div className="activity-section fade-in">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <CheckCircle size={20} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Successfully created post for <strong>boduu</strong></p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;