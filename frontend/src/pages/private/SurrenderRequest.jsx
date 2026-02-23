import { useState, useEffect } from 'react';
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
    age: z.string()
        .optional()
        .refine((val) => !val || /^\d+$/.test(val), { message: "Age must be numbers only" })
        .refine((val) => !val || (parseInt(val) >= 0), { message: "Age cannot be negative" })
        .refine((val) => !val || (val.length <= 2), { message: "Age cannot be more than 2 digits (use months for younger)" }),
    gender: z.enum(['male', 'female', 'unknown']).optional(),
    reason: z.string().min(10, 'Please provide a detailed reason (min 10 chars)'),

    // Contact Info - All Required
    contact_name: z.string().min(1, 'Contact Name is required'),
    contact_email: z.string().email('Invalid email address').min(1, 'Contact Email is required'),
    contact_phone: z.string().regex(/^[0-9]+$/, 'Phone must be numbers only').min(10, 'Phone must be at least 10 digits').max(15, 'Phone cannot be more than 15 digits'),

    location: z.string().min(1, 'Location is required'),
    image: z.union([
        z.any().refine((files) => files?.length > 0, "Image is required"),
        z.string().min(1, "Image is required") // Allow string URL for existing images
    ])
});

const SurrenderRequest = ({ initialData, isEdit = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: zodResolver(surrenderSchema),
        defaultValues: {
            pet_type: 'dog',
            gender: 'unknown'
        }
    });

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            // Map initial data to form fields
            const defaultValues = {
                pet_name: initialData.pet_name || initialData.name,
                pet_type: (initialData.pet_type || initialData.species || 'dog').toLowerCase(),
                breed: initialData.breed || '',
                age: initialData.age ? String(initialData.age) : '',
                gender: (initialData.gender || 'unknown').toLowerCase(),
                reason: initialData.reason || initialData.description || '',
                contact_name: initialData.contact_name || '',
                contact_email: initialData.contact_email || '',
                contact_phone: initialData.contact_phone || '',
                location: initialData.location || '',
                image: initialData.image_url // Set existing image URL
            };

            // Set preview if image exists
            if (initialData.image_url) {
                setPreview(initialData.image_url.startsWith('http') ? initialData.image_url : `${import.meta.env.VITE_API_URL}${initialData.image_url}`);
            }

            reset(defaultValues);
        }
    }, [initialData, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();

            formData.append('pet_name', data.pet_name);
            formData.append('pet_type', data.pet_type);
            formData.append('reason', data.reason);
            // Append new contact fields
            formData.append('contact_name', data.contact_name);
            formData.append('contact_email', data.contact_email);
            formData.append('contact_phone', data.contact_phone);

            formData.append('location', data.location);

            if (data.image && data.image instanceof FileList && data.image.length > 0) {
                formData.append('image', data.image[0]);
            }

            if (data.breed) formData.append('breed', data.breed);
            if (data.age) formData.append('age', data.age);
            if (data.gender) formData.append('gender', data.gender);

            let response;
            if (isEdit && initialData) {
                // Determine if updating a Pet (Admin) or Surrender Request (User)
                const id = initialData.pet_id || initialData.id || initialData.application_id;
                // If it has application_id, likely a surrender request. If id/pet_id, likely a pet.
                // However, AdminEditPet passes 'id' from params.

                // If updating a PET (Admin side usually), endpoint is /pets/:id
                // If updating a Surrender Request (User side), endpoint is /surrender/:id

                // Let's guess based on where it came from or structure.
                // Surrender requests have 'application_id'. Pets have 'id'.

                const endpoint = initialData.application_id
                    ? `${import.meta.env.VITE_API_URL}/surrender/${initialData.application_id}` // Update request
                    : `${import.meta.env.VITE_API_URL}/pets/${id}`;   // Update pet

                response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                response = await fetch(`${import.meta.env.VITE_API_URL}/surrender`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            }

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('access_token');
                navigate('/login');
                return;
            }

            const result = await response.json();

            if (response.ok) {
                alert(isEdit ? 'Updated successfully!' : 'Request submitted successfully! We will contact you shortly.');
                if (window.history.length > 1) {
                    navigate(-1); // Go back to previous page (Profile or Admin Dashboard)
                } else {
                    navigate('/profile');
                }
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
            <h1 className="page-title">{isEdit ? 'Edit Details' : 'Surrender Form'}</h1>
            <p className="page-subtitle">
                {isEdit ? 'Update the details below.' : 'Help this pet find a loving forever home. Please provide details below.'}
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
                                Age (Optional)
                            </label>
                            <input
                                {...register('age')}
                                placeholder="e.g. 5"
                                className={`form-input ${errors.age ? 'error' : ''}`}
                            />
                            {errors.age && <span className="error-msg">{errors.age.message}</span>}
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

                    <h3>Contact Information</h3>
                    <div className="form-group">
                        <label className="form-label">
                            <User size={18} />
                            Contact Name*
                        </label>
                        <input
                            {...register('contact_name')}
                            placeholder="e.g. John Doe"
                            className={`form-input ${errors.contact_name ? 'error' : ''}`}
                        />
                        {errors.contact_name && <span className="error-msg">{errors.contact_name.message}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <FileText size={18} />
                                Contact Email*
                            </label>
                            <input
                                {...register('contact_email')}
                                placeholder="e.g. john@example.com"
                                className={`form-input ${errors.contact_email ? 'error' : ''}`}
                            />
                            {errors.contact_email && <span className="error-msg">{errors.contact_email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Phone size={18} />
                                Contact Phone*
                            </label>
                            <input
                                {...register('contact_phone')}
                                placeholder="e.g. 5551234567"
                                className={`form-input ${errors.contact_phone ? 'error' : ''}`}
                            />
                            {errors.contact_phone && <span className="error-msg">{errors.contact_phone.message}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={18} />
                            Reason/Description*
                        </label>
                        <textarea
                            {...register('reason')}
                            rows="4"
                            placeholder="Please explain why you are surrendering this pet or maintain a description..."
                            className={`form-textarea ${errors.reason ? 'error' : ''}`}
                        />
                        {errors.reason && <span className="error-msg">{errors.reason.message}</span>}
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
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : (isEdit ? 'Update Details' : 'Submit Request')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SurrenderRequest;
