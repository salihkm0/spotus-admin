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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="rpi_id" className="block text-sm font-medium text-gray-700">
            Device ID *
          </label>
          <input
            type="text"
            id="rpi_id"
            {...register('rpi_id', { required: 'Device ID is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter unique device ID"
          />
          {errors.rpi_id && (
            <p className="mt-1 text-sm text-red-600">{errors.rpi_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="rpi_name" className="block text-sm font-medium text-gray-700">
            Device Name *
          </label>
          <input
            type="text"
            id="rpi_name"
            {...register('rpi_name', { required: 'Device name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter device name"
          />
          {errors.rpi_name && (
            <p className="mt-1 text-sm text-red-600">{errors.rpi_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="vehicle_no" className="block text-sm font-medium text-gray-700">
            Vehicle Number *
          </label>
          <input
            type="text"
            id="vehicle_no"
            {...register('vehicle_no', { required: 'Vehicle number is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter vehicle number"
          />
          {errors.vehicle_no && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle_no.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <input
            type="text"
            id="location"
            {...register('location', { required: 'Location is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700">
            Owner Name *
          </label>
          <input
            type="text"
            id="owner_name"
            {...register('owner_name', { required: 'Owner name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter owner name"
          />
          {errors.owner_name && (
            <p className="mt-1 text-sm text-red-600">{errors.owner_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="owner_phone" className="block text-sm font-medium text-gray-700">
            Owner Phone *
          </label>
          <input
            type="tel"
            id="owner_phone"
            {...register('owner_phone', { required: 'Owner phone is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter owner phone number"
          />
          {errors.owner_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.owner_phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="wifi_ssid" className="block text-sm font-medium text-gray-700">
            WiFi SSID
          </label>
          <input
            type="text"
            id="wifi_ssid"
            {...register('wifi_ssid')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter WiFi SSID"
          />
        </div>

        <div>
          <label htmlFor="wifi_password" className="block text-sm font-medium text-gray-700">
            WiFi Password
          </label>
          <input
            type="password"
            id="wifi_password"
            {...register('wifi_password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter WiFi password"
          />
        </div>
      </div>

      <div>
        <label htmlFor="display" className="block text-sm font-medium text-gray-700">
          Display Configuration
        </label>
        <textarea
          id="display"
          rows={3}
          {...register('display')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          placeholder='Enter display configuration as JSON (e.g., [{"name": "HDMI-1", "resolution": "1920x1080"}])'
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional: Add display configuration in JSON format
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {device ? 'Update Device' : 'Create Device'}
        </Button>
      </div>
    </form>
  )
}

export default DeviceForm