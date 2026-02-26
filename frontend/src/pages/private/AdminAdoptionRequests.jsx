import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Mail, Phone, MapPin } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminAdoptionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [selectedPet, setSelectedPet] = useState(null); // For pet detail modal

    useEffect(() => {
        fetchRequests();

        // Phase 3: Implement real-time updates (polling every 30 seconds)
        const intervalId = setInterval(fetchRequests, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
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
                                        <td onClick={() => setSelectedPet(req)} style={{ cursor: 'pointer' }}>
                                            <div className="user-info">
                                                <div className="user-details">
                                                    <p className="user-name">{req.applicant_name}</p>
                                                    <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={12} /> {req.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td onClick={() => setSelectedPet(req)} style={{ cursor: 'pointer' }}>
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
                                        src={selectedPet.pet_image?.startsWith('http') ? selectedPet.pet_image : `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${selectedPet.pet_image}`}
                                        alt={selectedPet.pet_name}
                                        style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '250px' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 300px' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{selectedPet.pet_name}</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p><strong>Species:</strong> {selectedPet.species}</p>
                                        <p><strong>Breed:</strong> {selectedPet.breed}</p>
                                        <p><strong>Status:</strong> <span className={`status-badge status-${selectedPet.status?.toLowerCase()}`} style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem',
                                            backgroundColor: '#f0f4f2', color: '#6b9b7f'
                                        }}>{selectedPet.status || activeTab}</span></p>
                                        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' }} />
                                        <p><strong>Applicant:</strong> {selectedPet.applicant_name}</p>
                                        <p><strong>Email:</strong> {selectedPet.email}</p>
                                        <p><strong>Phone:</strong> {selectedPet.phone}</p>
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

export default AdminAdoptionRequests;
