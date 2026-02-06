import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminSurrenderRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/surrender?status=pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;

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
                    species: request.pet_type, // map pet_type to species
                    breed: request.breed,
                    age: request.age,
                    gender: request.gender,
                    description: request.reason, // Use reason as initial description
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
                        <p className="users-subtitle">Review pending pet surrender applications.</p>
                    </div>
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
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No pending requests</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.application_id}>
                                        <td>
                                            <div className="user-info">
                                                {req.image_url && (
                                                    <div className="user-avatar">
                                                        <img src={req.image_url.startsWith('http') ? req.image_url : `${import.meta.env.VITE_API_URL}${req.image_url}`} alt="Pet" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
                                            <div className="actions-dropdown" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleCreatePost(req)}
                                                    className="action-btn"
                                                    title="Create Post"
                                                    style={{ color: '#4CAF50' }}
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.application_id, 'reviewed')}
                                                    className="action-btn"
                                                    title="Mark Reviewed (Archive)"
                                                    style={{ color: '#2196F3' }}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.application_id, 'rejected')}
                                                    className="action-btn"
                                                    title="Reject"
                                                    style={{ color: '#f44336' }}
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
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
