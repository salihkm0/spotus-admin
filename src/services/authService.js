import api from './api'

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key])
      }
    })
    
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (userId, userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key])
      }
    })
    
    const response = await api.put(`/auth/edit/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // NEW: Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // NEW: Reset Password
  resetPassword: async (token, passwordData) => {
    const response = await api.post(`/auth/reset-password/${token}`, passwordData)
    return response.data
  },

  // NEW: Change Password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  },

  // NEW: Deactivate Account
  deactivateAccount: async () => {
    const response = await api.put('/auth/deactivate')
    return response.data
  },

  // NEW: Get All Users (Admin only)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/auth/users', { params })
    return response.data
  },

  // NEW: Get User Stats (Admin only)
  getUserStats: async () => {
    const response = await api.get('/auth/stats')
    return response.data
  },

  // NEW: Activate User (Admin only)
  activateUser: async (userId) => {
    const response = await api.put(`/auth/activate/${userId}`)
    return response.data
  },

  // NEW: Delete User (Admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/auth/delete/${userId}`)
    return response.data
  }
}