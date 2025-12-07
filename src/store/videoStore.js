import { create } from 'zustand'

export const useVideoStore = create((set, get) => ({
  videos: [],
  brands: [],
  loading: false,
  uploadProgress: 0,
  
  // Actions
  setVideos: (videos) => set({ videos }),
  setBrands: (brands) => set({ brands }),
  setLoading: (loading) => set({ loading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  addVideo: (video) => {
    const { videos } = get()
    set({ videos: [video, ...videos] })
  },
  
  updateVideo: (videoId, updates) => {
    const { videos } = get()
    set({
      videos: videos.map(video =>
        video._id === videoId ? { ...video, ...updates } : video
      )
    })
  },
  
  deleteVideo: (videoId) => {
    const { videos } = get()
    set({
      videos: videos.filter(video => video._id !== videoId)
    })
  },
  
  addBrand: (brand) => {
    const { brands } = get()
    set({ brands: [...brands, brand] })
  },
  
  updateBrand: (brandId, updates) => {
    const { brands } = get()
    set({
      brands: brands.map(brand =>
        brand._id === brandId ? { ...brand, ...updates } : brand
      )
    })
  },
  
  deleteBrand: (brandId) => {
    const { brands } = get()
    set({
      brands: brands.filter(brand => brand._id !== brandId)
    })
  }
}))