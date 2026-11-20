import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomWaterNode from './CustomWaterNode';
import PipelineEdge from './PipelineEdge';
import DigitalTwinLegend from './DigitalTwinLegend';
import DigitalTwinControls from './DigitalTwinControls';
import ComponentDetailPanel from './ComponentDetailPanel';
import { useTelemetry } from '../../context/TelemetryContext';

const nodeTypes = {
  customWaterNode: CustomWaterNode,
};

const edgeTypes = {
  pipelineEdge: PipelineEdge,
};

/**
 * DigitalTwinGraph
 * Interactive React Flow graph for hydraulic distribution network.
 * Highlights pipeline anomalies and leakage suspicions with multi-sensor corroboration.
 */
export default function DigitalTwinGraph({
  initialNetwork,
  onSimulateAction,
}) {
  const { highlightedPipeline, suspicions } = useTelemetry();
  const [selectedElement, setSelectedElement] = useState(null);

  // Helper to map edges with dynamic suspicion and highlight flags
  const formatEdge = useCallback(
    (e) => {
      const matchSusp = suspicions?.find((s) => s.pipeline_ref === e.id);
      const isHighlighted = highlightedPipeline === e.id;
      const isLeak = e.status === 'leak' || !!matchSusp || isHighlighted;

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'pipelineEdge',
        data: {
          ...e,
          status: isLeak ? 'leak' : e.status,
          has_leak: isLeak,
          is_highlighted: isHighlighted,
          suspicion_score: matchSusp?.suspicion_score ?? (isLeak ? 0.892 : 0),
          physical_verification: matchSusp?.physical_verification ?? (isLeak ? 'AI Suspicion (Unverified)' : 'Normal'),
        },
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isLeak ? '#ef4444' : '#0ea5e9',
        },
      };
    },
    [highlightedPipeline, suspicions]
  );

  // Map backend node objects into React Flow format
  const mappedInitialNodes = useMemo(() => {
    return initialNetwork.nodes.map((n) => ({
      id: n.id,
      type: 'customWaterNode',
      position: n.position,
      data: { ...n },
    }));
  }, [initialNetwork.nodes]);

  // Map backend edges into React Flow format
  const mappedInitialEdges = useMemo(() => {
    return initialNetwork.edges.map(formatEdge);
  }, [initialNetwork.edges, formatEdge]);

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedInitialEdges);

  // When highlightedPipeline changes, auto-select it for inspection
  useEffect(() => {
    if (highlightedPipeline) {
      const targetEdge = initialNetwork.edges.find((e) => e.id === highlightedPipeline);
      if (targetEdge) {
        setSelectedElement(targetEdge);
      }
    }
  }, [highlightedPipeline, initialNetwork.edges]);

  // Update React Flow nodes/edges when backend initialNetwork changes
  useEffect(() => {
    setNodes(
      initialNetwork.nodes.map((n) => ({
        id: n.id,
        type: 'customWaterNode',
        position: n.position,
        data: { ...n },
      }))
    );
    setEdges(initialNetwork.edges.map(formatEdge));
  }, [initialNetwork, formatEdge, setNodes, setEdges]);

  // Node Click Selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedElement(node.data);
  }, []);

  // Edge Click Selection
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElement(edge.data);
  }, []);

  return (
    <div className="relative w-full h-[680px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 border border-sky-100 shadow-glass-panel">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.4}
        maxZoom={1.6}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        attributionPosition="bottom-left"
      >
        <Background color="#38bdf8" gap={24} size={1.2} style={{ opacity: 0.15 }} />
        <MiniMap
          nodeStrokeColor="#0284c7"
          nodeColor="#e0f2fe"
          nodeBorderRadius={8}
          maskColor="rgba(240, 249, 255, 0.7)"
          className="!bottom-4 !left-4 !bg-white/80 !border !border-sky-100 !rounded-2xl !shadow-sm overflow-hidden"
          style={{ width: 140, height: 95 }}
        />
        <DigitalTwinControls />
        <DigitalTwinLegend />
      </ReactFlow>

      {/* Slide-in Inspector for Selected Node or Pipeline */}
      {selectedElement && (
        <ComponentDetailPanel
          selectedItem={selectedElement}
          onClose={() => setSelectedElement(null)}
          onSimulateAction={onSimulateAction}
        />
      )}
    </div>
  );
}
