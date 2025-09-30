# Laboratory Notebook V2 Documentation

This directory contains all documentation related to the Laboratory Notebook V2 implementation.

## Overview

Laboratory Notebook V2 is a complete redesign of the laboratory notebook functionality, featuring:
- Mind-map visualization using React Flow and Dagre
- Hierarchical project structure (Designs → Builds → Tests)
- Modern, sleek UI consistent with the app's design system
- Image and file upload capabilities
- Rich text editing support (planned)

## Documentation Files

### Planning & Architecture
- **LABORATORY_NOTEBOOK_V2_PLAN.md**: Comprehensive implementation plan and technical architecture
- **LABORATORY_NOTEBOOK_V2_SUMMARY.md**: High-level summary of the implementation

### UX/UI Updates
- **LABORATORY_NOTEBOOK_V2_UX_UPDATE.md**: Documentation of UX/UI restructuring (table view + detail view)
- **LAB_NOTEBOOK_V2_ENHANCEMENTS_PLAN.md**: Plan for enhancements including EditPanel, AddBuild/AddTest, expanded views

### Feature Implementation
- **LAB_NOTEBOOK_V2_PHASE2_IMAGE_UPLOAD.md**: Phase 2 implementation - Image upload with compression and custom titles
- **LAB_NOTEBOOK_V2_PHASE3_FILE_UPLOAD.md**: Phase 3 implementation - File upload with preview and validation

## Implementation Status

### ✅ Completed
- Core mind-map visualization
- Design, Build, and Test CRUD operations
- Table overview with design-specific detail pages
- EditPanel for all node types
- AddBuild/AddTest functionality with auto-selection
- Expanded (full-screen) views for all panels
- Delete functionality with confirmation dialogs
- Image upload with compression and custom titles
- File upload with validation and preview
- Direct URL navigation support

### 🚧 In Progress
- Phase 4: Rich text editing with math symbols and Greek characters

### 📋 Planned
- Additional UX/UI refinements based on user testing
- Performance optimizations
- Mobile responsiveness improvements

## Key Technologies

- **React + TypeScript**: Core framework
- **Zustand**: State management
- **React Flow**: Mind-map visualization
- **Dagre**: Automatic graph layout
- **Firestore**: Database and storage
- **Material-UI**: Component library
- **browser-image-compression**: Image optimization

## Routes

- `/laboratory-notebook` - Main page (table view of all designs)
- `/laboratory-notebook/:designId` - Design-specific page (mind-map view)

## Current Access

Currently restricted to Super-Admin users for testing. Will be moved to general user access after final testing and refinements.

