import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostRequest from './PostRequest';

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

    if (loading) return <div className="p-4 text-center">Loading pet details...</div>;

    return (
        <div className="admin-page-container">
            <PostRequest
                initialData={petData}
                isEdit={true}
            />
        </div>
    );
};

export default AdminEditPet;
