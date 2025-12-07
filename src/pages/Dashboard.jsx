import React, { useEffect, useState } from 'react'
import { 
  Monitor, 
  Video, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react'
import { deviceService } from '../services/deviceService'
import { videoService } from '../services/videoService'
import { useDeviceStore } from '../store/deviceStore'
import { useVideoStore } from '../store/videoStore'

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${colors[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </span>
            <span className="text-gray-500 ml-1">{trend.label}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { devices, stats, setDevices, setStats } = useDeviceStore()
  const { videos, brands, setVideos, setBrands } = useVideoStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [devicesRes, videosRes, brandsRes, statsRes] = await Promise.all([
          deviceService.getAllDevices(),
          videoService.getAllVideos(),
          videoService.getAllBrands(),
          deviceService.getDeviceStats()
        ])

        setDevices(devicesRes.rpis || [])
        setVideos(videosRes.videos || [])
        setBrands(brandsRes.brands || [])
        setStats(statsRes.data || {})
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [setDevices, setVideos, setBrands, setStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeDevices = devices.filter(d => d.rpi_status === 'active').length
  const inactiveDevices = devices.filter(d => d.rpi_status === 'in_active').length
  const warningDevices = devices.filter(d => d.rpi_status === 'warning').length
  const activeVideos = videos.filter(v => !v.expiryDate || new Date(v.expiryDate) > new Date()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your advertising display network
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Devices"
          value={devices.length}
          icon={Monitor}
          color="blue"
          trend={{ value: '+12%', label: 'from last month', isPositive: true }}
        />
        <StatCard
          title="Active Devices"
          value={activeDevices}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Warning Devices"
          value={warningDevices}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Active Videos"
          value={activeVideos}
          icon={Video}
          color="blue"
        />
        <StatCard
          title="Inactive Devices"
          value={inactiveDevices}
          icon={Monitor}
          color="red"
        />
        <StatCard
          title="Total Brands"
          value={brands.length}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Total Videos"
          value={videos.length}
          icon={Video}
          color="blue"
        />
        <StatCard
          title="Uptime"
          value="99.2%"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Devices */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Devices</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {devices.slice(0, 5).map((device, deviceIdx) => (
                  <li key={device._id}>
                    <div className="relative pb-8">
                      {deviceIdx !== devices.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              device.rpi_status === 'active'
                                ? 'bg-green-500'
                                : device.rpi_status === 'warning'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          >
                            <Monitor className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium text-gray-900">
                                {device.rpi_name}
                              </span>
                              {' '}is {device.rpi_status}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {device.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Device Connectivity</span>
                  <span className="font-medium text-gray-900">
                    {Math.round((activeDevices / devices.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(activeDevices / devices.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage Usage</span>
                  <span className="font-medium text-gray-900">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Network Latency</span>
                  <span className="font-medium text-gray-900">42ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard