import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical } from 'lucide-react';
import '../../css/ManageUsers.css';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0
  });

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      navigate('/home');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allUsers = data.data || [];
        setUsers(allUsers);

        // Calculate stats
        const active = allUsers.filter(u => u.status === 'active').length;
        const blocked = allUsers.filter(u => u.status === 'blocked').length;
        const admins = allUsers.filter(u => u.role === 'admin').length;

        setStats({
          total: allUsers.length,
          active,
          blocked,
          admins
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('User blocked successfully');
        fetchUsers();
      } else {
        alert('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/unblock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('User unblocked successfully');
        fetchUsers();
      } else {
        alert('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="manage-users">
        <div className="users-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="users-container">
        <div className="users-header">
          <div>
            <h1 className="users-title">Manage Users</h1>
            <p className="users-subtitle">View and manage all registered users on the platform.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-card stat-card-active">
            <p className="stat-value">{stats.active}</p>
            <p className="stat-label">Active</p>
          </div>
          <div className="stat-card stat-card-blocked">
            <p className="stat-value">{stats.blocked}</p>
            <p className="stat-label">Blocked</p>
          </div>
          <div className="stat-card stat-card-admin">
            <p className="stat-value">{stats.admins}</p>
            <p className="stat-label">Admins</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Posts</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="user-details">
                        <p className="user-name">{user.username}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-blocked'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.posts_count || 0}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="actions-dropdown">
                      <button className="actions-btn">
                        <MoreVertical size={20} />
                      </button>
                      <div className="dropdown-menu">
                        {user.status === 'active' ? (
                          <button
                            className="dropdown-item"
                            onClick={() => handleBlockUser(user.user_id)}
                          >
                            Block User
                          </button>
                        ) : (
                          <button
                            className="dropdown-item"
                            onClick={() => handleUnblockUser(user.user_id)}
                          >
                            Unblock User
                          </button>
                        )}
                        <button className="dropdown-item">View Posts</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;