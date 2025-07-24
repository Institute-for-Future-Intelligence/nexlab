import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

interface UnpublishMaterialProps {
  materialId: string;
  open: boolean;
  onClose: () => void;
  onUnpublish: () => void;
}

const UnpublishMaterial: React.FC<UnpublishMaterialProps> = ({ materialId, open, onClose, onUnpublish }) => {
  const db = getFirestore();

  const handleConfirmUnpublish = async () => {
    const docRef = doc(db, 'materials', materialId);
    await updateDoc(docRef, { published: false });
    onUnpublish();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Unpublish Material"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to unpublish this material? It will no longer be visible to users until it is published again.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirmUnpublish} color="error" autoFocus>
          Unpublish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnpublishMaterial;