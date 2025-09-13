import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";

interface Material {
  id: string;
  title: string;
  status: "saved" | "scheduled" | "published";
}

interface MaterialsTabsProps {
  courseId: string;
}

const MaterialsTabs: React.FC<MaterialsTabsProps> = ({ courseId }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [materials, setMaterials] = useState<Material[]>([]);
  const db = getFirestore();

  const categories: Array<Material["status"]> = [
    "saved",
    "scheduled",
    "published",
  ];

  // materials from Firestore
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const materialsRef = collection(db, "courses", courseId, "materials");
        const snapshot = await getDocs(materialsRef);

        const fetched: Material[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Material, "id">),
        }));

        setMaterials(fetched);
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    };

    if (courseId) fetchMaterials();
  }, [courseId, db]);

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const filteredMaterials = materials.filter(
    (mat) => mat.status === categories[tabIndex]
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 3 }}>
      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="Saved" />
        <Tab label="Scheduled" />
        <Tab label="Published" />
      </Tabs>

      {/* Content */}
      {filteredMaterials.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 2 }}>
          No materials in this category.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {filteredMaterials.map((mat) => (
            <Card
              key={mat.id}
              variant="outlined"
              sx={{
                borderTop: `4px solid ${
                  mat.status === "published"
                    ? "#2e7d32"
                    : mat.status === "scheduled"
                    ? "#0288d1"
                    : "#9e9e9e"
                }`,
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {mat.title}
                </Typography>
                <Chip
                  label={mat.status}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor:
                      mat.status === "published"
                        ? "#C8E6C9"
                        : mat.status === "scheduled"
                        ? "#BBDEFB"
                        : "#F5F5F5",
                  }}
                />

                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined">
                    View
                  </Button>
                  <Button size="small" variant="outlined">
                    Edit
                  </Button>
                  {mat.status === "published" && (
                    <Button size="small" color="error" variant="outlined">
                      Unpublish
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MaterialsTabs;
