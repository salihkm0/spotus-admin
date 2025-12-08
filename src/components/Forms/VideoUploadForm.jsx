import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import Button from '../UI/Button'
import { cn } from '../../utils/cn'

const VideoUploadForm = ({ onSubmit, loading, brands, initialData }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {}
  })
  
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoUrl, setVideoUrl] = useState(null)
  const [videoThumbnail, setVideoThumbnail] = useState(null)

  const selectedFile = watch('file')
  const brandId = watch('brand')

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.url) {
        setVideoUrl(initialData.url)
      }
    }
  }, [initialData, reset])

  // Handle video file selection
  useEffect(() => {
    if (selectedFile && selectedFile instanceof File) {
      const url = URL.createObjectURL(selectedFile)
      setVideoUrl(url)
      
      // Generate thumbnail from video
      generateThumbnail(selectedFile)
      
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const generateThumbnail = (file) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const url = URL.createObjectURL(file)
    
    video.src = url
    video.currentTime = 1 // Capture at 1 second
    
    video.onloadeddata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const thumbnailUrl = URL.createObjectURL(blob)
        setVideoThumbnail(thumbnailUrl)
      })
      
      URL.revokeObjectURL(url)
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setValue('file', acceptedFiles[0])
    }
  }, [setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB
  })

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      setVolume(isMuted ? 1 : 0)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const removeFile = () => {
    setValue('file', null)
    setVideoUrl(null)
    setVideoThumbnail(null)
    setIsPlaying(false)
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    
    // Only append file if it's a new file (not from initialData)
    if (data.file && data.file instanceof File) {
      formData.append('file', data.file)
    }
    
    formData.append('filename', data.filename)
    formData.append('description', data.description || '')
    formData.append('brand', data.brand)
    
    if (data.expiryDate) {
      formData.append('expiryDate', data.expiryDate)
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Video Preview & Upload Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Video Upload & Preview</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your video file and preview it before submission
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Video Preview
            </label>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden group">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-auto max-h-[400px] rounded-lg"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    poster={videoThumbnail}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
                      />
                      <div className="flex justify-between text-xs text-gray-300 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-white" />
                          )}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="p-1 text-gray-300 hover:text-white transition-colors"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
                  <div className="text-center">
                    <Play className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-300 font-medium">No video selected</p>
                    <p className="text-gray-400 text-sm mt-1">Upload a video to preview</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Info */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">File Name:</span>
                  <span className="text-sm text-gray-900 truncate ml-2">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">File Size:</span>
                  <span className="text-sm text-gray-900">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="text-sm text-gray-900">{selectedFile.type}</span>
                </div>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Video {!initialData && <span className="text-red-500">*</span>}
              </label>
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                      ? "border-primary-500 bg-primary-50 scale-[1.02]"
                      : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-14 w-14 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900">
                      Drop video file here
                    </p>
                    <p className="text-sm text-gray-600">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-500 mt-4">
                      Supports: MP4, AVI, MOV, MKV, WEBM
                    </p>
                    <p className="text-xs text-gray-500">
                      Maximum size: 500MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 bg-primary-100 p-2 rounded-lg">
                        <Play className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.querySelector('input[type="file"]').click()}
                      className="w-full"
                    >
                      Replace Video
                    </Button>
                  </div>
                </div>
              )}
              {errors.file && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.file.message}
                </p>
              )}
              {initialData && !selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Current Video</p>
                  <p className="text-sm text-blue-600 mt-1">{initialData.filename}</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {(initialData.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Filename Input */}
            <div>
              <label htmlFor="filename" className="block text-sm font-semibold text-gray-700 mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="filename"
                {...register('filename', { required: 'Video title is required' })}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200 placeholder:text-gray-400"
                placeholder="Enter video title"
              />
              {errors.filename && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.filename.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Details Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Video Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Selection */}
          <div>
            <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              id="brand"
              {...register('brand', { required: 'Brand selection is required' })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200 bg-white"
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {errors.brand && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.brand.message}
              </p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="expiryDate"
                {...register('expiryDate')}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Set when this video should expire
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200 placeholder:text-gray-400"
            placeholder="Describe your video content, purpose, or any important details..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional: Add a description to help identify this video
          </p>
        </div>
      </div>

      {/* Submit Section */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!initialData && (!selectedFile || !brandId)}
          className="px-8 py-3"
        >
          {initialData ? 'Update Video' : 'Upload Video'}
        </Button>
      </div>
    </form>
  )
}

export default VideoUploadForm