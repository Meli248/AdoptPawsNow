import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminSurrenderRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            // Fetch requests based on active tab status
            // Backend might allow filtering by status. If not, we might need to fetch all and filter client side.
            // Assuming backend supports ?status=... which I saw in earlier files it did for applications at least.
            // Let's try fetching by status. 
            // NOTE: Early code had /surrender?status=pending. 
            // We'll update to use the activeTab state, mapping 'approved' to 'reviewed' maybe if that was the old term, but user wants 'approved'.
            // I'll stick to 'pending', 'approved', 'rejected' as status values.

            const response = await fetch(`${import.meta.env.VITE_API_URL}/surrender?status=${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            } else {
                setRequests([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status === 'approved' ? 'approve' : 'reject'} this request?`)) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/surrender/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchRequests(); // Refresh list
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleCreatePost = (request) => {
        // Navigate to create post page with state
        navigate('/admin/create-post', {
            state: {
                prefill: {
                    name: request.pet_name,
                    species: request.pet_type,
                    breed: request.breed,
                    age: request.age,
                    gender: request.gender,
                    description: request.reason,
                    contact_phone: request.contact_phone
                }
            }
        });
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="manage-users">
            <div className="users-container">
                <div className="users-header">
                    <div>
                        <h1 className="users-title">Surrender Requests</h1>
                        <p className="users-subtitle">Review and manage pet surrender applications.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="filter-tabs fade-in" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button
                        className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: activeTab === 'pending' ? 'none' : '1px solid #ddd', backgroundColor: activeTab === 'pending' ? '#6b9b7f' : 'white', color: activeTab === 'pending' ? 'white' : '#666', cursor: 'pointer' }}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: activeTab === 'approved' ? 'none' : '1px solid #ddd', backgroundColor: activeTab === 'approved' ? '#6b9b7f' : 'white', color: activeTab === 'approved' ? 'white' : '#666', cursor: 'pointer' }}
                    >
                        Approved
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: activeTab === 'rejected' ? 'none' : '1px solid #ddd', backgroundColor: activeTab === 'rejected' ? '#6b9b7f' : 'white', color: activeTab === 'rejected' ? 'white' : '#666', cursor: 'pointer' }}
                    >
                        Rejected
                    </button>
                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Pet</th>
                                <th>Type</th>
                                <th>Owner Contact</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No {activeTab} requests</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.application_id}>
                                        <td>
                                            <div className="user-info">
                                                {req.image_url && (
                                                    <div className="user-avatar">
                                                        <img src={req.image_url.startsWith('http') ? req.image_url : `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${req.image_url}`} alt="Pet" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                    </div>
                                                )}
                                                <div className="user-details">
                                                    <p className="user-name">{req.pet_name}</p>
                                                    <p className="user-email">{req.breed} • {req.age}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{req.pet_type}</td>
                                        <td>
                                            <div>{req.contact_phone}</div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>{req.user_name}</div>
                                        </td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {activeTab === 'pending' ? (
                                                <div className="actions-dropdown" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleCreatePost(req)}
                                                        className="action-btn"
                                                        title="Approve & Create Post"
                                                        style={{ color: '#4CAF50', border: '1px solid #e0e0e0', padding: '6px', borderRadius: '50%' }}
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.application_id, 'rejected')}
                                                        className="action-btn"
                                                        title="Reject"
                                                        style={{ color: '#f44336', border: '1px solid #e0e0e0', padding: '6px', borderRadius: '50%' }}
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`status-badge ${activeTab === 'approved' ? 'status-active' : 'status-inactive'}`} style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem',
                                                    backgroundColor: activeTab === 'approved' ? '#e6f4ea' : '#fce8e6',
                                                    color: activeTab === 'approved' ? '#1e7e34' : '#c53030'
                                                }}>
                                                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSurrenderRequests;
