import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Activity, 
  Wifi, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Thermometer,
  Battery,
  Network,
  Shield,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone,
  MapPin,
  User,
  Phone,
  Car,
  Download,
  Upload,
  RefreshCw,
  Power,
  Settings,
  Video,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react'
import { deviceService } from '../../services/deviceService'
import Button from '../../components/UI/Button'
import toast from 'react-hot-toast'

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    active: { color: 'green', label: 'Online', icon: CheckCircle },
    in_active: { color: 'red', label: 'Offline', icon: AlertTriangle },
    warning: { color: 'yellow', label: 'Warning', icon: Bell },
    maintenance: { color: 'blue', label: 'Maintenance', icon: Settings }
  }
  
  const config = statusConfig[status] || statusConfig.in_active
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <Icon className={`h-4 w-4 mr-2 text-${config.color}-600`} />
      {config.label}
    </span>
  )
}

const MetricCard = ({ title, value, icon: Icon, subtitle, color = 'gray', trend, unit }) => {
  const colors = {
    gray: 'text-gray-600 bg-gray-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
    pink: 'text-pink-600 bg-pink-50'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
            {trend && (
              <span className={`text-xs font-medium ${trendColors[trend.type]}`}>
                {trend.type === 'up' ? '↗' : trend.type === 'down' ? '↘' : '→'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]} ml-4`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

const PerformanceIndicator = ({ value, label, type = 'cpu' }) => {
  const getColor = (val) => {
    if (val <= 50) return 'bg-green-500'
    if (val <= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIcon = () => {
    switch(type) {
      case 'cpu': return <Cpu className="h-4 w-4 mr-2" />
      case 'memory': return <Activity className="h-4 w-4 mr-2" />
      case 'temperature': return <Thermometer className="h-4 w-4 mr-2" />
      default: return <Activity className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {getIcon()}
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{value || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${getColor(value || 0)} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(value || 0, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

const HealthChart = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No health history available</p>
      </div>
    )
  }

  const recentData = history.slice(0, 10).reverse()
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Health Trends (Last 24h)</h4>
      <div className="h-48 flex items-end space-x-1">
        {recentData.map((record, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex flex-col items-center space-y-1">
              <div 
                className="w-6 bg-red-400 rounded-t" 
                style={{ height: `${((record.metrics?.cpu_usage || 0) * 0.8)}%` }}
                title={`CPU: ${record.metrics?.cpu_usage || 0}%`}
              ></div>
              <div 
                className="w-6 bg-blue-400 rounded-t" 
                style={{ height: `${((record.metrics?.memory_usage || 0) * 0.8)}%` }}
                title={`Memory: ${record.metrics?.memory_usage || 0}%`}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-2">
              {new Date(record.timestamp).getHours()}h
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
          <span className="text-gray-600">CPU</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-400 rounded mr-1"></div>
          <span className="text-gray-600">Memory</span>
        </div>
      </div>
    </div>
  )
}

const DeviceDetails = () => {
  const { id } = useParams()
  const [deviceDetails, setDeviceDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchDeviceDetails()
  }, [id])

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true)
      const response = await deviceService.getDeviceDetails(id)
      setDeviceDetails(response.device)
    } catch (error) {
      toast.error('Failed to fetch device details')
      console.error('Error fetching device details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReboot = async () => {
    if (!deviceDetails || !confirm('Are you sure you want to reboot this device?')) return
    
    try {
      setActionLoading(true)
      await deviceService.sendBulkCommand({
        device_ids: [deviceDetails.rpi_id],
        command: 'reboot'
      })
      toast.success('Reboot command sent to device')
    } catch (error) {
      toast.error('Failed to send reboot command')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSync = async () => {
    if (!deviceDetails) return
    
    try {
      setActionLoading(true)
      await deviceService.sendBulkCommand({
        device_ids: [deviceDetails.rpi_id],
        command: 'sync_videos'
      })
      toast.success('Sync command sent to device')
    } catch (error) {
      toast.error('Failed to send sync command')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!deviceDetails) return
    
    const newStatus = deviceDetails.status === 'active' ? 'in_active' : 'active'
    
    try {
      setActionLoading(true)
      await deviceService.updateDeviceStatus(deviceDetails.id, newStatus)
      setDeviceDetails(prev => ({
        ...prev,
        status: newStatus,
        is_online: newStatus === 'active'
      }))
      toast.success(`Device ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update device status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!deviceDetails) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Device not found</h3>
        <p className="mt-2 text-sm text-gray-500">The device you're looking for doesn't exist.</p>
        <Link 
          to="/devices" 
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Link>
      </div>
    )
  }

  // Safely destructure with fallbacks
  const device = deviceDetails.device || {}
  const health = deviceDetails.health || { current: null }
  const performance = deviceDetails.performance || {}
  const network = deviceDetails.network || {}
  const configuration = deviceDetails.configuration || { 
    config: {}, 
    wifi: {}, 
    capabilities: [] 
  }
  const sync = deviceDetails.sync || {}
  const alerts = deviceDetails.alerts || {}
  const statistics = deviceDetails.statistics || {}
  
  const healthHistory = device.health_history?.data || []

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="CPU Usage"
          value={health?.current?.cpu_usage || 'N/A'}
          icon={Cpu}
          unit="%"
          color={health?.current?.cpu_usage > 80 ? 'red' : health?.current?.cpu_usage > 60 ? 'yellow' : 'green'}
          trend={statistics?.avg_cpu_usage ? {
            type: health?.current?.cpu_usage > statistics.avg_cpu_usage ? 'up' : 'down',
            value: `${Math.abs((health?.current?.cpu_usage || 0) - (statistics.avg_cpu_usage || 0)).toFixed(1)}%`
          } : null}
        />
        
        <MetricCard
          title="Memory Usage"
          value={health?.current?.memory_usage || 'N/A'}
          icon={Activity}
          unit="%"
          color={health?.current?.memory_usage > 80 ? 'red' : health?.current?.memory_usage > 60 ? 'yellow' : 'blue'}
        />
        
        <MetricCard
          title="Temperature"
          value={health?.current?.temperature || 'N/A'}
          icon={Thermometer}
          unit="°C"
          color={health?.current?.temperature > 80 ? 'red' : health?.current?.temperature > 60 ? 'yellow' : 'green'}
        />
        
        <MetricCard
          title="Videos"
          value={health?.current?.video_count || 0}
          icon={Video}
          color="purple"
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-5">
            <PerformanceIndicator 
              value={health?.current?.cpu_usage} 
              label="CPU Usage" 
              type="cpu" 
            />
            <PerformanceIndicator 
              value={health?.current?.memory_usage} 
              label="Memory Usage" 
              type="memory" 
            />
            <PerformanceIndicator 
              value={health?.current?.temperature} 
              label="Temperature" 
              type="temperature" 
            />
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Network className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Connection</p>
                  <p className="text-xs text-gray-500">{network.connection_type || 'Unknown'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                health?.current?.internet_status 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {health?.current?.internet_status ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WiFi Signal</p>
                  <p className="text-xs text-gray-500">{network.last_known_wifi || 'Not connected'}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {health?.current?.wifi_signal || 0}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Uptime</p>
                  <p className="text-xs text-gray-500">System runtime</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {statistics?.uptime_percentage ? `${statistics.uptime_percentage.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Health Chart */}
        <div className="lg:col-span-1">
          <HealthChart history={healthHistory} />
        </div>
      </div>

      {/* Device Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
            <Smartphone className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Device Name" value={device.rpi_name} icon={Monitor} />
            <InfoItem label="Device ID" value={device.rpi_id} copyable />
            <InfoItem label="Location" value={device.location} icon={MapPin} />
            <InfoItem label="Status" value={<StatusIndicator status={device.status} />} />
            <InfoItem label="Last Seen" value={device.last_seen_relative} icon={Clock} />
            <InfoItem label="Registered" value={device.registered_at ? new Date(device.registered_at).toLocaleDateString() : 'Unknown'} />
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <InfoItem label="Owner Name" value={device.owner_name} icon={User} />
            <InfoItem label="Contact" value={device.owner_phone} icon={Phone} />
            <InfoItem label="Vehicle No" value={device.vehicle_no} icon={Car} />
          </div>
        </div>
      </div>
    </div>
  )

  const renderHealthTab = () => (
    <div className="space-y-6">
      {/* Performance Analysis */}
      {performance && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              performance.status === 'good' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {performance.status === 'good' ? 'Good' : 'Needs Attention'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU Status</span>
                  <span className={`font-medium ${
                    performance.cpu_status === 'high' ? 'text-red-600' :
                    performance.cpu_status === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {performance.cpu_status ? performance.cpu_status.toUpperCase() : 'NORMAL'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    performance.cpu_status === 'high' ? 'bg-red-500' :
                    performance.cpu_status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory Status</span>
                  <span className={`font-medium ${
                    performance.memory_status === 'high' ? 'text-red-600' :
                    performance.memory_status === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {performance.memory_status ? performance.memory_status.toUpperCase() : 'NORMAL'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    performance.memory_status === 'high' ? 'bg-red-500' :
                    performance.memory_status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h4>
              {performance.recommendations && performance.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {performance.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">All systems are operating normally.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Health History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Health History</h3>
              <p className="text-sm text-gray-500 mt-1">Last 24 hours - {healthHistory.length || 0} records</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDeviceDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {healthHistory && healthHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPU %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperature °C
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {healthHistory.slice(0, 10).map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.cpu_usage || 0}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            record.cpu_usage > 80 ? 'bg-red-500' : 
                            record.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${record.cpu_usage || 0}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.memory_usage || 0}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            record.memory_usage > 80 ? 'bg-red-500' : 
                            record.memory_usage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${record.memory_usage || 0}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {record.temperature || 'N/A'}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.cpu_usage > 90 || record.memory_usage > 90
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.cpu_usage > 90 || record.memory_usage > 90 ? 'Warning' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No health data</h3>
            <p className="mt-1 text-sm text-gray-500">Health data will appear here when available.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Settings */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Device Configuration</h3>
          <Settings className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-6">
          {/* WiFi Configuration */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              WiFi Settings
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">SSID</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    configuration.wifi?.is_configured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {configuration.wifi?.is_configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {configuration.wifi?.ssid || 'No WiFi configured'}
                </p>
                {configuration.wifi?.configured_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {configuration.wifi?.last_updated}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Playback Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Playback Settings
            </h4>
            <div className="space-y-3">
              <SettingToggle 
                label="Auto Play"
                enabled={configuration.config?.autoplay}
                description="Automatically start playback on boot"
              />
              <SettingToggle 
                label="Shuffle"
                enabled={configuration.config?.shuffle}
                description="Play videos in random order"
              />
              <SettingItem 
                label="Default Volume"
                value={`${configuration.config?.default_volume || 80}%`}
              />
              <SettingItem 
                label="Sync Interval"
                value={`${sync.sync_interval ? sync.sync_interval / 60 : 10} minutes`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
          <Monitor className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoItemCompact label="Model" value={device.system_info?.model || 'Unknown'} />
            <InfoItemCompact label="OS" value={device.system_info?.os || 'Unknown'} />
            <InfoItemCompact label="Architecture" value={device.system_info?.architecture || 'Unknown'} />
            <InfoItemCompact label="Cores" value={device.system_info?.cores || 0} />
            <InfoItemCompact label="Memory" value={device.system_info?.total_memory || 'Unknown'} />
            <InfoItemCompact label="Raspberry Pi" value={device.system_info?.is_raspberry_pi ? 'Yes' : 'No'} />
            <InfoItemCompact label="Hostname" value={network.hostname || 'Unknown'} />
            <InfoItemCompact label="MAC Address" value={network.mac_address || 'Unknown'} />
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {configuration.capabilities?.map((cap, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {cap.name}
                </span>
              )) || <p className="text-sm text-gray-500">No capabilities listed</p>}
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-2">Sync Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-gray-900">
                  {sync.last_sync ? new Date(sync.last_sync).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Sync In</span>
                <span className="text-gray-900">{sync.next_sync_in || 'unknown'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auto Sync</span>
                <span className="text-gray-900">
                  {sync.auto_sync_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderVideosTab = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Video Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Currently installed: {health?.current?.video_count || 0} videos
          </p>
        </div>
        <Button onClick={handleSync} loading={actionLoading}>
          <Upload className="h-4 w-4 mr-2" />
          Sync Videos
        </Button>
      </div>

      <div className="text-center py-12">
        <Video className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">Video Management</h3>
        <p className="mt-2 text-sm text-gray-500">
          Manage videos installed on this device. Sync videos from the central server or upload new ones.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button>
            <Video className="h-4 w-4 mr-2" />
            Manage Playlist
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/devices" 
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Monitor className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{device.rpi_name}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <StatusIndicator status={device.status} />
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {device.location || 'Location not set'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {device.rpi_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handleSync}
              loading={actionLoading}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReboot}
              loading={actionLoading}
              disabled={actionLoading}
            >
              <Power className="h-4 w-4 mr-2" />
              Reboot
            </Button>
            <Button 
              variant={device.status === 'active' ? 'danger' : 'success'}
              onClick={handleStatusToggle}
              loading={actionLoading}
              disabled={actionLoading}
            >
              <Power className="h-4 w-4 mr-2" />
              {device.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Link to={`/devices/edit/${device.id}`}>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <nav className="flex overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: Monitor },
            { id: 'health', name: 'Health', icon: Activity },
            { id: 'videos', name: 'Videos', icon: Video },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center justify-center sm:justify-start ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'health' && renderHealthTab()}
          {activeTab === 'videos' && renderVideosTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.has_warnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {alerts.warning_count} Warning{alerts.warning_count !== 1 ? 's' : ''} Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="space-y-1">
                  {alerts.recommendations?.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
const InfoItem = ({ label, value, icon: Icon, copyable = false }) => (
  <div className="space-y-1">
    <div className="flex items-center text-sm text-gray-500">
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </div>
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-900">
        {typeof value === 'string' || typeof value === 'number' ? value : value}
      </span>
      {copyable && typeof value === 'string' && (
        <button 
          onClick={() => {
            navigator.clipboard.writeText(value)
            toast.success('Copied to clipboard')
          }}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          📋
        </button>
      )}
    </div>
  </div>
)

const InfoItemCompact = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-sm font-medium text-gray-900 truncate">{value || 'Unknown'}</div>
  </div>
)

const SettingToggle = ({ label, enabled, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
    <div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
      enabled ? 'bg-primary-600' : 'bg-gray-200'
    }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </div>
  </div>
)

const SettingItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
    <div className="text-sm font-medium text-gray-900">{label}</div>
    <div className="text-sm text-gray-700">{value}</div>
  </div>
)

export default DeviceDetails