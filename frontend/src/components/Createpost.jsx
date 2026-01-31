import { useState } from 'react';
import { 
  X, Upload, Image as ImageIcon, Dog, Cat, 
  Home, AlertCircle, MapPin, Calendar, 
  FileText, User, Mail, Phone 
} from 'lucide-react';
import { adoptionAPI, missingAPI } from '../services/api';
import '../css/Createpost.css';

const CreatePost = ({ isOpen, onClose, onSuccess }) => {
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
    lastSeenLocation: '',
    lastSeenDate: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    reward: ''
  });

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
    
    if (!imageFile) {
      alert('Please upload an image of the pet');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      if (postType === 'adoption') {
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
        formDataToSend.append('image', imageFile);

        const response = await adoptionAPI.createPet(formDataToSend);
        console.log('Adoption response:', response);
        alert(response.message || 'Pet posted successfully!');
        
      } else {
        // Missing pet - age must be integer or null
        formDataToSend.append('pet_name', formData.name);
        formDataToSend.append('species', formData.species);
        formDataToSend.append('breed', formData.breed || 'Unknown');
        
        // Convert age to number or send null
        if (formData.age && !isNaN(formData.age)) {
          formDataToSend.append('age', parseInt(formData.age));
        }
        // If age is empty or not a number, don't send it
        
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('last_seen_location', formData.lastSeenLocation);
        formDataToSend.append('last_seen_date', formData.lastSeenDate);
        formDataToSend.append('owner_name', formData.ownerName);
        formDataToSend.append('owner_email', formData.ownerEmail);
        formDataToSend.append('owner_phone', formData.ownerPhone || '');
        
        if (formData.reward) {
          formDataToSend.append('reward', formData.reward);
        }
        
        formDataToSend.append('status', 'Missing');
        formDataToSend.append('image', imageFile);

        const response = await missingAPI.createMissingPet(formDataToSend);
        console.log('Missing pet response:', response);
        alert(response.message || 'Missing pet reported!');
      }

      resetForm();
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('Error submitting post:', err);
      console.error('Error details:', err.response?.data);
      const msg = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to create post';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
      lastSeenLocation: '',
      lastSeenDate: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      reward: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setPostType('adoption');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content create-post-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {postType === 'adoption' ? (
                <>
                  <Home className="title-icon" size={28} />
                  Post Pet for Adoption
                </>
              ) : (
                <>
                  <AlertCircle className="title-icon" size={28} />
                  Report Missing Pet
                </>
              )}
            </h2>
            <p className="modal-subtitle">
              {postType === 'adoption' 
                ? 'Help find a loving home for a pet in need'
                : 'Help reunite a lost pet with their family'
              }
            </p>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={handleClose} 
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Post Type */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={18} />
              Post Type
            </label>
            <div className="button-group">
              <button
                type="button"
                className={`toggle-btn ${
                  postType === 'adoption' ? 'active' : ''
                }`}
                onClick={() => setPostType('adoption')}
                disabled={loading}
              >
                <Home size={18} />
                For Adoption
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  postType === 'missing' ? 'active' : ''
                }`}
                onClick={() => setPostType('missing')}
                disabled={loading}
              >
                <AlertCircle size={18} />
                Missing Pet
              </button>
            </div>
          </div>

          {/* Pet Species */}
          <div className="form-group">
            <label className="form-label">
              <Dog size={18} />
              Pet Type
            </label>
            <div className="button-group">
              <button
                type="button"
                className={`toggle-btn ${
                  formData.species === 'Dog' ? 'active' : ''
                }`}
                onClick={() => setFormData(
                  prev => ({ ...prev, species: 'Dog' })
                )}
                disabled={loading}
              >
                <Dog size={18} />
                Dog
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  formData.species === 'Cat' ? 'active' : ''
                }`}
                onClick={() => setFormData(
                  prev => ({ ...prev, species: 'Cat' })
                )}
                disabled={loading}
              >
                <Cat size={18} />
                Cat
              </button>
            </div>
          </div>

          {/* Image Upload */}
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
                <label 
                  htmlFor="pet-image" 
                  className="image-upload-label"
                >
                  <Upload size={48} />
                  <span className="upload-text">
                    Click to upload photo
                  </span>
                  <span className="upload-hint">
                    PNG, JPG up to 5MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview" 
                />
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

          {/* Pet Name */}
          <div className="form-group">
            <label className="form-label">
              Pet Name *
            </label>
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
            {/* Breed */}
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

            {/* Age */}
            <div className="form-group">
              <label className="form-label">
                Age {postType === 'missing' && '(years)'}
              </label>
              <input
                type={postType === 'missing' ? 'number' : 'text'}
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder={
                  postType === 'missing' 
                    ? 'e.g., 2' 
                    : 'e.g., 2 years, 6 months'
                }
                className="form-input"
                min={postType === 'missing' ? '0' : undefined}
                disabled={loading}
              />
              {postType === 'missing' && (
                <p className="form-hint">
                  Leave empty if unknown
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            {/* Gender */}
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

            {/* Size (adoption only) */}
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
          </div>

          {/* Adoption Fields */}
          {postType === 'adoption' && (
            <>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Brown, White, Black"
                  className="form-input"
                  disabled={loading}
                />
              </div>

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
                    <span>Neutered/Spayed</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Missing Pet Fields */}
          {postType === 'missing' && (
            <>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={18} />
                  Last Seen Location *
                </label>
                <input
                  type="text"
                  name="lastSeenLocation"
                  value={formData.lastSeenLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Central Park, New York"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Last Seen Date *
                </label>
                <input
                  type="date"
                  name="lastSeenDate"
                  value={formData.lastSeenDate}
                  onChange={handleInputChange}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Your Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={18} />
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleInputChange}
                    placeholder="555-1234"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reward (Optional)
                </label>
                <input
                  type="text"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  placeholder="e.g., $500"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={18} />
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={
                postType === 'adoption'
                  ? "Describe the pet's personality, temperament..."
                  : "Describe distinctive features, behavior..."
              }
              className="form-textarea"
              rows={4}
              maxLength={500}
              required
              disabled={loading}
            />
            <p className="form-hint">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : (
                postType === 'adoption' 
                  ? 'Post for Adoption' 
                  : 'Report Missing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;