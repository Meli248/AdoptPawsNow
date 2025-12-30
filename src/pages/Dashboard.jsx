import { Link } from 'react-router-dom';
import '../css/Dashboard.css';

const Dashboard = () => {
  const user = localStorage.getItem('user') || 'maiyachuman';

  const stats = [
    { icon: '📋', label: 'Total Posts', value: '500+', color: '#6b9080' },
    { icon: '✅', label: 'Adopted', value: '300+', color: '#28a745' },
    { icon: '⚠️', label: 'Missing', value: '50+', color: '#ffc107' },
    { icon: '🐕', label: 'Dogs', value: '400+', color: '#17a2b8' },
    { icon: '🐱', label: 'Cats', value: '150+', color: '#e83e8c' }
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                      {post.location}
                    </div>
                    <p className="post-description">{post.description}</p>
                    <div className="post-actions">
                      <button className="btn-action btn-edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                        </svg>
                        Edit
                      </button>
                      <button className="btn-action btn-delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
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
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7C11 8.1 10.1 9 9 9H7.2C6.9 8.4 6.3 8 5.5 8C4.7 8 4 8.7 4 9.5C4 10.3 4.7 11 5.5 11C6.3 11 6.9 10.6 7.2 10H9C10.9 10 12.5 8.7 12.9 7H14C16.2 7 18 8.8 18 11V12.3C17.4 12.6 17 13.3 17 14C17 15.1 17.9 16 19 16C20.1 16 21 15.1 21 14C21 13.3 20.6 12.6 20 12.3V11C20 7.7 17.3 5 14 5H12.9C12.5 3.3 10.9 2 12 2Z" fill="currentColor"/>
                  <circle cx="8" cy="16" r="2" fill="currentColor"/>
                  <circle cx="16" cy="16" r="2" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="empty-title">No posts yet</h3>
              <p className="empty-description">Start by creating your first pet post.</p>
              <Link to="/adopt" className="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
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