'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Pencil, Trash2, Check, LogOut, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProjectsStore } from '@/lib/store/projects'
import { useNetworkStore, engine } from '@/lib/store/network'
import { RouterDevice } from '@/lib/simulation/devices/router'
import { SwitchDevice } from '@/lib/simulation/devices/switch'
import { PCDevice } from '@/lib/simulation/devices/pc'
import type { Node, Edge } from '@xyflow/react'
import type { DeviceNodeData } from '@/lib/store/network'
import type { DeviceSnapshot } from '@/lib/simulation/types'
import { useRouter } from 'next/navigation'

function restoreEngine(
  snapshots: Record<string, DeviceSnapshot>,
  nodes: Node<DeviceNodeData>[],
  edges: Edge[],
) {
  for (const snap of Object.values(snapshots)) {
    if (snap.type === 'router') {
      const d = new RouterDevice(snap.id, snap.name, snap.interfaces.length, snap.brand)
      d.restoreState(snap)
      engine.register(d)
    } else if (snap.type === 'switch') {
      const d = new SwitchDevice(snap.id, snap.name, snap.portCount, snap.brand)
      d.restoreState(snap)
      engine.register(d)
    } else {
      const d = new PCDevice(snap.id, snap.name, snap.brand, snap.subtype)
      d.restoreState(snap)
      engine.register(d)
    }
  }
  for (const edge of edges) {
    const srcNode = nodes.find(n => n.id === edge.source)
    const tgtNode = nodes.find(n => n.id === edge.target)
    if (!srcNode || !tgtNode) continue
    const srcIf = edge.sourceHandle?.replace(`${srcNode.data.deviceId}::`, '') ?? ''
    const tgtIf = edge.targetHandle?.replace(`${tgtNode.data.deviceId}::`, '') ?? ''
    if (srcIf && tgtIf) engine.addLink(srcNode.data.deviceId, srcIf, tgtNode.data.deviceId, tgtIf)
  }
}

export function ProjectSelector() {
  const router = useRouter()
  const { projects, activeProjectId, saving, lastSaved, loadProjects, createProject, selectProject, saveProject, renameProject, deleteProject } = useProjectsStore()
  const { nodes, edges, deviceSnapshots, deviceCounters, setNodes, setEdges } = useNetworkStore()

  const [open,      setOpen]      = useState(false)
  const [renaming,  setRenaming]  = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const menuRef  = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeProject = projects.find(p => p.id === activeProjectId)

  useEffect(() => {
    const init = async () => {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) setUserEmail(user.email ?? '')

      await loadProjects()
      const { projects: loaded } = useProjectsStore.getState()

      if (loaded.length === 0) {
        const id = await createProject('Meu Projeto')
        if (id) useProjectsStore.getState().activeProjectId
        return
      }

      const first = loaded[0]
      const topology = await selectProject(first.id)
      if (topology) applyTopology(topology)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on topology change (debounced 3s)
  useEffect(() => {
    if (!activeProjectId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveProject({ nodes, edges, deviceSnapshots, deviceCounters })
    }, 3000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [nodes, edges, deviceSnapshots]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function applyTopology(topology: ReturnType<typeof useProjectsStore.getState>['projects'][0]['topology']) {
    // Clear engine
    const { nodes: curNodes } = useNetworkStore.getState()
    for (const n of curNodes) engine.remove(n.data.deviceId)

    const ns = (topology.nodes ?? []) as Node<DeviceNodeData>[]
    const es = (topology.edges ?? []) as Edge[]
    const snaps = (topology.deviceSnapshots ?? {}) as Record<string, DeviceSnapshot>
    const counters = topology.deviceCounters ?? { router: 0, switch: 0, pc: 0, server: 0 }

    restoreEngine(snaps, ns, es)
    useNetworkStore.setState({
      nodes: ns,
      edges: es,
      deviceSnapshots: snaps,
      deviceCounters: counters,
      selectedNodeId: null,
      packetLog: [],
      edgeActivity: {},
    })
  }

  const handleSelect = async (id: string) => {
    setOpen(false)
    if (id === activeProjectId) return
    const topology = await selectProject(id)
    if (topology) applyTopology(topology)
  }

  const handleNew = async () => {
    setOpen(false)
    const id = await createProject()
    if (id) {
      const topology = await selectProject(id)
      if (topology) applyTopology(topology)
    }
  }

  const handleRename = async (id: string) => {
    if (!renameVal.trim()) { setRenaming(null); return }
    await renameProject(id, renameVal.trim())
    setRenaming(null)
  }

  const handleDelete = async (id: string) => {
    if (projects.length === 1) return
    await deleteProject(id)
    const { activeProjectId: newActive, projects: remaining } = useProjectsStore.getState()
    if (newActive) {
      const topology = await selectProject(newActive)
      if (topology) applyTopology(topology)
    }
  }

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleManualSave = () => {
    saveProject({ nodes, edges, deviceSnapshots, deviceCounters })
  }

  return (
    <div className="proj-root" ref={menuRef}>
      {/* Save status */}
      {saving ? (
        <span className="proj-saving">salvando…</span>
      ) : lastSaved ? (
        <span className="proj-saved">salvo</span>
      ) : null}

      {/* Manual save */}
      <button type="button" className="proj-save-btn" onClick={handleManualSave} title="Salvar agora">
        <Save className="w-3.5 h-3.5" />
      </button>

      {/* Project selector trigger */}
      <button type="button" className="proj-trigger" onClick={() => setOpen(o => !o)}>
        <span className="proj-name">{activeProject?.name ?? 'Projeto'}</span>
        <ChevronDown className={`w-3 h-3 proj-chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className="proj-menu">
          {/* Project list */}
          <div className="proj-menu-section">
            {projects.map(p => (
              <div key={p.id} className={`proj-item${p.id === activeProjectId ? ' active' : ''}`}>
                {renaming === p.id ? (
                  <input
                    autoFocus className="proj-rename-input"
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setRenaming(null) }}
                    onBlur={() => handleRename(p.id)}
                  />
                ) : (
                  <button className="proj-item-name" onClick={() => handleSelect(p.id)}>
                    {p.id === activeProjectId && <Check className="w-3 h-3 flex-shrink-0 text-[var(--noc-cyan)]" />}
                    <span className="truncate">{p.name}</span>
                  </button>
                )}
                <div className="proj-item-actions">
                  <button type="button" onClick={() => { setRenaming(p.id); setRenameVal(p.name) }} title="Renomear">
                    <Pencil className="w-3 h-3" />
                  </button>
                  {projects.length > 1 && (
                    <button type="button" onClick={() => handleDelete(p.id)} title="Excluir" className="text-[var(--noc-red)]">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="proj-menu-divider" />

          {/* Actions */}
          <button type="button" className="proj-menu-action" onClick={handleNew}>
            <Plus className="w-3.5 h-3.5" />Novo projeto
          </button>

          <div className="proj-menu-divider" />

          <div className="proj-user">
            <span className="proj-user-email">{userEmail}</span>
            <button type="button" className="proj-logout-btn" onClick={handleLogout} title="Sair">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
