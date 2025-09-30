// src/components/LaboratoryNotebookV2/Canvas/LabCanvas.tsx
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  ConnectionMode,
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box } from '@mui/material';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { colors } from '../../../config/designSystem';
import DesignNode from '../Nodes/DesignNode';
import BuildNode from '../Nodes/BuildNode';
import TestNode from '../Nodes/TestNode';

// Custom node types
const nodeTypes = {
  designNode: DesignNode,
  buildNode: BuildNode,
  testNode: TestNode,
};

interface LabCanvasProps {
  designIdFilter?: string; // Optional filter to show only one design's hierarchy
}

const LabCanvas: React.FC<LabCanvasProps> = ({ designIdFilter }) => {
  // Get nodes and edges from store
  const storeNodes = useLabNotebookStore((state) => state.nodes);
  const storeEdges = useLabNotebookStore((state) => state.edges);

  // Filter nodes if designIdFilter is provided
  const filteredStoreNodes = React.useMemo(() => {
    if (!designIdFilter) return storeNodes;

    return storeNodes.filter(node => {
      if (node.type === 'designNode') {
        return node.data.designId === designIdFilter;
      }
      if (node.type === 'buildNode') {
        return node.data.designId === designIdFilter;
      }
      if (node.type === 'testNode') {
        return node.data.designId === designIdFilter;
      }
      return false;
    });
  }, [storeNodes, designIdFilter]);

  // Filter edges to only show connections between filtered nodes
  const filteredStoreEdges = React.useMemo(() => {
    if (!designIdFilter) return storeEdges;

    const nodeIds = new Set(filteredStoreNodes.map(n => n.id));
    return storeEdges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }, [storeEdges, filteredStoreNodes, designIdFilter]);
  const updateNodePosition = useLabNotebookStore((state) => state.updateNodePosition);
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const selectedNodeId = useLabNotebookStore((state) => state.selectedNodeId);

  // Use React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(filteredStoreNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredStoreEdges);

  // Sync store nodes/edges with local state
  useEffect(() => {
    setNodes(filteredStoreNodes);
  }, [filteredStoreNodes, setNodes]);

  useEffect(() => {
    setEdges(filteredStoreEdges);
  }, [filteredStoreEdges, setEdges]);

  // Handle node drag end - save position
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      
      // Save position changes to store
      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [onNodesChange, updateNodePosition]
  );

  // Handle node click - select node
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle pane click - deselect
  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Connection is not allowed (read-only graph)
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    console.log('Connection attempted (not allowed):', connection);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: colors.neutral[300], strokeWidth: 2 },
        }}
        style={{
          backgroundColor: colors.background.secondary,
        }}
      >
        {/* Background pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color={colors.neutral[300]}
        />

        {/* Controls for zoom/fit */}
        <Controls
          showInteractive={false}
          style={{
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.neutral[300]}`,
          }}
        />

        {/* Mini map */}
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'designNode') return colors.primary[500];
            if (node.type === 'buildNode') return colors.secondary[500];
            return colors.warning;
          }}
          nodeBorderRadius={12}
          style={{
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.neutral[300]}`,
          }}
        />

        {/* Stats panel */}
        <Panel position="top-left" style={{ margin: 16 }}>
          <Box
            sx={{
              backgroundColor: colors.background.primary,
              padding: '12px 16px',
              borderRadius: '12px',
              border: `1px solid ${colors.neutral[300]}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: colors.primary[500],
                  }}
                />
                <Box sx={{ fontSize: 14, color: colors.text.secondary }}>
                  {nodes.filter((n) => n.type === 'designNode').length} Designs
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: colors.secondary[500],
                  }}
                />
                <Box sx={{ fontSize: 14, color: colors.text.secondary }}>
                  {nodes.filter((n) => n.type === 'buildNode').length} Builds
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: colors.warning,
                  }}
                />
                <Box sx={{ fontSize: 14, color: colors.text.secondary }}>
                  {nodes.filter((n) => n.type === 'testNode').length} Tests
                </Box>
              </Box>
            </Box>
          </Box>
        </Panel>
      </ReactFlow>
    </Box>
  );
};

export default LabCanvas;

