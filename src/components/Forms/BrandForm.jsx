// components/Forms/BrandForm.jsx
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, X, Building2, Mail, Phone, MapPin, FileText } from 'lucide-react'
import Button from '../../components/UI/Button'
import { cn } from '../../utils/cn'

const BrandForm = ({ brand, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: brand || {}
  })
  
  const [logoPreview, setLogoPreview] = useState(brand?.logo || null)
  const [logoFile, setLogoFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // Handle logo preview for existing brand
  useEffect(() => {
    if (brand?.logo && !logoFile) {
      setLogoPreview(brand.logo)
    }
  }, [brand, logoFile])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleLogoFile(file)
      } else {
        alert('Please select an image file (PNG, JPG, JPEG, SVG)')
      }
    }
  }

  const handleLogoFile = (file) => {
    setLogoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleLogoFile(file)
    }
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    
    // Append all form fields
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key])
      }
    })
    
    // Append logo file if it exists
    if (logoFile instanceof File) {
      formData.append('logo', logoFile)
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Logo Upload Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Brand Logo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your brand logo (Optional)
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {logoPreview ? (
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                <img
                  src={logoPreview}
                  alt="Brand logo preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                    `
                  }}
                />
              </div>
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={cn(
                "w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                isDragging
                  ? "border-primary-500 bg-primary-50 scale-105"
                  : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('logo-upload').click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center px-2">
                Click or drag & drop
              </p>
            </div>
          )}
          
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          
          {!logoPreview && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Recommended: 400x400px PNG, JPG or SVG
            </p>
          )}
        </div>
      </div>

      {/* Brand Information Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Brand Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in your brand details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Brand name is required' })}
                className={`block w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
                placeholder="Enter brand name"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                {...register('phone', { 
                  required: 'Phone number is required',
                })}
                className={`block w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200 placeholder:text-gray-400"
              placeholder="contact@brand.com"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="address"
              {...register('address', { required: 'Address is required' })}
              className={`block w-full pl-10 pr-4 py-3 rounded-lg border ${
                errors.address 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
          {errors.address && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-200 placeholder:text-gray-400 resize-none"
              placeholder="Tell us about your brand, products, or services..."
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Optional: Add a brief description of your brand
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2.5"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={loading}
          className="px-6 py-2.5"
        >
          {brand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  )
}

export default BrandForm