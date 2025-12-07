import api from './api'

export const deviceService = {
  // Device Management
  getAllDevices: async () => {
    const response = await api.get('/rpi')
    return response.data
  },

  getDevice: async (id) => {
    const response = await api.get(`/rpi/${id}`)
    return response.data
  },

  createDevice: async (deviceData) => {
    const response = await api.post('/rpi', deviceData)
    return response.data
  },

  updateDevice: async (id, deviceData) => {
    const response = await api.put(`/rpi/${id}`, deviceData)
    return response.data
  },

  deleteDevice: async (id) => {
    const response = await api.delete(`/rpi/${id}`)
    return response.data
  },

  updateDeviceStatus: async (id, status) => {
    const response = await api.put(`/rpi/status/${id}`, { rpi_status: status })
    return response.data
  },

  getWifiDetails: async (rpiId) => {
    const response = await api.get(`/rpi/get-wifi/${rpiId}`)
    return response.data
  },

  // Device Health
  getDeviceHealth: async (deviceId) => {
    const response = await api.get(`/devices/health/${deviceId}`)
    return response.data
  },

  getAllDevicesHealth: async (params = {}) => {
    const response = await api.get('/devices/health', { params })
    return response.data
  },

  // Bulk Operations
  bulkUpdateDevices: async (updates) => {
    const response = await api.post('/rpi/bulk', { updates })
    return response.data
  },

  bulkDeleteDevices: async (ids) => {
    const response = await api.delete('/rpi/bulk', { data: { ids } })
    return response.data
  },

  sendBulkCommand: async (commandData) => {
    const response = await api.post('/devices/command', commandData)
    return response.data
  },

  // Statistics
  getDeviceStats: async () => {
    const response = await api.get('/rpi/stats')
    return response.data
  }
}