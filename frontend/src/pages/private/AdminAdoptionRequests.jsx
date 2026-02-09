import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Mail, Phone, MapPin } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminAdoptionRequests = () => {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/applications?status=${activeTab}`, {
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
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/applications/${id}/status`, {
                method: 'PATCH',
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

    // Helper to allow contacting applicant
    const handleContact = (email) => {
        window.location.href = `mailto:${email}`;
    }

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="manage-users">
            <div className="users-container">
                <div className="users-header">
                    <div>
                        <h1 className="users-title">Adoption Requests</h1>
                        <p className="users-subtitle">Review adoption applications.</p>
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
                                <th>Applicant</th>
                                <th>Pet</th>
                                <th>Contact</th>
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
                                    <tr key={req.application_id || req.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-details">
                                                    <p className="user-name">{req.applicant_name}</p>
                                                    <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={12} /> {req.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                {req.pet_image && (
                                                    <div className="user-avatar">
                                                        <img
                                                            src={req.pet_image.startsWith('http') ? req.pet_image : `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${req.pet_image}`}
                                                            alt="Pet"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="user-details">
                                                    <p className="user-name">{req.pet_name}</p>
                                                    <p className="user-email">{req.species} • {req.breed}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div className="action-btn" onClick={() => handleContact(req.email)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', border: 'none', background: 'none', padding: 0 }}>
                                                    <Mail size={14} /> {req.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                                    <Phone size={14} /> {req.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {activeTab === 'pending' ? (
                                                <div className="actions-dropdown" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.application_id || req.id, 'approved')}
                                                        className="action-btn"
                                                        title="Approve"
                                                        style={{ color: '#4CAF50', border: '1px solid #e0e0e0', padding: '6px', borderRadius: '50%' }}
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.application_id || req.id, 'rejected')}
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

export default AdminAdoptionRequests;
