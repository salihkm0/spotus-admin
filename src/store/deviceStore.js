import { create } from 'zustand'

export const useDeviceStore = create((set, get) => ({
  devices: [],
  selectedDevice: null,
  loading: false,
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    warning: 0,
    offline: 0
  },
  
  // Actions
  setDevices: (devices) => set({ devices }),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setLoading: (loading) => set({ loading }),
  setStats: (stats) => set({ stats }),
  
  addDevice: (device) => {
    const { devices } = get()
    set({ devices: [...devices, device] })
  },
  
  updateDevice: (deviceId, updates) => {
    const { devices } = get()
    set({
      devices: devices.map(device =>
        device._id === deviceId ? { ...device, ...updates } : device
      )
    })
  },
  
  deleteDevice: (deviceId) => {
    const { devices } = get()
    set({
      devices: devices.filter(device => device._id !== deviceId)
    })
  },
  
  bulkUpdateDevices: (deviceIds, updates) => {
    const { devices } = get()
    set({
      devices: devices.map(device =>
        deviceIds.includes(device._id) ? { ...device, ...updates } : device
      )
    })
  }
}))