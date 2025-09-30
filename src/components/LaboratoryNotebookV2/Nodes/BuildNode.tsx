// src/components/LaboratoryNotebookV2/Nodes/BuildNode.tsx
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import NodeBase from './NodeBase';
import { BuildNodeData } from '../../../types/labNotebook';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { colors } from '../../../config/designSystem';

const BuildNode: React.FC<NodeProps<BuildNodeData>> = memo(({ id, data, selected }) => {
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const hoveredNodeId = useLabNotebookStore((state) => state.hoveredNodeId);
  const setHoveredNode = useLabNotebookStore((state) => state.setHoveredNode);
  const openDeleteDialog = useLabNotebookStore((state) => state.openDeleteDialog);

  const nodeColor = {
    bg: colors.secondary[50],
    border: colors.secondary[500],
    text: colors.text.primary,
    hover: colors.secondary[100],
  };

  const handleView = () => {
    selectNode(id);
  };

  const handleEdit = () => {
    selectNode(id);
    useLabNotebookStore.setState({ activePanel: 'edit' });
  };

  const handleDelete = () => {
    openDeleteDialog(data.buildId, 'build', data.title);
  };

  const badge = data.testCount > 0 ? {
    label: `${data.testCount} test${data.testCount > 1 ? 's' : ''}`,
    color: colors.secondary[500],
  } : undefined;

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
        showSourceHandle={true}
        showTargetHandle={true}
        badge={badge}
        isSelected={selected}
        isHovered={hoveredNodeId === id}
      />
    </div>
  );
});

BuildNode.displayName = 'BuildNode';

export default BuildNode;

