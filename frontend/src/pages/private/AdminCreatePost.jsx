import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../../components/Createpost';

const AdminCreatePost = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/admin/dashboard');
    };

    const handleSuccess = () => {
        navigate('/admin/dashboard');
    };

    return (
        <div className="admin-page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <CreatePost
                isOpen={true}
                isModal={false}
                onClose={handleClose}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default AdminCreatePost;
