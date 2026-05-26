'use client'
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Node, Edge } from '@xyflow/react'

export interface ProjectTopology {
  nodes: Node[]
  edges: Edge[]
  deviceSnapshots: Record<string, unknown>
  deviceCounters: Record<string, number>
}

export interface Project {
  id: string
  name: string
  topology: ProjectTopology
  created_at: string
  updated_at: string
}

interface ProjectsStore {
  projects:        Project[]
  activeProjectId: string | null
  saving:          boolean
  lastSaved:       Date | null

  loadProjects:   () => Promise<void>
  createProject:  (name?: string) => Promise<string>
  selectProject:  (id: string) => Promise<ProjectTopology | null>
  saveProject:    (topology: ProjectTopology) => Promise<void>
  renameProject:  (id: string, name: string) => Promise<void>
  deleteProject:  (id: string) => Promise<void>
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  projects:        [],
  activeProjectId: null,
  saving:          false,
  lastSaved:       null,

  async loadProjects() {
    const sb = createClient()
    const { data, error } = await sb
      .from('projects')
      .select('id, name, topology, created_at, updated_at')
      .order('updated_at', { ascending: false })
    if (!error && data) set({ projects: data as Project[] })
  },

  async createProject(name = 'Novo Projeto') {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return ''
    const empty: ProjectTopology = {
      nodes: [], edges: [],
      deviceSnapshots: {},
      deviceCounters: { router: 0, switch: 0, pc: 0, server: 0 },
    }
    const { data, error } = await sb
      .from('projects')
      .insert({ user_id: user.id, name, topology: empty })
      .select()
      .single()
    if (error || !data) return ''
    set(s => ({
      projects: [data as Project, ...s.projects],
      activeProjectId: data.id,
    }))
    return data.id
  },

  async selectProject(id) {
    const sb = createClient()
    const { data, error } = await sb
      .from('projects')
      .select('topology')
      .eq('id', id)
      .single()
    if (error || !data) return null
    set({ activeProjectId: id })
    return data.topology as ProjectTopology
  },

  async saveProject(topology) {
    const { activeProjectId } = get()
    if (!activeProjectId) return
    set({ saving: true })
    const sb = createClient()
    await sb
      .from('projects')
      .update({ topology, updated_at: new Date().toISOString() })
      .eq('id', activeProjectId)
    set(s => ({
      saving: false,
      lastSaved: new Date(),
      projects: s.projects.map(p =>
        p.id === activeProjectId ? { ...p, topology, updated_at: new Date().toISOString() } : p
      ),
    }))
  },

  async renameProject(id, name) {
    const sb = createClient()
    await sb.from('projects').update({ name }).eq('id', id)
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, name } : p),
    }))
  },

  async deleteProject(id) {
    const sb = createClient()
    await sb.from('projects').delete().eq('id', id)
    set(s => {
      const projects = s.projects.filter(p => p.id !== id)
      return {
        projects,
        activeProjectId: s.activeProjectId === id
          ? (projects[0]?.id ?? null)
          : s.activeProjectId,
      }
    })
  },
}))
