import api from './api'

export const videoService = {
  // Video Management
  getAllVideos: async () => {
    const response = await api.get('/videos')
    return response.data
  },

  getActiveVideos: async () => {
    const response = await api.get('/videos/active')
    return response.data
  },

  getVideosByBrand: async (brandId) => {
    const response = await api.get(`/videos/brand/${brandId}`)
    return response.data
  },

  uploadVideo: async (formData) => {
    const response = await api.post('/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        console.log(`Upload Progress: ${progress}%`)
      }
    })
    return response.data
  },

  updateVideo: async (videoId, videoData) => {
    // Check if videoData is FormData or regular object
    if (videoData instanceof FormData) {
      const response = await api.put(`/edit/${videoId}`, videoData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      // For JSON data (metadata updates without file)
      const response = await api.put(`/edit/${videoId}`, videoData)
      return response.data
    }
  },

  deleteVideo: async (id) => {
    const response = await api.delete(`/delete-video/${id}`)
    return response.data
  },

  // Brand Management
  getAllBrands: async () => {
    const response = await api.get('/brands')
    return response.data
  },

  getBrand: async (id) => {
    const response = await api.get(`/brands/${id}`)
    return response.data
  },
  
  createBrand: async (formData) => {
    // Make sure required fields are present
    const requiredFields = ['name', 'phone', 'address']
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        throw new Error(`${field} is required`)
      }
    }
    
    const response = await api.post('/brands', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    })
    return response.data
  },

  updateBrand: async (id, formData) => {
    const response = await api.put(`/brands/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    })
    return response.data
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`/brands/${id}`)
    return response.data
  }
}