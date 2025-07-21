// FileUpload.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getStorage, ref as firebaseRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Tooltip from '@mui/material/Tooltip';

interface FileUploadProps {
    path: string;
    initialFiles: FileDetails[];
    onFilesChange: (files: FileDetails[]) => void;
    isOwnDesign: boolean; 
}

interface FileDetails {
    id: string;
    url: string;
    name: string;
    path: string;
    deleted?: boolean; // Optional property to handle file deletion state
}

const FileUpload: React.FC<FileUploadProps> = ({ path, initialFiles, onFilesChange, isOwnDesign }) => {
    const [files, setFiles] = useState<FileDetails[]>(initialFiles.map(file => ({ ...file, deleted: !!file.deleted })));

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Define editStates with an index signature
    // This will hold editing states for each file
    const [editStates, setEditStates] = useState<{ [key: string]: string }>({});
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    // Declare this state with specific type
    const [snackbarSeverity, setSnackbarSeverity] = useState<"info" | "error" | "success" | "warning">("info");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("Initial files received:", initialFiles);
        setFiles(initialFiles.map(file => ({ ...file, deleted: !!file.deleted })));
    }, [initialFiles]);

    useEffect(() => {
        return () => {
            setEditStates({});  // Reset editing states when the component unmounts
        };
    }, []);    

    // This function updates both the local component state and notifies the parent component.
    // Note: This function also updates the list of files by merging new files with existing ones (inside handleFileChange).
    const updateFiles = (newFiles: FileDetails[]) => {
        console.log('Updating files with', newFiles);
        onFilesChange(newFiles);  // Notify parent component of the updated files list
        setFiles(newFiles);       // Update local state to reflect the new list of files
    };    
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const fileList: File[] = Array.from(event.target.files);

        const filteredFiles = fileList.filter(file => {
            if (file.size > 5242880) {  // 5 MB in bytes
                setSnackbarMessage("File size should not exceed 5 MB");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return false;
            }
            return true;
        });

        setUploading(true);

        const uploadPromises = filteredFiles.map(file => {
            const uniqueIdentifier = new Date().getTime();
            const modifiedFileName = `${uniqueIdentifier}-${file.name}`;
            const storage = getStorage();
            const storageRef = firebaseRef(storage, `${path}/${modifiedFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<FileDetails>((resolve, reject) => { // Explicitly type the Promise
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
                            resolve({
                                id: uniqueIdentifier.toString(),
                                url: downloadURL,
                                name: file.name,
                                path: storageRef.fullPath,
                            });
                        });
                    }
                );
            });
        });

        Promise.all(uploadPromises).then(newFiles => {
            // Combine existing files with the new files, making sure to filter out deleted ones
            const updatedFiles: FileDetails[] = [...files.filter(file => !file.deleted), ...newFiles];
            updateFiles(updatedFiles); // Changed from setFiles to updateFiles
            setSnackbarMessage('Files uploaded successfully.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear the input after upload
            }
        }).catch(error => {
            console.error("Error uploading files: ", error);
            setSnackbarMessage('Failed to upload files.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            setUploading(false);
            setUploadProgress(0);
        });
    };

    const markFileForDeletion = (id: string) => {
        const newFiles = files.map(file => {
            if (file.id === id) {
                return { ...file, deleted: true };
            }
            return file;
        });
        updateFiles(newFiles);
        setSnackbarMessage('File marked for deletion. Update to permanently delete.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    }; 

    const handleEditClick = (fileId: string) => {
        setEditStates((prevEditStates) => ({
            ...prevEditStates,
            [fileId]: files.find((file) => file.id === fileId)?.name || '', // Ensure fallback to empty string if file is not found
        }));
        console.log("editStates after handleEditClick:", editStates);
    };

    // When you're done editing and want to save the new name
    const handleSaveClick = (fileId: string) => {
        setFiles(prevFiles => {
            const newFiles = prevFiles.map(file => {
                if (file.id === fileId && editStates[fileId] !== undefined) {
                    return { ...file, name: editStates[fileId] }; // Only update the name of the file being edited
                }
                return file;
            });
    
            onFilesChange(newFiles); // Propagate changes up to the parent component
            return newFiles;
        });

        setEditStates(prev => {
            const newState = { ...prev };
            delete newState[fileId]; // Remove the edit state for this fileId
            return newState;
        });

        setSnackbarMessage('File name updated successfully.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    };

    // Update the name in the editStates when typing
    const handleNameChange = (fileId: string, newName: string) => {
        setEditStates(prev => ({
            ...prev,
            [fileId]: newName // Update the edit state for this specific fileId
        }));
    };

    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <div>
            {isOwnDesign && (
                <Tooltip title="Upload Files">
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            m: 1, // Adds margin around the button
                            pl: 2, // Adds padding inside the button, on the left of the icon and text
                            pr: 2, // Adds padding inside the button, on the right of the icon and text
                        }}
                    >
                        Upload File(s)
                        <input type="file" hidden multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileChange} disabled={uploading} ref={fileInputRef} />
                    </Button>
                </Tooltip>
            )}
            {uploading && (
                <div>
                    <p>Uploading... {Math.round(uploadProgress)}%</p>
                </div>
            )}
            <List>
                {files.map((file) => (
                    <ListItem key={file.id} style={{ opacity: file.deleted ? 0.5 : 1 }}>
                        <ListItemIcon>
                            <InsertDriveFileIcon />
                        </ListItemIcon>
                        {typeof editStates[file.id] === 'string' ? (
                            <TextField
                                variant="outlined"
                                size="small"
                                value={editStates[file.id]}
                                onChange={(e) => handleNameChange(file.id, e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveClick(file.id)}
                                fullWidth
                            />
                        ) : (
                            <ListItemText primary={file.name} secondary={<a href={file.url} target="_blank" rel="noopener noreferrer">Download</a>} />
                        )}
                        {isOwnDesign && (
                            typeof editStates[file.id] === 'string' ? (
                                <IconButton onClick={() => handleSaveClick(file.id)} edge="end" aria-label="save">
                                <SaveIcon />
                                </IconButton>
                            ) : (
                                <>
                                <IconButton onClick={() => handleEditClick(file.id)} edge="end" aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => markFileForDeletion(file.id)} edge="end" aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>
                                </>
                            )
                        )}
                    </ListItem>
                ))}
            </List>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};
                        
export default FileUpload;