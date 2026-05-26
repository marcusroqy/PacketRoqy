'use client'
import { useCallback, useEffect, useState } from 'react'
import React from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  BackgroundVariant,
  type NodeProps,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Cable } from 'lucide-react'
import { useNetworkStore, type DeviceNodeData } from '@/lib/store/network'
import { DeviceNode, type DeviceFlowNode } from './nodes/DeviceNode'
import { TrafficEdge } from './edges/TrafficEdge'
import { PortPickerDialog, type PendingConnection } from './PortPickerDialog'
import { CablePortPicker } from './CablePortPicker'
import type { Node } from '@xyflow/react'

const nodeTypes = { device: DeviceNode as React.ComponentType<NodeProps<DeviceFlowNode>> } as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes = { traffic: TrafficEdge as any } as const

export function NetworkCanvas() {
  const {
    nodes, edges,
    setNodes, setEdges,
    selectedNodeId, setSelectedNodeId,
    addEdge: storeAddEdge,
    removeEdge: storeRemoveEdge,
    removeDevice,
    cableMode, setCableMode,
  } = useNetworkStore()

  // Drag-to-connect pending state
  const [pending, setPending] = useState<PendingConnection | null>(null)

  // Cable mode internal state
  const [cableStep, setCableStep] = useState<1 | 2>(1)
  const [cableSourceNode, setCableSourceNode] = useState<Node<DeviceNodeData> | null>(null)
  const [cableSourcePort, setCableSourcePort] = useState<string | null>(null)
  const [cablePickerNode, setCablePickerNode] = useState<Node<DeviceNodeData> | null>(null)

  // Reset cable flow state when cable mode is toggled off
  useEffect(() => {
    if (!cableMode) {
      setCableStep(1)
      setCableSourceNode(null)
      setCableSourcePort(null)
      setCablePickerNode(null)
    }
  }, [cableMode])

  // ESC to cancel cable steps
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (cablePickerNode) { setCablePickerNode(null); return }
      if (!cableMode) return
      if (cableStep === 2) {
        setCableStep(1)
        setCableSourceNode(null)
        setCableSourcePort(null)
      } else {
        setCableMode(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cableMode, cableStep, cablePickerNode, setCableMode])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const c of changes) {
        if (c.type === 'remove') removeDevice(c.id)
      }
      setNodes(applyNodeChanges(changes, nodes) as Node<DeviceNodeData>[])
    },
    [nodes, setNodes, removeDevice],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const c of changes) {
        if (c.type === 'remove') storeRemoveEdge(c.id)
      }
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges, storeRemoveEdge],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (cableMode) return
      if (params.source === params.target) return

      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      if (!sourceNode || !targetNode) return

      setPending({
        sourceNode: sourceNode as Node<DeviceNodeData>,
        targetNode: targetNode as Node<DeviceNodeData>,
        rawSourceHandle: params.sourceHandle ?? null,
        rawTargetHandle: params.targetHandle ?? null,
      })
    },
    [nodes, cableMode],
  )

  const handleConfirmConnect = useCallback(
    (sourceHandle: string, targetHandle: string) => {
      if (!pending) return
      storeAddEdge({
        id: '',
        source: pending.sourceNode.id,
        target: pending.targetNode.id,
        sourceHandle,
        targetHandle,
        type: 'traffic',
      })
      setPending(null)
    },
    [pending, storeAddEdge],
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (cableMode) {
        const typedNode = node as Node<DeviceNodeData>
        if (cableStep === 2 && cableSourceNode?.id === node.id) return
        setCablePickerNode(typedNode)
        return
      }
      setSelectedNodeId(node.id)
    },
    [cableMode, cableStep, cableSourceNode, setSelectedNodeId],
  )

  const handleCablePortConfirm = useCallback(
    (port: string) => {
      if (!cablePickerNode) return

      if (cableStep === 1) {
        setCableSourceNode(cablePickerNode)
        setCableSourcePort(port)
        setCableStep(2)
        setCablePickerNode(null)
      } else if (cableStep === 2 && cableSourceNode && cableSourcePort) {
        storeAddEdge({
          id: '',
          source: cableSourceNode.id,
          target: cablePickerNode.id,
          sourceHandle: `${cableSourceNode.data.deviceId}::${cableSourcePort}`,
          targetHandle: `${cablePickerNode.data.deviceId}::${port}`,
          type: 'traffic',
        })
        // Keep cable mode active — reset to step 1 for next cable
        setCableStep(1)
        setCableSourceNode(null)
        setCableSourcePort(null)
        setCablePickerNode(null)
      }
    },
    [cablePickerNode, cableStep, cableSourceNode, cableSourcePort, storeAddEdge],
  )

  const onPaneClick = useCallback(
    () => { if (!cableMode) setSelectedNodeId(null) },
    [cableMode, setSelectedNodeId],
  )

  return (
    <div className={`w-full h-full overflow-hidden relative noc-canvas ${cableMode ? 'cursor-crosshair' : ''}`}>

      {/* Cable mode status banner */}
      {cableMode && (
        <div className="noc-cable-banner absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 pointer-events-none select-none whitespace-nowrap">
          <span className="noc-cable-banner-dot w-1.5 h-1.5 rounded-full led-pulse flex-shrink-0" />
          <Cable className="noc-cable-banner-icon w-3.5 h-3.5 flex-shrink-0" />
          {cableStep === 1
            ? <span className="noc-cable-banner-text font-mono text-[11px] tracking-wide">MODO CABO — Clique no dispositivo de origem</span>
            : (
              <span className="font-mono text-[11px] flex items-center gap-1.5 tracking-wide noc-cable-banner-text">
                <span className="noc-cable-src">{cableSourceNode?.data.label}</span>
                <span className="noc-cable-sep">·</span>
                <span className="noc-cable-port">{cableSourcePort}</span>
                <span className="noc-cable-arrow">→</span>
                <span>Clique no dispositivo de destino</span>
              </span>
            )
          }
          <span className="noc-cable-esc font-mono text-[10px] ml-2">· Esc</span>
        </div>
      )}

      <ReactFlow
        nodes={nodes.map(n => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={edges.map(e => ({ ...e, type: 'traffic' }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'traffic' }}
        connectionMode={ConnectionMode.Loose}
        fitView
        deleteKeyCode="Delete"
        colorMode="dark"
        className="noc-canvas"
        minZoom={0.25}
        maxZoom={4}
        elevateEdgesOnSelect
      >
        <Background color="#0f2848" variant={BackgroundVariant.Dots} gap={28} size={1.2} />
        <Controls />
        <MiniMap
          className="!border-0"
          nodeColor={(n) => {
            const t = (n.data as DeviceNodeData)?.deviceType
            return t === 'router' ? '#2563eb' : t === 'switch' ? '#16a34a' : t === 'server' ? '#7c3aed' : '#4b5563'
          }}
        />
      </ReactFlow>

      {pending && (
        <PortPickerDialog
          pending={pending}
          edges={edges}
          onConfirm={handleConfirmConnect}
          onCancel={() => setPending(null)}
        />
      )}

      {cablePickerNode && (
        <CablePortPicker
          node={cablePickerNode}
          edges={edges}
          step={cableStep}
          sourceLabel={cableSourceNode?.data.label}
          sourcePort={cableSourcePort ?? undefined}
          onConfirm={handleCablePortConfirm}
          onCancel={() => setCablePickerNode(null)}
        />
      )}
    </div>
  )
}
