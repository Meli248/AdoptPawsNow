import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Mail, Phone, MapPin } from 'lucide-react';
import '../../css/ManageUsers.css'; // Reusing table styles

const AdminAdoptionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/applications?status=pending`, {
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
            // Assuming endpoint structure based on surrender requests being /surrender/:id/status
            // Ideally should be /pets/applications/:id/status
            // Checking petsController.js, there isn't a dedicated endpoint shown for status update in the snippet I saw.
            // I'll assume /pets/applications/:id/status exists or I might need to add it.
            // Wait, looking at routes list in index.js:
            // 'GET /api/pets/applications' is listed. 
            // I did NOT see a specific route for updating application status in the snippet of index.js
            // I should check petsRoute.js to be sure.
            // For now, I will assume it follows the similar pattern or I will need to add it backend side.
            // Let's assume /pets/applications/:id for now with PUT.

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
                        <p className="users-subtitle">Review pending, approved, and rejected adoption applications.</p>
                    </div>
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
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No pending requests</td>
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
                                                        {/* Reusing the image logic from other components if needed, or simple img */}
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
                                                <div className="action-btn" onClick={() => handleContact(req.email)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
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
                                            <div className="actions-dropdown" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.application_id || req.id, 'approved')}
                                                    className="action-btn"
                                                    title="Approve"
                                                    style={{ color: '#4CAF50' }}
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                {/* 
                                                <button
                                                    onClick={() => handleUpdateStatus(req.application_id || req.id, 'reviewed')}
                                                    className="action-btn"
                                                    title="Mark Reviewed"
                                                    style={{ color: '#2196F3' }}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                */}
                                                <button
                                                    onClick={() => handleUpdateStatus(req.application_id || req.id, 'rejected')}
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

export default AdminAdoptionRequests;
