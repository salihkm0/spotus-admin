import React, { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Play } from 'lucide-react'
import Button from '../UI/Button'
import { cn } from '../../utils/cn'

const VideoUploadForm = ({ onSubmit, loading, brands, initialData }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {}
  })
  
  const selectedFile = watch('file')
  const brandId = watch('brand')

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setValue('file', acceptedFiles[0])
    }
  }, [setValue])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB
  })

  const removeFile = () => {
    setValue('file', null)
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video File {!initialData && '*'}
        </label>
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">
                Drop your video file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MP4, AVI, MOV, MKV up to 500MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Play className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'File selected'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
        )}
        {initialData && !selectedFile && (
          <p className="mt-2 text-sm text-blue-600">
            Current file: {initialData.filename} ({(initialData.fileSize / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Filename */}
      <div>
        <label htmlFor="filename" className="block text-sm font-medium text-gray-700">
          Filename *
        </label>
        <input
          type="text"
          id="filename"
          {...register('filename', { required: 'Filename is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Enter video filename"
        />
        {errors.filename && (
          <p className="mt-1 text-sm text-red-600">{errors.filename.message}</p>
        )}
      </div>

      {/* Brand Selection */}
      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
          Brand *
        </label>
        <select
          id="brand"
          {...register('brand', { required: 'Brand selection is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>
        {errors.brand && (
          <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder="Enter video description"
        />
      </div>

      {/* Expiry Date */}
      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
          Expiry Date
        </label>
        <input
          type="datetime-local"
          id="expiryDate"
          {...register('expiryDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!initialData && (!selectedFile || !brandId)}
        >
          {initialData ? 'Update Video' : 'Upload Video'}
        </Button>
      </div>
    </form>
  )
}

export default VideoUploadForm