// src/types/labNotebook.ts
import { Node, Edge } from 'reactflow';
import { Design, Image, FileDetails } from './types';
import { Build, Test } from './dashboard';
import { DataAnalysisSection } from './dataAnalysis';

/**
 * Lab Notebook V2 Types
 * Modern mind-map interface for designs, builds, and tests
 */

// ============================================================================
// Node Data Types (for React Flow visualization)
// ============================================================================

export interface BaseNodeData {
  label: string;
  title: string;
  description: string;
  dateCreated: Date;
  userId: string;
  images: Image[];
  files: FileDetails[];
  course?: string;
  dataAnalysis?: DataAnalysisSection;
}

export interface DesignNodeData extends BaseNodeData {
  type: 'design';
  designId: string;
  dateModified: Date;
  buildCount: number;
  testCount: number;
}

export interface BuildNodeData extends BaseNodeData {
  type: 'build';
  buildId: string;
  designId: string;
  dateModified: Date;
  testCount: number;
}

export interface TestNodeData extends BaseNodeData {
  type: 'test';
  testId: string;
  buildId: string;
  designId: string;
  dateModified: Date;
  results: string;
  conclusions: string;
}

export type NodeData = DesignNodeData | BuildNodeData | TestNodeData;

// React Flow node types
export type LabNode = Node<NodeData>;
export type LabEdge = Edge;

// ============================================================================
// Graph Structure
// ============================================================================

export interface LabGraph {
  nodes: LabNode[];
  edges: LabEdge[];
}

export interface GraphMetrics {
  designCount: number;
  buildCount: number;
  testCount: number;
  totalNodes: number;
  totalEdges: number;
}

// ============================================================================
// Layout Types
// ============================================================================

export type LayoutType = 'horizontal' | 'vertical' | 'radial';
export type ViewMode = 'graph' | 'list';

export interface LayoutConfig {
  type: LayoutType;
  nodeSpacing: number;
  rankSpacing: number;
  edgeSpacing: number;
  direction: 'LR' | 'TB' | 'RL' | 'BT';
}

// ============================================================================
// Panel Types
// ============================================================================

export type PanelType = 'detail' | 'create' | 'edit' | 'filter' | 'addBuild' | 'addTest' | null;

export interface PanelState {
  activePanel: PanelType;
  selectedNodeId: string | null;
  selectedNodeType: 'design' | 'build' | 'test' | null;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface FilterState {
  courseId: string | null;
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  nodeTypes: {
    designs: boolean;
    builds: boolean;
    tests: boolean;
  };
}

// ============================================================================
// CRUD Operation Types
// ============================================================================

export interface CreateDesignInput {
  title: string;
  description: string;
  course: string;
  userId: string;
  images?: Image[];
  files?: FileDetails[];
}

export interface CreateBuildInput {
  title: string;
  description: string;
  designId: string;
  userId: string;
  images?: Image[];
  files?: FileDetails[];
}

export interface CreateTestInput {
  title: string;
  description: string;
  results: string;
  conclusions: string;
  buildId: string;
  designId: string;
  userId: string;
  images?: Image[];
  files?: FileDetails[];
}

// Update types (partial updates)
export interface UpdateDesignInput extends Partial<Omit<CreateDesignInput, 'userId'>> {
  id: string;
}

export interface UpdateBuildInput extends Partial<Omit<CreateBuildInput, 'userId' | 'designId'>> {
  id: string;
}

export interface UpdateTestInput extends Partial<Omit<CreateTestInput, 'userId' | 'buildId' | 'designId'>> {
  id: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface UIState {
  isLoading: boolean;
  error: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isPanelOpen: boolean;
  isToolbarExpanded: boolean;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

// ============================================================================
// Interaction Types
// ============================================================================

export interface NodeInteraction {
  nodeId: string;
  nodeType: 'design' | 'build' | 'test';
  action: 'select' | 'hover' | 'drag' | 'delete' | 'edit';
  timestamp: Date;
}

export interface BulkAction {
  action: 'delete' | 'export' | 'move';
  nodeIds: string[];
  targetCourse?: string;
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface ExportData {
  designs: Design[];
  builds: Build[];
  tests: Test[];
  exportDate: Date;
  version: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface LabAnalytics {
  totalDesigns: number;
  totalBuilds: number;
  totalTests: number;
  averageBuildsPerDesign: number;
  averageTestsPerBuild: number;
  mostActiveCourse: string | null;
  recentActivity: {
    date: Date;
    action: string;
    entityType: 'design' | 'build' | 'test';
    entityId: string;
  }[];
}

// ============================================================================
// Helper Types
// ============================================================================

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface ConnectionPath {
  sourceId: string;
  targetId: string;
  path: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface LabNotebookError {
  code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'INVALID_DATA' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  details?: any;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isDesignNode(node: LabNode): node is Node<DesignNodeData> {
  return node.data.type === 'design';
}

export function isBuildNode(node: LabNode): node is Node<BuildNodeData> {
  return node.data.type === 'build';
}

export function isTestNode(node: LabNode): node is Node<TestNodeData> {
  return node.data.type === 'test';
}

// ============================================================================
// Constants
// ============================================================================

export const NODE_TYPES = {
  DESIGN: 'design',
  BUILD: 'build',
  TEST: 'test',
} as const;

export const EDGE_TYPES = {
  DEFAULT: 'smoothstep',
  ANIMATED: 'animated',
} as const;

export const DEFAULT_NODE_DIMENSIONS = {
  design: { width: 280, height: 140 },
  build: { width: 260, height: 120 },
  test: { width: 260, height: 120 },
} as const;

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  type: 'horizontal',
  nodeSpacing: 80,
  rankSpacing: 200,
  edgeSpacing: 50,
  direction: 'LR',
};

