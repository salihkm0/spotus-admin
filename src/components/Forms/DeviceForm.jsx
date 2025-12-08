import React from 'react'
import { useForm } from 'react-hook-form'
import Button from '../UI/Button'

const DeviceForm = ({ device, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: device || {
      rpi_status: 'in_active'
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Required Fields Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Device Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Fields marked with * are required
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="rpi_id" className="block text-sm font-semibold text-gray-700">
              Device ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="rpi_id"
              {...register('rpi_id', { required: 'Device ID is required' })}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.rpi_id 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="DEV-001"
            />
            {errors.rpi_id && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.rpi_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="rpi_name" className="block text-sm font-semibold text-gray-700">
              Device Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="rpi_name"
              {...register('rpi_name', { required: 'Device name is required' })}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.rpi_name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="Main Display Device"
            />
            {errors.rpi_name && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.rpi_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="vehicle_no" className="block text-sm font-semibold text-gray-700">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="vehicle_no"
              {...register('vehicle_no', { required: 'Vehicle number is required' })}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.vehicle_no 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="AB12CD1234"
            />
            {errors.vehicle_no && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.vehicle_no.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              {...register('location', { required: 'Location is required' })}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.location 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="City, State"
            />
            {errors.location && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.location.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Owner Information Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Owner Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="owner_name" className="block text-sm font-semibold text-gray-700">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="owner_name"
              {...register('owner_name', { required: 'Owner name is required' })}
              className={`block w-full px-4 py-3 rounded-lg border ${
                errors.owner_name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
              placeholder="John Doe"
            />
            {errors.owner_name && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.owner_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="owner_phone" className="block text-sm font-semibold text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">+1</span>
              </div>
              <input
                type="tel"
                id="owner_phone"
                {...register('owner_phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className={`block w-full pl-10 pr-4 py-3 rounded-lg border ${
                  errors.owner_phone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                } shadow-sm transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400`}
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.owner_phone && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.owner_phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* WiFi Configuration Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">WiFi Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Optional: Configure WiFi settings for the device
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="wifi_ssid" className="block text-sm font-medium text-gray-700">
              WiFi SSID
            </label>
            <input
              type="text"
              id="wifi_ssid"
              {...register('wifi_ssid')}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400"
              placeholder="MyWiFiNetwork"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="wifi_password" className="block text-sm font-medium text-gray-700">
              WiFi Password
            </label>
            <input
              type="password"
              id="wifi_password"
              {...register('wifi_password')}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {/* Display Configuration Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Display Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Optional: Configure display settings in JSON format
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="display" className="block text-sm font-medium text-gray-700">
            Display Settings
          </label>
          <div className="relative">
            <textarea
              id="display"
              rows={4}
              {...register('display')}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition duration-200 focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400 font-mono text-sm"
              placeholder='[{"name": "HDMI-1", "resolution": "1920x1080", "orientation": "landscape"}]'
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-start pt-3">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                JSON
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Example: <code className="text-xs bg-gray-100 px-2 py-1 rounded">{"{\"name\": \"HDMI-1\", \"resolution\": \"1920x1080\"}"}</code>
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
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={loading}
          className="px-6 py-2.5"
        >
          {device ? 'Update Device' : 'Create Device'}
        </Button>
      </div>
    </form>
  )
}

export default DeviceForm