// src/components/LaboratoryNotebookV2/Nodes/TestNode.tsx
/* eslint-disable react/prop-types */
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import NodeBase from './NodeBase';
import { TestNodeData } from '../../../types/labNotebook';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { colors } from '../../../config/designSystem';

const TestNode: React.FC<NodeProps<TestNodeData>> = memo(({ id, data, selected }) => {
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const hoveredNodeId = useLabNotebookStore((state) => state.hoveredNodeId);
  const setHoveredNode = useLabNotebookStore((state) => state.setHoveredNode);
  const openDeleteDialog = useLabNotebookStore((state) => state.openDeleteDialog);

  const nodeColor = {
    bg: '#FFF7ED', // Orange tint
    border: colors.warning,
    text: colors.text.primary,
    hover: '#FFEDD5',
  };

  const handleView = () => {
    selectNode(id);
  };

  const handleEdit = () => {
    selectNode(id);
    useLabNotebookStore.setState({ activePanel: 'edit' });
  };

  const handleDelete = () => {
    openDeleteDialog(data.testId, 'test', data.title);
  };

  return (
    <div
      onMouseEnter={() => setHoveredNode(id)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <NodeBase
        id={id}
        title={data.title}
        description={data.description}
        dateCreated={data.dateCreated}
        imageCount={data.images?.length || 0}
        fileCount={data.files?.length || 0}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        nodeColor={nodeColor}
        showSourceHandle={false}
        showTargetHandle={true}
        isSelected={selected}
        isHovered={hoveredNodeId === id}
      />
    </div>
  );
});

TestNode.displayName = 'TestNode';

export default TestNode;

