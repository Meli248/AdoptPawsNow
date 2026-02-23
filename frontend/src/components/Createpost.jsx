import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    X, Upload, Image as ImageIcon, Dog, Cat,
    Home, AlertCircle, MapPin, Calendar,
    FileText, User, Mail, Phone
} from 'lucide-react';
import { adoptionAPI } from '../services/api';
import '../css/Createpost.css';

const CreatePost = ({ isOpen = true, onClose, onSuccess, isModal = true, initialData = null }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [postType, setPostType] = useState('adoption');
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        species: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        size: 'Medium',
        description: '',
        color: '',
        vaccinated: true,
        neutered: false,
        // Contact information for adoption pets
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactType: 'individual', // 'individual', 'shelter', 'community'
        // Missing pet fields
        lastSeenLocation: '',
        lastSeenDate: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        reward: ''
    });

    useEffect(() => {
        const dataToLoad = initialData || location.state?.prefill;

        if (dataToLoad) {
            // Map incoming data to form fields
            setFormData(prev => ({
                ...prev,
                ...dataToLoad,
                // Ensure species is mapped correctly if it comes as 'pet_type' or similar
                species: dataToLoad.species || (dataToLoad.pet_type === 'dog' ? 'Dog' : dataToLoad.pet_type === 'cat' ? 'Cat' : 'Dog'),
                description: dataToLoad.description || dataToLoad.reason || ''
            }));

            if (dataToLoad.image_url) {
                setImagePreview(dataToLoad.image_url.startsWith('http') ? dataToLoad.image_url : `${import.meta.env.VITE_API_URL}${dataToLoad.image_url}`);
            }
        }
    }, [initialData, location.state]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile && !imagePreview) { // Allow update if preview exists
            alert('Please upload an image of the pet');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Pet details
            formDataToSend.append('name', formData.name);
            formDataToSend.append('species', formData.species);
            formDataToSend.append('breed', formData.breed || 'Mixed');
            formDataToSend.append('age', formData.age);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('size', formData.size);
            formDataToSend.append('color', formData.color);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('vaccinated', formData.vaccinated);
            formDataToSend.append('neutered', formData.neutered);
            formDataToSend.append('status', 'Available');

            // Contact information
            formDataToSend.append('contact_name', formData.contactName);
            formDataToSend.append('contact_email', formData.contactEmail);
            formDataToSend.append('contact_phone', formData.contactPhone);
            formDataToSend.append('contact_type', formData.contactType);

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (initialData && initialData.id) {
                response = await adoptionAPI.updatePet(initialData.id, formDataToSend);
            } else {
                response = await adoptionAPI.createPet(formDataToSend);
            }
            console.log('Adoption response:', response);

            alert(response.message || (initialData && initialData.id ? 'Pet updated successfully!' : 'Pet posted for adoption successfully!'));

            // Reset form
            setFormData({
                name: '',
                species: 'Dog',
                breed: '',
                age: '',
                gender: 'Male',
                size: 'Medium',
                description: '',
                color: '',
                vaccinated: true,
                neutered: false,
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                contactType: 'individual',
                lastSeenLocation: '',
                lastSeenDate: '',
                ownerName: '',
                ownerEmail: '',
                ownerPhone: '',
                reward: ''
            });
            setImageFile(null);
            setImagePreview(null);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting post:', error);
            console.error('Error details:', error.response?.data);
            alert(error.response?.data?.message || error.message || 'Failed to submit post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    if (isModal && !isOpen) return null;

    const content = (
        <div className={isModal ? "modal-content" : "create-post-container"}>
            <div className="modal-header">
                <div>
                    <h2 className="modal-title">
                        <Home className="title-icon" size={28} />
                        {initialData ? 'Edit Pet' : 'Post Pet for Adoption'}
                    </h2>
                    <p className="modal-subtitle">
                        Help find a loving home for a pet in need
                    </p>
                </div>
                {isModal && (
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="form-group">
                    <label className="form-label">
                        <Dog size={18} />
                        Pet Type
                    </label>
                    <div className="button-group">
                        <button
                            type="button"
                            className={`toggle-btn ${formData.species === 'Dog' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, species: 'Dog' }))}
                            disabled={loading}
                        >
                            <Dog size={18} />
                            Dog
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${formData.species === 'Cat' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, species: 'Cat' }))}
                            disabled={loading}
                        >
                            <Cat size={18} />
                            Cat
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <ImageIcon size={18} />
                        Pet Photo *
                    </label>

                    {!imagePreview ? (
                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="pet-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="image-upload-input"
                                disabled={loading}
                            />
                            <label htmlFor="pet-image" className="image-upload-label">
                                <Upload size={48} />
                                <span className="upload-text">Click to upload photo</span>
                                <span className="upload-hint">PNG, JPG up to 5MB</span>
                            </label>
                        </div>
                    ) : (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="remove-image-btn"
                                disabled={loading}
                            >
                                <X size={16} />
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Pet Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Max, Bella, Lucky"
                        className="form-input"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Breed</label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleInputChange}
                            placeholder="e.g., Golden Retriever"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                            type="text"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="e.g., 2 years, 6 months"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={loading}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                    </div>

                    {postType === 'adoption' && (
                        <div className="form-group">
                            <label className="form-label">Size</label>
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={loading}
                            >
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            placeholder="e.g., Brown, Black & White"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the pet's personality, habits, and any special needs..."
                        className="form-textarea"
                        rows="4"
                        required
                        disabled={loading}
                    />
                </div>

                {postType === 'adoption' && (
                    <>
                        <div className="form-row checkbox-row">
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="vaccinated"
                                        checked={formData.vaccinated}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    <span>Vaccinated</span>
                                </label>
                            </div>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="neutered"
                                        checked={formData.neutered}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    <span>Spayed/Neutered</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <User size={18} />
                                Contact Type
                            </label>
                            <select
                                name="contactType"
                                value={formData.contactType}
                                onChange={handleInputChange}
                                className="form-input"
                                disabled={loading}
                            >
                                <option value="individual">Individual Owner</option>
                                <option value="shelter">Shelter/Rescue Organization</option>
                                <option value="community">Community Member/Found Pet</option>
                            </select>
                            <p className="form-hint">
                                {formData.contactType === 'shelter' && 'Rescue organizations and shelters'}
                                {formData.contactType === 'individual' && 'Pet owners giving up their pets'}
                                {formData.contactType === 'community' && 'Found stray pets or community animals'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <User size={18} />
                                Contact Name *
                            </label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                placeholder={formData.contactType === 'shelter' ? 'e.g., Happy Paws Shelter' : 'e.g., John Doe'}
                                className="form-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <Mail size={18} />
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    placeholder="contact@example.com"
                                    className="form-input"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Phone size={18} />
                                    Contact Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    placeholder="555-1234"
                                    className="form-input"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (initialData && initialData.id ? 'Update Pet' : 'Post for Adoption')}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    if (isModal) {
        return (
            <div className="modal-overlay">
                {content}
            </div>
        );
    }

    return content;
};

export default CreatePost;
