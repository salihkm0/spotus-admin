import React, { useState } from 'react'
import { Upload, Download, RefreshCw, Wifi, Power } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Button from '../UI/Button'
import Modal from '../UI/Modal'
import { deviceService } from '../../services/deviceService'
import toast from 'react-hot-toast'

const BulkOperations = ({ selectedDevices, onComplete }) => {
  const [showModal, setShowModal] = useState(false)
  const [operation, setOperation] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const operations = [
    {
      id: 'reboot',
      name: 'Reboot Devices',
      description: 'Restart selected devices',
      icon: Power,
      color: 'yellow'
    },
    {
      id: 'update_wifi',
      name: 'Update WiFi',
      description: 'Change WiFi settings on selected devices',
      icon: Wifi,
      color: 'blue'
    },
    {
      id: 'sync',
      name: 'Sync Videos',
      description: 'Force video synchronization',
      icon: RefreshCw,
      color: 'green'
    },
    {
      id: 'export',
      name: 'Export Data',
      description: 'Export device information',
      icon: Download,
      color: 'gray'
    },
    {
      id: 'import',
      name: 'Import Data',
      description: 'Import device configurations',
      icon: Upload,
      color: 'purple'
    }
  ]

  const handleOperationSelect = (op) => {
    setOperation(op)
    setShowModal(true)
  }

  const handleBulkAction = async (data) => {
    if (!selectedDevices.length) {
      toast.error('Please select devices first')
      return
    }

    try {
      setLoading(true)
      
      switch (operation) {
        case 'reboot':
          await deviceService.sendBulkCommand({
            device_ids: selectedDevices,
            command: 'sudo reboot'
          })
          toast.success(`Reboot command sent to ${selectedDevices.length} devices`)
          break
        
        case 'update_wifi':
          await deviceService.sendBulkCommand({
            device_ids: selectedDevices,
            command: 'update_wifi',
            payload: {
              wifi_ssid: data.wifi_ssid,
              wifi_password: data.wifi_password
            }
          })
          toast.success(`WiFi updated for ${selectedDevices.length} devices`)
          break
        
        case 'sync':
          await deviceService.sendBulkCommand({
            device_ids: selectedDevices,
            command: 'sync_videos'
          })
          toast.success(`Sync command sent to ${selectedDevices.length} devices`)
          break
        
        default:
          break
      }
      
      setShowModal(false)
      reset()
      onComplete?.()
    } catch (error) {
      toast.error(`Failed to perform ${operation} operation`)
      console.error('Bulk operation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOperationForm = () => {
    switch (operation) {
      case 'update_wifi':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="wifi_ssid" className="block text-sm font-medium text-gray-700">
                WiFi SSID *
              </label>
              <input
                type="text"
                id="wifi_ssid"
                {...register('wifi_ssid', { required: 'SSID is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="wifi_password" className="block text-sm font-medium text-gray-700">
                WiFi Password *
              </label>
              <input
                type="password"
                id="wifi_password"
                {...register('wifi_password', { required: 'Password is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        )
      
      case 'reboot':
      case 'sync':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Power className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Confirm {operation === 'reboot' ? 'Reboot' : 'Sync'}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This will {operation === 'reboot' ? 'reboot' : 'sync'} {selectedDevices.length} device(s). 
                    {operation === 'reboot' && ' Devices will be temporarily unavailable.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {operations.map((op) => {
          const Icon = op.icon
          return (
            <Button
              key={op.id}
              variant="outline"
              onClick={() => handleOperationSelect(op.id)}
              disabled={!selectedDevices.length && !['export', 'import'].includes(op.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{op.name}</span>
              {selectedDevices.length > 0 && !['export', 'import'].includes(op.id) && (
                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                  {selectedDevices.length}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          reset()
        }}
        title={operations.find(op => op.id === operation)?.name || 'Bulk Operation'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleBulkAction)} className="space-y-6">
          {renderOperationForm()}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Devices</h4>
            <p className="text-sm text-gray-600">
              This operation will affect {selectedDevices.length} device(s)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedDevices.length}
            >
              Execute Operation
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default BulkOperations