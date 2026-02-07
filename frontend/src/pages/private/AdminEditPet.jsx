import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreatePost from '../../components/Createpost';

const AdminEditPet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [petData, setPetData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPetDetails();
    }, [id]);

    const fetchPetDetails = async () => {
        try {
            // Assuming public endpoint is enough, otherwise use /admin/pets/:id if available
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/${id}`);
            const data = await response.json();

            if (data.success) {
                setPetData(data.data);
            } else {
                alert('Failed to load pet details');
                navigate('/admin/dashboard');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pet details:', error);
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/admin/dashboard');
    };

    const handleSuccess = () => {
        alert('Pet updated successfully!');
        navigate('/admin/dashboard');
    };

    if (loading) return <div className="p-4 text-center">Loading pet details...</div>;

    return (
        <div className="admin-page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Edit Pet</h1>
            <CreatePost
                isOpen={true}
                isModal={false}
                onClose={handleClose}
                onSuccess={handleSuccess}
                initialData={petData}
            />
        </div>
    );
};

export default AdminEditPet;
