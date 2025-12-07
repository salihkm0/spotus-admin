import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { videoService } from '../../services/videoService'
import { useVideoStore } from '../../store/videoStore'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import DataTable from '../../components/UI/DataTable'
import VideoUploadForm from '../../components/Forms/VideoUploadForm'

const VideoList = () => {
  const { videos, brands, setVideos, setBrands, addVideo, updateVideo, deleteVideo } = useVideoStore()
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    fetchVideos()
    fetchBrands()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getAllVideos()
      setVideos(response.videos || [])
    } catch (error) {
      toast.error('Failed to fetch videos')
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await videoService.getAllBrands()
      setBrands(response.brands || [])
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleUploadVideo = async (formData) => {
    try {
      setUploadLoading(true)
      const response = await videoService.uploadVideo(formData)
      addVideo(response.video)
      setShowUploadModal(false)
      toast.success('Video uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload video')
      console.error('Error uploading video:', error)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleUpdateVideo = async (formData) => {
    try {
      setUploadLoading(true)
      const response = await videoService.updateVideo(editingVideo._id, formData)
      updateVideo(editingVideo._id, response.video)
      setShowUploadModal(false)
      setEditingVideo(null)
      toast.success('Video updated successfully')
    } catch (error) {
      toast.error('Failed to update video')
      console.error('Error updating video:', error)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await videoService.deleteVideo(videoId)
      deleteVideo(videoId)
      toast.success('Video deleted successfully')
    } catch (error) {
      toast.error('Failed to delete video')
      console.error('Error deleting video:', error)
    }
  }

  const handlePlayVideo = (videoUrl) => {
    window.open(videoUrl, '_blank')
  }

  const handleEditVideo = (video) => {
    setEditingVideo(video)
    setShowUploadModal(true)
  }

  const handleCloseModal = () => {
    setShowUploadModal(false)
    setEditingVideo(null)
  }

  const columns = [
    {
      key: 'filename',
      header: 'Video',
      render: (video) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{video.filename}</div>
            <div className="text-sm text-gray-500">
              {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (video) => {
        const brand = brands.find(b => b._id === video.brand)
        return brand ? brand.name : 'Unknown'
      }
    },
    {
      key: 'description',
      header: 'Description',
      render: (video) => video.description || 'No description'
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      render: (video) => {
        if (!video.expiryDate) return 'Never'
        const isExpired = new Date(video.expiryDate) < new Date()
        return (
          <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
            {new Date(video.expiryDate).toLocaleDateString()}
          </span>
        )
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (video) => {
        const isExpired = video.expiryDate && new Date(video.expiryDate) < new Date()
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isExpired 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isExpired ? 'Expired' : 'Active'}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (video) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePlayVideo(video.fileUrl)}
            className="text-primary-600 hover:text-primary-900 transition-colors"
            title="Play"
          >
            <Play className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleEditVideo(video)}
            className="text-yellow-600 hover:text-yellow-900 transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleDeleteVideo(video._id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your advertising videos and content
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVideo(null)
            setShowUploadModal(true)
          }}
          icon={Plus}
        >
          Upload Video
        </Button>
      </div>

      {/* Videos Table */}
      <DataTable
        columns={columns}
        data={videos}
        loading={loading}
        emptyMessage="No videos found. Upload your first video to get started."
      />

      {/* Upload/Edit Video Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        title={editingVideo ? 'Edit Video' : 'Upload New Video'}
        size="xl"
      >
        <VideoUploadForm
          onSubmit={editingVideo ? handleUpdateVideo : handleUploadVideo}
          loading={uploadLoading}
          brands={brands}
          initialData={editingVideo}
        />
      </Modal>
    </div>
  )
}

export default VideoList