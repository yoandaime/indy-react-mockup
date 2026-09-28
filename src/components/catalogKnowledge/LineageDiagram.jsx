import { useMemo } from "react"
import { ReactFlow, Background, Controls, Handle, Position } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dataSourceIcon from "@/assets/metadata-lineage-discovery/datasource.png"
import pipelineIcon from "@/assets/metadata-lineage-discovery/pipeline.png"
import dataWarehouseIcon from "@/assets/metadata-lineage-discovery/data-warehouse.png"

const LINEAGE_KIND_CONFIG = {
  source: { icon: dataSourceIcon },
  pipeline: { icon: pipelineIcon },
  warehouse: { icon: dataWarehouseIcon },
}

function dqBadgeClasses(value) {
  if (value >= 90) return "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
  if (value >= 75) return "bg-amber-50 text-amber-700 ring-amber-600/20"
  return "bg-red-50 text-red-700 ring-red-600/20"
}

function LineageNode({ data }) {
  const { icon } = LINEAGE_KIND_CONFIG[data.kind] ?? LINEAGE_KIND_CONFIG.source

  return (
    <div className="flex w-[130px] flex-col items-center gap-2">
      <span className="text-sm font-medium text-foreground">{data.label}</span>
      <div className="relative flex size-[100px] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
        <Handle type="target" position={Position.Left} className="!size-2 !border-neutral-300 !bg-white" />
        <img src={icon} alt="" className="size-24 object-contain" draggable={false} />
        <Handle type="source" position={Position.Right} className="!size-2 !border-neutral-300 !bg-white" />
        {data.showDqValue && (
          <span
            className={`absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${dqBadgeClasses(data.dqValue)}`}
          >
            {data.dqValue}%
          </span>
        )}
      </div>
    </div>
  )
}

const nodeTypes = { lineage: LineageNode }

export default function LineageDiagram({ nodes: nodeDefs, edges: edgeDefs, showDqValue }) {
  const nodes = useMemo(
    () =>
      nodeDefs.map((node) => ({
        id: node.id,
        type: "lineage",
        position: { x: node.x, y: node.y },
        data: { label: node.label, kind: node.kind, dqValue: node.dqValue, showDqValue },
        draggable: false,
      })),
    [nodeDefs, showDqValue]
  )

  const edges = useMemo(
    () =>
      edgeDefs.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        style: { stroke: "#9ca3af" },
      })),
    [edgeDefs]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.35 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
      style={{ backgroundColor: "#FCFCFC" }}
    >
      <Background variant="dots" gap={16} size={1.5} color="#a3a3a3" />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}
