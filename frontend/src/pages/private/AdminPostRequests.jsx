import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminPostRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [selectedPet, setSelectedPet] = useState(null); // For pet detail modal

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
            // NOTE: Early code had /post?status=pending. 
            // We'll update to use the activeTab state, mapping 'approved' to 'reviewed' maybe if that was the old term, but user wants 'approved'.
            // I'll stick to 'pending', 'approved', 'rejected' as status values.

            const response = await fetch(`${import.meta.env.VITE_API_URL}/post?status=${activeTab}`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/post/${id}/status`, {
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

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="manage-users">
            <div className="users-container">
                <div className="users-header">
                    <div>
                        <h1 className="users-title">Rehome Requests</h1>
                        <p className="users-subtitle">Review and manage pet rehome applications.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="filter-tabs fade-in" style={{ justifyContent: 'flex-start', marginBottom: '2rem', display: 'flex', gap: '1.25rem' }}>
                    <button
                        className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            border: activeTab === 'pending' ? 'none' : '2px solid var(--border-color)',
                            backgroundColor: activeTab === 'pending' ? 'var(--primary-color)' : 'white',
                            color: activeTab === 'pending' ? 'white' : 'var(--text-light)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            border: activeTab === 'approved' ? 'none' : '2px solid var(--border-color)',
                            backgroundColor: activeTab === 'approved' ? 'var(--primary-color)' : 'white',
                            color: activeTab === 'approved' ? 'white' : 'var(--text-light)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Approved
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            border: activeTab === 'rejected' ? 'none' : '2px solid var(--border-color)',
                            backgroundColor: activeTab === 'rejected' ? 'var(--primary-color)' : 'white',
                            color: activeTab === 'rejected' ? 'white' : 'var(--text-light)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease'
                        }}
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
                                        <td onClick={() => setSelectedPet(req)} style={{ cursor: 'pointer' }}>
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
                                        <td onClick={() => setSelectedPet(req)} style={{ cursor: 'pointer' }}>{req.pet_type}</td>
                                        <td onClick={() => setSelectedPet(req)} style={{ cursor: 'pointer' }}>
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
                                                        onClick={() => handleUpdateStatus(req.application_id, 'approved')}
                                                        className="action-btn"
                                                        title="Approve"
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
                                                    backgroundColor: activeTab === 'approved' ? '#f0f4f2' : '#fff5f5',
                                                    color: activeTab === 'approved' ? '#6b9b7f' : '#e53e3e'
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

                {/* Pet Detail Modal */}
                {selectedPet && (
                    <div className="modal-overlay" onClick={() => setSelectedPet(null)} style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                        alignItems: 'center', zIndex: 1000, padding: '20px'
                    }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                            backgroundColor: 'white', padding: '2rem', borderRadius: '15px',
                            maxWidth: '600px', width: '100%', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}>
                            <button className="close-btn" onClick={() => setSelectedPet(null)} style={{
                                position: 'absolute', top: '15px', right: '15px', border: 'none',
                                background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666'
                            }}>×</button>

                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <img
                                        src={selectedPet.image_url?.startsWith('http') ? selectedPet.image_url : `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${selectedPet.image_url}`}
                                        alt={selectedPet.pet_name}
                                        style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '250px' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 300px' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{selectedPet.pet_name}</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p><strong>Species:</strong> {selectedPet.pet_type}</p>
                                        <p><strong>Breed:</strong> {selectedPet.breed}</p>
                                        <p><strong>Age:</strong> {selectedPet.age}</p>
                                        <p><strong>Gender:</strong> {selectedPet.gender}</p>
                                        <p><strong>Location:</strong> {selectedPet.location}</p>
                                        <p><strong>Status:</strong> <span className={`status-badge status-${selectedPet.status?.toLowerCase()}`} style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem',
                                            backgroundColor: '#f0f4f2', color: '#6b9b7f'
                                        }}>{selectedPet.status || activeTab}</span></p>
                                        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                                        <p><strong>Posted by:</strong> {selectedPet.user_name}</p>
                                        <p><strong>Reason:</strong> {selectedPet.reason}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPostRequests;
