import { useState } from 'react';
import { X } from 'lucide-react';
import '../css/Createpost.css';

const CreatePost = ({ isOpen, onClose, onSubmit }) => {
  const [postType, setPostType] = useState('adoption'); // 'adoption' or 'missing'
  const [petType, setPetType] = useState('dog');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    petName: '',
    breed: '',
    age: '',
    location: '',
    description: ''
  });

  const presetImages = [
    'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data to send
    const postData = {
      postType,
      petType,
      image: selectedImage,
      ...formData
    };

    // Call the parent's onSubmit function
    if (onSubmit) {
      onSubmit(postData);
    }

    // Reset form
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      breed: '',
      age: '',
      location: '',
      description: ''
    });
    setSelectedImage(null);
    setPostType('adoption');
    setPetType('dog');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create New Post</h2>
            <p className="modal-subtitle">Share a pet for adoption or report a missing pet.</p>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Post Type Selection */}
          <div className="form-group">
            <label className="form-label">Post Type</label>
            <div className="button-group">
              <button
                type="button"
                className={`toggle-btn ${postType === 'adoption' ? 'active' : ''}`}
                onClick={() => setPostType('adoption')}
              >
                For Adoption
              </button>
              <button
                type="button"
                className={`toggle-btn ${postType === 'missing' ? 'active' : ''}`}
                onClick={() => setPostType('missing')}
              >
                Missing Pet
              </button>
            </div>
          </div>

          {/* Pet Type Selection */}
          <div className="form-group">
            <label className="form-label">Pet Type</label>
            <div className="button-group">
              <button
                type="button"
                className={`toggle-btn ${petType === 'dog' ? 'active' : ''}`}
                onClick={() => setPetType('dog')}
              >
                🐕 Dog
              </button>
              <button
                type="button"
                className={`toggle-btn ${petType === 'cat' ? 'active' : ''}`}
                onClick={() => setPetType('cat')}
              >
                🐱 Cat
              </button>
            </div>
          </div>

          {/* Pet Image Selection */}
          <div className="form-group">
            <label className="form-label">Pet Image</label>
            <div className="image-grid">
              {presetImages.map((img, index) => (
                <div
                  key={index}
                  className={`image-option ${selectedImage === img ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`Pet ${index + 1}`} />
                </div>
              ))}
            </div>
            <p className="form-hint">Select a placeholder image (in production you&apos;d upload real photos)</p>
          </div>

          {/* Pet Name */}
          <div className="form-group">
            <label className="form-label">Pet Name</label>
            <input
              type="text"
              name="petName"
              value={formData.petName}
              onChange={handleInputChange}
              placeholder="Enter pet's name"
              className="form-input"
              maxLength={50}
              required
            />
            <p className="form-hint">{formData.petName.length}/50 characters</p>
          </div>

          {/* Breed */}
          <div className="form-group">
            <label className="form-label">Breed</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="e.g., Golden Retriever, Tabby Cat"
              className="form-input"
              required
            />
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g., 2 years, 6 months"
              className="form-input"
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., New York, NY"
              className="form-input"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the pet's personality, temperament, and what kind of home they need..."
              className="form-textarea"
              rows={4}
              maxLength={500}
              required
            />
            <p className="form-hint">{formData.description.length}/500 characters</p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;