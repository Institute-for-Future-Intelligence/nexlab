// src/components/LaboratoryNotebookV2/Nodes/DesignNode.tsx
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import NodeBase from './NodeBase';
import { DesignNodeData } from '../../../types/labNotebook';
import { useLabNotebookStore } from '../../../stores/labNotebookStore';
import { colors } from '../../../config/designSystem';

const DesignNode: React.FC<NodeProps<DesignNodeData>> = memo(({ id, data, selected }) => {
  const selectNode = useLabNotebookStore((state) => state.selectNode);
  const hoveredNodeId = useLabNotebookStore((state) => state.hoveredNodeId);
  const setHoveredNode = useLabNotebookStore((state) => state.setHoveredNode);

  const nodeColor = {
    bg: colors.primary[50],
    border: colors.primary[500],
    text: colors.text.primary,
    hover: colors.primary[100],
  };

  const handleView = () => {
    selectNode(id);
  };

  const handleEdit = () => {
    selectNode(id);
    useLabNotebookStore.setState({ activePanel: 'edit' });
  };

  const badge = data.buildCount > 0 || data.testCount > 0 ? {
    label: `${data.buildCount} builds, ${data.testCount} tests`,
    color: colors.primary[500],
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
        nodeColor={nodeColor}
        showSourceHandle={true}
        showTargetHandle={false}
        badge={badge}
        isSelected={selected}
        isHovered={hoveredNodeId === id}
      />
    </div>
  );
});

DesignNode.displayName = 'DesignNode';

export default DesignNode;

