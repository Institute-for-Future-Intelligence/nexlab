// src/components/Supplemental/EditMaterialForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import AddMaterialForm from './AddMaterialFormModern';
import { Material } from '../../types/Material';
import { Box, CircularProgress } from '@mui/material';
import { useUser } from '../../hooks/useUser';
import { v4 as uuidv4 } from 'uuid';

const EditMaterialForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const db = getFirestore();
  const { userDetails } = useUser();
  const [materialData, setMaterialData] = useState<Material | null>(null);

  const validCourses = useMemo(() => {
    return userDetails?.classes
      ? Object.entries(userDetails.classes)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, course]) => course.isCourseAdmin)
          .map(([id]) => id)
      : [];
  }, [userDetails?.classes]);

  useEffect(() => {
    if (id) {
      const fetchMaterial = async () => {
        try {
          const docRef = doc(db, 'materials', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const material = { id: docSnap.id, ...docSnap.data() } as Material;

            // Debug: Log the material data structure
            console.log('Material data from Firestore:', material);
            console.log('Sections type:', typeof material.sections);
            console.log('Sections value:', material.sections);

            // Ensure sections and nested data are properly structured
            // Handle case where sections might not be an array
            if (!Array.isArray(material.sections)) {
              console.warn('Sections is not an array, initializing as empty array. Original value:', material.sections);
              material.sections = [];
            }

            // Ensure all nested arrays are properly initialized
            material.sections = material.sections.map(section => {
              // Ensure section has all required properties
              const processedSection = {
                id: section.id || uuidv4(),
                title: section.title || 'Untitled Section',
                content: section.content || '',
                images: Array.isArray(section.images) ? section.images.map(image => ({ 
                  ...image, 
                  title: image.title || '' 
                })) : [],
                links: Array.isArray(section.links) ? section.links : [],
                subsections: Array.isArray(section.subsections) ? section.subsections.map(subsection => ({
                  id: subsection.id || uuidv4(),
                  title: subsection.title || 'Untitled Subsection',
                  content: subsection.content || '',
                  images: Array.isArray(subsection.images) ? subsection.images.map(image => ({ 
                    ...image, 
                    title: image.title || '' 
                  })) : [],
                  links: Array.isArray(subsection.links) ? subsection.links : [],
                  subSubsections: Array.isArray(subsection.subSubsections) ? subsection.subSubsections.map(subSubsection => ({
                    id: subSubsection.id || uuidv4(),
                    title: subSubsection.title || 'Untitled Sub-subsection',
                    content: subSubsection.content || '',
                    images: Array.isArray(subSubsection.images) ? subSubsection.images.map(image => ({ 
                      ...image, 
                      title: image.title || '' 
                    })) : [],
                    links: Array.isArray(subSubsection.links) ? subSubsection.links : [],
                  })) : [],
                })) : [],
              };
              return processedSection;
            });          

            // Validate course assignment
            material.course = validCourses.includes(material.course)
              ? material.course
              : validCourses[0] || ''; // Default to first valid course or empty string

            setMaterialData(material);
          }
        } catch (error) {
          console.error('Error fetching material:', error);
        }
      };

      fetchMaterial();
    }
  }, [id, db, userDetails, validCourses]);

  const handleUpdateMaterial = async (updatedData: Material) => {
    try {
      if (id) {
        const docRef = doc(db, 'materials', id);
        await updateDoc(docRef, { ...updatedData });
      }
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  if (!materialData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <AddMaterialForm materialData={materialData} onSubmit={handleUpdateMaterial} />;
};

export default EditMaterialForm;