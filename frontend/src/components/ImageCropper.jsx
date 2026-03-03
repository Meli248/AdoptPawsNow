import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, X } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);

    const onImageLoad = useCallback((e) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        const initialCrop = centerAspectCrop(width, height, 4 / 3);
        setCrop(initialCrop);
        // Pre-fill completedCrop so Apply works without needing to drag
        setCompletedCrop({
            unit: 'px',
            x: e.currentTarget.width * 0.05,
            y: e.currentTarget.height * 0.05,
            width: e.currentTarget.width * 0.9,
            height: (e.currentTarget.width * 0.9) * (3 / 4)
        });
    }, []);

    const handleApply = useCallback(async () => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob((blob) => {
            if (!blob) return;
            const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
            const croppedUrl = URL.createObjectURL(blob);
            onCropComplete(croppedFile, croppedUrl);
        }, 'image/jpeg', 0.95);
    }, [completedCrop, onCropComplete]);

    return (
        <div className="cropper-overlay">
            <div className="cropper-modal">
                <div className="cropper-header">
                    <h3>Crop Image</h3>
                    <p>Drag to adjust the crop area, then click Apply.</p>
                </div>

                <div className="cropper-canvas">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={4 / 3}
                        minHeight={50}
                        minWidth={50}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block' }}
                        />
                    </ReactCrop>
                </div>

                <div className="cropper-actions">
                    <button type="button" className="crop-btn crop-cancel" onClick={onCancel}>
                        <X size={18} /> Cancel
                    </button>
                    <button type="button" className="crop-btn crop-apply" onClick={handleApply}>
                        <Check size={18} /> Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
