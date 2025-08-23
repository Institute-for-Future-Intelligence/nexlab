// src/components/Supplemental/MaterialImport/MaterialImportWrapper.tsx
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { Material } from '../../../types/Material';

interface MaterialImportWrapperProps {
  courseId: string;
  authorId: string;
  onMaterialReady: (materialData: Omit<Material, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
  onError: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const MaterialImportWrapper: React.FC<MaterialImportWrapperProps> = ({
  courseId,
  authorId,
  onMaterialReady,
  onCancel,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Components, setComponents] = useState<{
    MaterialImport: React.ComponentType<any>;
    MaterialImportErrorBoundary: React.ComponentType<any>;
    useMaterialImportStore: () => any;
  } | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all dependencies in parallel
        const [
          materialImportModule,
          errorBoundaryModule,
          storeModule
        ] = await Promise.all([
          import('./index'),
          import('./MaterialImportErrorBoundary'),
          import('../../../stores/materialImportStore')
        ]);

        // Verify that the store is properly loaded
        if (!storeModule.useMaterialImportStore) {
          throw new Error('Material import store not found');
        }

        setComponents({
          MaterialImport: materialImportModule.default,
          MaterialImportErrorBoundary: errorBoundaryModule.default,
          useMaterialImportStore: storeModule.useMaterialImportStore
        });
      } catch (err) {
        console.error('Failed to load material import components:', err);
        setError(err instanceof Error ? err.message : 'Failed to load components');
      } finally {
        setIsLoading(false);
      }
    };

    loadComponents();
  }, []);

  // Reset import state when components are loaded - removed to avoid hook call errors

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading AI Import Components...
        </Typography>
      </Box>
    );
  }

  if (error || !Components) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Failed to Load AI Import</Typography>
          <Typography variant="body2">
            {error || 'Components failed to load. Please try refreshing the page.'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  const { MaterialImport, MaterialImportErrorBoundary, useMaterialImportStore } = Components;

  const handleReset = () => {
    // Reset will be handled by the MaterialImportErrorBoundary itself
    console.log('Reset requested');
  };

  return (
    <MaterialImportErrorBoundary
      onError={onError}
      onReset={handleReset}
    >
      <MaterialImport
        courseId={courseId}
        authorId={authorId}
        onMaterialReady={onMaterialReady}
        onCancel={onCancel}
      />
    </MaterialImportErrorBoundary>
  );
};

export default MaterialImportWrapper;
