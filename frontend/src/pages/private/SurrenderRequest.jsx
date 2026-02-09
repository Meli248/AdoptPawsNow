import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dog, Cat, Upload, AlertCircle, User, Phone, FileText, Calendar, Hash, MapPin } from 'lucide-react';
import '../../css/CreatePost.css'; // Reusing existing styles or create new

const surrenderSchema = z.object({
    pet_name: z.string().min(1, 'Pet name is required'),
    pet_type: z.enum(['dog', 'cat'], {
        errorMap: () => ({ message: 'Please select either Dog or Cat' }),
    }),
    breed: z.string().optional(),
    age: z.string().regex(/^[0-9]+$/, 'Age must be a number').optional(),
    gender: z.enum(['male', 'female', 'unknown']).optional(),
    reason: z.string().min(10, 'Please provide a detailed reason (min 10 chars)'),
    contact_phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    location: z.string().min(1, 'Location is required'),
    image: z.any()
        .refine((files) => files?.length > 0, "Image is required")
});

const SurrenderRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(surrenderSchema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();

            formData.append('pet_name', data.pet_name);
            formData.append('pet_type', data.pet_type);
            formData.append('reason', data.reason);
            formData.append('contact_phone', data.contact_phone);
            formData.append('location', data.location);
            formData.append('image', data.image[0]);

            if (data.breed) formData.append('breed', data.breed);
            if (data.age) formData.append('age', data.age);
            if (data.gender) formData.append('gender', data.gender);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/surrender`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('access_token');
                navigate('/login');
                return;
            }

            const result = await response.json();

            if (response.ok) {
                alert('Request submitted successfully! We will contact you shortly.');
                navigate('/profile');
            } else {
                alert(result.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting surrender request:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValue('image', e.target.files);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="create-post-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="page-title">Form</h1>
            <p className="page-subtitle">
                Help this pet find a loving forever home. Please provide details below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="create-post-form">
                <div className="form-section">
                    <h3>Pet Information</h3>

                    <div className="form-group">
                        <label className="form-label">
                            <User size={18} />
                            Pet Name*
                        </label>
                        <input
                            {...register('pet_name')}
                            placeholder="e.g. Max"
                            className={`form-input ${errors.pet_name ? 'error' : ''}`}
                        />
                        {errors.pet_name && <span className="error-msg">{errors.pet_name.message}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Dog size={18} />
                                Pet Type*
                            </label>
                            <select {...register('pet_type')} className="form-input">
                                <option value="">Select Type</option>
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                            </select>
                            {errors.pet_type && <span className="error-msg">{errors.pet_type.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Hash size={18} />
                                Breed
                            </label>
                            <input {...register('breed')} placeholder="e.g. Labrador" className="form-input" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={18} />
                            Location*
                        </label>
                        <input
                            {...register('location')}
                            placeholder="City, State"
                            className={`form-input ${errors.location ? 'error' : ''}`}
                        />
                        {errors.location && <span className="error-msg">{errors.location.message}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={18} />
                                Age
                            </label>
                            <input {...register('age')} placeholder="Enter age" type="number" className="form-input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <User size={18} />
                                Gender
                            </label>
                            <select {...register('gender')} className="form-input">
                                <option value="unknown">Unknown</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={18} />
                            Reason for rehoming*
                        </label>
                        <textarea
                            {...register('reason')}
                            rows="4"
                            placeholder="Please explain why you are surrendering this pet..."
                            className={`form-textarea ${errors.reason ? 'error' : ''}`}
                        />
                        {errors.reason && <span className="error-msg">{errors.reason.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Phone size={18} />
                            Contact Phone*
                        </label>
                        <input
                            {...register('contact_phone')}
                            placeholder="Enter 10 digit number"
                            type="tel"
                            maxLength={10}
                            className={`form-input ${errors.contact_phone ? 'error' : ''}`}
                        />
                        {errors.contact_phone && <span className="error-msg">{errors.contact_phone.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Upload size={18} />
                            Pet Image*
                        </label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="pet-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                                className="image-upload-input"
                            />
                            <label htmlFor="pet-image" className="image-upload-label">
                                {preview ? (
                                    <div className="image-preview-container">
                                        <img src={preview} alt="Preview" className="image-preview" />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPreview(null);
                                                setValue('image', null);
                                            }}
                                        >
                                            × Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={48} color="var(--primary-color)" />
                                        <span className="upload-text">Click to upload photo</span>
                                        <span className="upload-hint">JPG, PNG up to 5MB</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {errors.image && <span className="error-msg">{errors.image.message}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SurrenderRequest;
