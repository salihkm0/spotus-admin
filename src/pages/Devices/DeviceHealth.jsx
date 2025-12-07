import React, { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import { useDeviceStore } from '../../store/deviceStore'
import DataTable from '../../components/UI/DataTable'
import toast from 'react-hot-toast'

const HealthStatus = () => {
  const { devices, setDevices } = useDeviceStore()
  const [healthData, setHealthData] = useState({ devices: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDevices()
    fetchHealthData()
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await deviceService.getAllDevices()
      setDevices(response.rpis || [])
    } catch (error) {
      toast.error('Failed to fetch devices')
      console.error('Error fetching devices:', error)
    }
  }

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await deviceService.getAllDevicesHealth()
      console.log('Health data response:', response) // Debug log
      setHealthData(response)
    } catch (error) {
      toast.error('Failed to fetch health data')
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHealthData()
  }

  const getHealthStatus = (device) => {
    const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
    const health = healthDevice?.latest_health
    
    if (!health) {
      // Check if device is offline
      if (healthDevice?.is_offline) {
        return { status: 'offline', color: 'gray', icon: XCircle }
      }
      return { status: 'unknown', color: 'gray', icon: XCircle }
    }
    
    if (health.cpu_usage > 90 || health.memory_usage > 90) {
      return { status: 'critical', color: 'red', icon: AlertTriangle }
    } else if (health.cpu_usage > 70 || health.memory_usage > 70) {
      return { status: 'warning', color: 'yellow', icon: AlertTriangle }
    } else {
      return { status: 'healthy', color: 'green', icon: CheckCircle }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'green',
      warning: 'yellow',
      critical: 'red',
      offline: 'gray',
      unknown: 'gray'
    }
    return colors[status] || 'gray'
  }

  const columns = [
    {
      key: 'rpi_name',
      header: 'Device',
      render: (device) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{device.rpi_name}</div>
            <div className="text-sm text-gray-500">{device.location}</div>
            <div className="text-xs text-gray-400">{device.rpi_id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Health Status',
      render: (device) => {
        const health = getHealthStatus(device)
        const Icon = health.icon
        const color = getStatusColor(health.status)
        
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800`}>
            <Icon className="mr-1 h-4 w-4" />
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </span>
        )
      }
    },
    {
      key: 'cpu',
      header: 'CPU',
      render: (device) => {
        const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
        const health = healthDevice?.latest_health
        return health?.cpu_usage ? `${Math.round(health.cpu_usage)}%` : 'N/A'
      }
    },
    {
      key: 'memory',
      header: 'Memory',
      render: (device) => {
        const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
        const health = healthDevice?.latest_health
        return health?.memory_usage ? `${Math.round(health.memory_usage)}%` : 'N/A'
      }
    },
    {
      key: 'disk',
      header: 'Disk',
      render: (device) => {
        const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
        const health = healthDevice?.latest_health
        return health?.disk_usage ? `${Math.round(health.disk_usage)}%` : 'N/A'
      }
    },
    {
      key: 'temperature',
      header: 'Temperature',
      render: (device) => {
        const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
        const health = healthDevice?.latest_health
        return health?.temperature ? `${health.temperature}°C` : 'N/A'
      }
    },
    {
      key: 'last_seen',
      header: 'Last Report',
      render: (device) => {
        const healthDevice = healthData.devices?.find(d => d.rpi_id === device.rpi_id)
        return healthDevice?.last_seen_relative || 'Never'
      }
    }
  ]

  const criticalDevices = devices.filter(device => {
    const health = getHealthStatus(device)
    return health.status === 'critical'
  })

  const warningDevices = devices.filter(device => {
    const health = getHealthStatus(device)
    return health.status === 'warning'
  })

  const offlineDevices = devices.filter(device => {
    const health = getHealthStatus(device)
    return health.status === 'offline'
  })

  const healthyDevices = devices.filter(device => {
    const health = getHealthStatus(device)
    return health.status === 'healthy'
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Health</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor the health and performance of your devices
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Healthy</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {healthyDevices.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Warning</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {warningDevices.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Critical</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {criticalDevices.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-gray-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Offline</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {offlineDevices.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      {healthData.stats && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{healthData.stats.total || 0}</div>
              <div className="text-sm text-gray-500">Total Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthData.stats.online || 0}</div>
              <div className="text-sm text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{healthData.stats.offline || 0}</div>
              <div className="text-sm text-gray-500">Offline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{healthData.stats.warning || 0}</div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {(criticalDevices.length > 0 || warningDevices.length > 0 || offlineDevices.length > 0) && (
        <div className="space-y-4">
          {criticalDevices.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Critical Devices ({criticalDevices.length})
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The following devices are experiencing critical issues:</p>
                    <ul className="list-disc list-inside mt-1">
                      {criticalDevices.map(device => (
                        <li key={device._id}>{device.rpi_name} - {device.location}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {warningDevices.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Warning Devices ({warningDevices.length})
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The following devices are experiencing performance issues:</p>
                    <ul className="list-disc list-inside mt-1">
                      {warningDevices.map(device => (
                        <li key={device._id}>{device.rpi_name} - {device.location}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {offlineDevices.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    Offline Devices ({offlineDevices.length})
                  </h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>The following devices are currently offline:</p>
                    <ul className="list-disc list-inside mt-1">
                      {offlineDevices.map(device => (
                        <li key={device._id}>{device.rpi_name} - {device.location}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health Table */}
      <DataTable
        columns={columns}
        data={devices}
        loading={loading}
        emptyMessage="No devices found"
      />
    </div>
  )
}

export default HealthStatus