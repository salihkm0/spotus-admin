import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Activity, Wifi, Monitor, Cpu, HardDrive } from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import { useDeviceStore } from '../../store/deviceStore'
import Button from '../../components/UI/Button'
import toast from 'react-hot-toast'

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    active: { color: 'green', label: 'Online' },
    in_active: { color: 'red', label: 'Offline' },
    warning: { color: 'yellow', label: 'Warning' },
    maintenance: { color: 'blue', label: 'Maintenance' }
  }
  
  const config = statusConfig[status] || statusConfig.in_active
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <div className={`w-2 h-2 rounded-full bg-${config.color}-500 mr-2`}></div>
      {config.label}
    </span>
  )
}

const MetricCard = ({ title, value, icon: Icon, subtitle, color = 'gray' }) => {
  const colors = {
    gray: 'text-gray-600 bg-gray-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50'
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

const DeviceDetails = () => {
  const { id } = useParams()
  const { devices } = useDeviceStore()
  const [device, setDevice] = useState(null)
  const [healthData, setHealthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDeviceDetails()
  }, [id])

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true)
      // First try to get from store
      const storedDevice = devices.find(d => d._id === id)
      if (storedDevice) {
        setDevice(storedDevice)
      }
      
      // Fetch detailed device info
      const deviceRes = await deviceService.getDevice(id)
      setDevice(deviceRes.rpis || deviceRes.data)
      
      // Fetch health data
      const healthRes = await deviceService.getDeviceHealth(deviceRes.rpis?.rpi_id)
      setHealthData(healthRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch device details')
      console.error('Error fetching device details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReboot = async () => {
    if (!confirm('Are you sure you want to reboot this device?')) return
    
    try {
      await deviceService.sendBulkCommand({
        device_ids: [device.rpi_id],
        command: 'reboot'
      })
      toast.success('Reboot command sent to device')
    } catch (error) {
      toast.error('Failed to send reboot command')
    }
  }

  const handleSync = async () => {
    try {
      await deviceService.sendBulkCommand({
        device_ids: [device.rpi_id],
        command: 'sync_videos'
      })
      toast.success('Sync command sent to device')
    } catch (error) {
      toast.error('Failed to send sync command')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Device not found</h3>
        <p className="mt-1 text-sm text-gray-500">The device you're looking for doesn't exist.</p>
        <Link to="/devices" className="mt-6 inline-flex items-center text-primary-600 hover:text-primary-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Link>
      </div>
    )
  }

  const latestHealth = healthData[0]?.metrics || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/devices" className="text-gray-400 hover:text-gray-500">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.rpi_name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <StatusIndicator status={device.rpi_status} />
              <span className="text-sm text-gray-500">ID: {device.rpi_id}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleSync}>
            Sync Now
          </Button>
          <Button variant="outline" onClick={handleReboot}>
            Reboot
          </Button>
          <Link to={`/devices/edit/${device._id}`}>
            <Button>Edit Device</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'health', name: 'Health' },
            { id: 'videos', name: 'Videos' },
            { id: 'settings', name: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="CPU Usage"
                value={latestHealth.cpu_usage ? `${latestHealth.cpu_usage}%` : 'N/A'}
                icon={Cpu}
                color={latestHealth.cpu_usage > 80 ? 'red' : 'green'}
              />
              <MetricCard
                title="Memory Usage"
                value={latestHealth.memory_usage ? `${latestHealth.memory_usage}%` : 'N/A'}
                icon={Activity}
                color={latestHealth.memory_usage > 80 ? 'red' : 'blue'}
              />
              <MetricCard
                title="Disk Usage"
                value={latestHealth.disk_usage || 'N/A'}
                icon={HardDrive}
                color="gray"
              />
              <MetricCard
                title="Temperature"
                value={latestHealth.temperature || 'N/A'}
                icon={Activity}
                color={latestHealth.temperature?.includes('70') ? 'red' : 'green'}
              />
            </div>

            {/* Device Information */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Device Information</h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Device Name</dt>
                      <dd className="text-sm text-gray-900">{device.rpi_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Device ID</dt>
                      <dd className="text-sm text-gray-900">{device.rpi_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-sm text-gray-900">{device.location || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vehicle No</dt>
                      <dd className="text-sm text-gray-900">{device.vehicle_no || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Owner</dt>
                      <dd className="text-sm text-gray-900">{device.owner_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact</dt>
                      <dd className="text-sm text-gray-900">{device.owner_phone}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Last Seen</dt>
                      <dd className="text-sm text-gray-900">
                        {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">System Information</h3>
                </div>
                <div className="p-6">
                  {device.device_info ? (
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                        <dd className="text-sm text-gray-900">{device.device_info.model || 'Unknown'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">OS</dt>
                        <dd className="text-sm text-gray-900">{device.device_info.os || 'Unknown'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Architecture</dt>
                        <dd className="text-sm text-gray-900">{device.device_info.architecture || 'Unknown'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Cores</dt>
                        <dd className="text-sm text-gray-900">{device.device_info.cores || 'Unknown'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Memory</dt>
                        <dd className="text-sm text-gray-900">{device.device_info.total_memory || 'Unknown'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-500">No system information available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Health History</h3>
            </div>
            <div className="p-6">
              {healthData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Memory
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Temperature
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {healthData.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.metrics.cpu_usage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.metrics.memory_usage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.metrics.disk_usage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.metrics.temperature}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No health data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Installed Videos</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500">
                Video management for this device. This would show which videos are currently installed and their status.
              </p>
              {/* Video list would be implemented here */}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Device Configuration</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">WiFi Settings</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SSID</label>
                      <p className="mt-1 text-sm text-gray-900">{device.wifi_ssid || 'Not configured'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <p className="mt-1 text-sm text-gray-900">••••••••</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Playback Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto Play</label>
                        <p className="text-sm text-gray-500">Automatically start playback on boot</p>
                      </div>
                      <span className="text-sm text-gray-900">
                        {device.config?.autoplay ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Shuffle</label>
                        <p className="text-sm text-gray-500">Play videos in random order</p>
                      </div>
                      <span className="text-sm text-gray-900">
                        {device.config?.shuffle ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceDetails