// ImageUpload.jsx
import React, { useState, useRef, useEffect } from 'react';
import { getStorage, ref as firebaseRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import imageCompression from 'browser-image-compression';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ImageUpload = ({ path, initialImages = [], onImagesUpdated }) => {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);  // To handle which image is shown in full screen
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('Initial images received:', initialImages);
    setImages(initialImages);
  }, []);  // This will only run once when the component mounts

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    const uploadPromises = files.map(async (file) => {
      let compressedFile = file;

      // Check if the file is larger than 1 MB and needs compression
      if (file.size > 1024 * 1024) {
        compressedFile = await imageCompression(file, options);
        // Notify the user that the image is being compressed
        setSnackbarMessage('Your image was compressed before uploading due to file size larger than 1 MB.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
            
      const uniqueIdentifier = new Date().getTime();
      const modifiedFileName = `${uniqueIdentifier}-${compressedFile.name}`;
      const storage = getStorage();
      const storageRef = firebaseRef(storage, `${path}/${modifiedFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve({ url: downloadURL, path: storageRef.fullPath, title: '' });
            });
          }
        );
      });
    });

    Promise.all(uploadPromises).then(newImages => {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages);
      }
      setSnackbarMessage('Images uploaded successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setUploading(false);
      setUploadProgress(0);
      fileInputRef.current.value = '';
    }).catch(error => {
      console.error("Error uploading images: ", error);
      setSnackbarMessage('Failed to upload images.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUploading(false);
      setUploadProgress(0);
    });
  };

  const deleteImage = async (index) => {
    const imageToDelete = images[index];
    const storage = getStorage();
    const imageRef = firebaseRef(storage, imageToDelete.path);

    try {
      await deleteObject(imageRef);
      const updatedImages = images.filter((_, idx) => idx !== index);
      setImages(updatedImages);
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages);
      }
      setSnackbarMessage('Image deleted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error removing file:", error);
      setSnackbarMessage('Failed to delete image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const toggleFullScreen = (index) => {
    setIsFullScreen(!isFullScreen);
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullScreenNow = !!document.fullscreenElement;
      setIsFullScreen(isFullScreenNow);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <div>
      <h5>Images</h5>
      <Button variant="outlined" component="label">
        Upload Image(s)
        <input type="file" hidden multiple onChange={handleImageChange} disabled={uploading} ref={fileInputRef} accept="image/*" />
      </Button>
      {uploading && (
        <>
          <p>Uploading... {Math.round(uploadProgress)}%</p>
          <div style={{ width: '100%', backgroundColor: '#ddd' }}>
            <div style={{ height: '20px', width: `${uploadProgress}%`, backgroundColor: 'green' }}></div>
          </div>
        </>
      )}
      {images.map((image, index) => (
        <div key={index}>
          <img src={image.url} alt={`Uploaded design ${index}`} onClick={() => { setIsModalVisible(true); setCurrentImageIndex(index); }} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', cursor: 'pointer' }} />
          <IconButton onClick={() => deleteImage(index)}><DeleteIcon /></IconButton>
          <textarea
            value={image.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setImages(prev => {
                const updatedImages = prev.map((img, idx) => idx === index ? {...img, title: newTitle} : img);
                if (onImagesUpdated) {
                  onImagesUpdated(updatedImages);
                }
                return updatedImages;
              });
            }}
            placeholder="Enter image title"
            rows="2"
            style={{ width: '100%' }}
          />
        </div>
      ))}
      <Dialog 
        open={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        fullScreen={isFullScreen} 
        PaperProps={{
          style: {
            backgroundColor: 'white', 
            boxShadow: 'none', 
            maxWidth: isFullScreen ? 'none' : undefined,
            maxHeight: isFullScreen ? 'none' : undefined,
            height: isFullScreen ? '100%' : undefined,
            width: isFullScreen ? '100%' : undefined,
            overflowY: 'auto'
          }
        }}
      >
        {currentImageIndex !== null && (
          <DialogContent>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={images[currentImageIndex].url} 
                alt={`Zoomed Design ${currentImageIndex}`}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: isFullScreen ? '100vh' : undefined, 
                  transform: `scale(${zoomScale})`, 
                  transition: 'transform 0.2s ease-out' 
                }} 
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <IconButton onClick={() => setZoomScale(zoomScale * 1.2)}><ZoomInIcon /></IconButton>
              <IconButton onClick={() => setZoomScale(zoomScale / 1.2)} style={{ marginLeft: '10px' }}><ZoomOutIcon /></IconButton>
              <IconButton onClick={() => toggleFullScreen(currentImageIndex)} style={{ marginLeft: '10px' }}>
                <FullscreenIcon />
              </IconButton>
              {isFullScreen && (
                <IconButton
                  onClick={() => toggleFullScreen(currentImageIndex)}
                  style={{
                    position: 'absolute', // Changed from 'fixed' to 'absolute' within the dialog context
                    top: 20,
                    right: 20,
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ImageUpload;