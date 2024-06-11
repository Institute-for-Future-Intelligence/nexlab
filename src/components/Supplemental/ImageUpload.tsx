// src/components/Supplemental/ImageUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Resizer from 'react-image-file-resizer';

interface ImageUploadProps {
  sectionId: string;
  onImagesUploaded: (urls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ sectionId, onImagesUploaded }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('success');

  const storage = getStorage();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls: { url: string, path: string }[] = [];

      for (const file of files) {
        try {
          const compressedImage = await compressImage(file);
          const imageUrl = await uploadImage(compressedImage);
          urls.push(imageUrl);
        } catch (error) {
          setSnackbarMessage('Failed to upload images');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      }

      onImagesUploaded(urls.map(url => url.url));
      setSnackbarMessage('Image(s) uploaded successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const compressImage = (image: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (image.size > 5 * 1024 * 1024) {
        Resizer.imageFileResizer(
          image,
          500,
          500,
          'JPEG',
          70,
          0,
          (uri) => {
            if (typeof uri === 'string') {
              reject(new Error('Compression returned a string instead of a file'));
            } else {
              resolve(uri as File);
            }
          },
          'file'
        );
      } else {
        resolve(image);
      }
    });
  };

  const uploadImage = (image: File): Promise<{ url: string, path: string }> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `materials/${sectionId}/${image.name}`);
      uploadBytes(storageRef, image)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            resolve({ url, path: snapshot.ref.fullPath });
          });
        })
        .catch((error) => reject(error));
    });
  };

  return (
    <Box>
      <Button variant="contained" component="label" color="primary">
        Upload Image(s)
        <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUpload;