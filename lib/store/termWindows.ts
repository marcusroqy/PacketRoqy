import { create } from 'zustand'

export interface TermWinDevice {
  deviceId:   string
  label:      string
  brand?:     string
  deviceType: string
}

export interface TermWinDef {
  winId:          string
  devices:        TermWinDevice[]
  activeDeviceId: string
  x:         number
  y:         number
  w:         number
  h:         number
  z:         number
  minimized: boolean
}

let _seq = 0
let _z   = 200

export const DEFAULT_W = 560
export const DEFAULT_H = 460

interface TermWinsStore {
  windows:    TermWinDef[]
  dragOverId: string | null

  openWindow:      (device: TermWinDevice, x: number, y: number) => void
  closeWindow:     (winId: string) => void
  closeDevice:     (winId: string, deviceId: string) => void
  updatePos:       (winId: string, x: number, y: number) => void
  updateGeometry:  (winId: string, x: number, y: number, w: number, h: number) => void
  focusWindow:     (winId: string) => void
  setActiveDevice: (winId: string, deviceId: string) => void
  mergeWindows:    (fromWinId: string, toWinId: string) => void
  setDragOver:     (winId: string | null) => void
}

export const useTermWins = create<TermWinsStore>((set, get) => ({
  windows:    [],
  dragOverId: null,

  openWindow(device, x, y) {
    const existing = get().windows.find(w =>
      w.devices.some(d => d.deviceId === device.deviceId)
    )
    if (existing) {
      set(s => ({
        windows: s.windows.map(w =>
          w.winId === existing.winId
            ? { ...w, z: ++_z, activeDeviceId: device.deviceId, minimized: false }
            : w
        ),
      }))
      return
    }
    set(s => ({
      windows: [...s.windows, {
        winId: `fw${++_seq}`,
        devices: [device],
        activeDeviceId: device.deviceId,
        x, y,
        w: DEFAULT_W,
        h: DEFAULT_H,
        z: ++_z,
        minimized: false,
      }],
    }))
  },

  closeWindow(winId) {
    set(s => ({ windows: s.windows.filter(w => w.winId !== winId) }))
  },

  closeDevice(winId, deviceId) {
    set(s => {
      const win = s.windows.find(w => w.winId === winId)
      if (!win) return {}
      const devices = win.devices.filter(d => d.deviceId !== deviceId)
      if (devices.length === 0)
        return { windows: s.windows.filter(w => w.winId !== winId) }
      let activeDeviceId = win.activeDeviceId
      if (activeDeviceId === deviceId) {
        const idx = win.devices.findIndex(d => d.deviceId === deviceId)
        activeDeviceId = devices[Math.max(0, idx - 1)].deviceId
      }
      return {
        windows: s.windows.map(w =>
          w.winId === winId ? { ...w, devices, activeDeviceId } : w
        ),
      }
    })
  },

  updatePos(winId, x, y) {
    set(s => ({
      windows: s.windows.map(w => w.winId === winId ? { ...w, x, y } : w),
    }))
  },

  updateGeometry(winId, x, y, w, h) {
    set(s => ({
      windows: s.windows.map(win =>
        win.winId === winId ? { ...win, x, y, w, h } : win
      ),
    }))
  },

  focusWindow(winId) {
    set(s => ({
      windows: s.windows.map(w => w.winId === winId ? { ...w, z: ++_z } : w),
    }))
  },

  setActiveDevice(winId, deviceId) {
    set(s => ({
      windows: s.windows.map(w =>
        w.winId === winId ? { ...w, activeDeviceId: deviceId } : w
      ),
    }))
  },

  mergeWindows(fromWinId, toWinId) {
    set(s => {
      const from = s.windows.find(w => w.winId === fromWinId)
      const to   = s.windows.find(w => w.winId === toWinId)
      if (!from || !to) return {}
      const newDevices = from.devices.filter(
        fd => !to.devices.some(td => td.deviceId === fd.deviceId)
      )
      return {
        windows: s.windows
          .filter(w => w.winId !== fromWinId)
          .map(w =>
            w.winId === toWinId
              ? { ...w, devices: [...w.devices, ...newDevices], activeDeviceId: from.activeDeviceId, z: ++_z }
              : w
          ),
      }
    })
  },

  setDragOver(winId) {
    set({ dragOverId: winId })
  },
}))
