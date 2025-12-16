import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Monitor, 
  Video, 
  Users, 
  Settings,
  UserCircle,
  LogOut,
  Activity,
  Shield
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
  { name: 'Devices', href: '/devices', icon: Monitor },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Brands', href: '/brands', icon: Shield },
  { name: 'User Management', href: '/users', icon: UserCircle, adminOnly: true },
  { name: 'Health Monitor', href: '/devices/health', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false
    }
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 lg:hidden z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                ADS Display
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href)
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive: navIsActive }) => cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    (navIsActive || isActive)
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={onClose}
                  end={item.exact}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    (location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)))
                      ? "text-primary-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.name}
                  {item.adminOnly && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user?.image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.image}
                    alt={user.username}
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 capitalize">
                    {user?.role}
                  </span>
                  {user?.status === 'inactive' && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar