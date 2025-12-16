import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import DataTable from '../../components/UI/DataTable'

const UserStatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      color: 'green',
      label: 'Active',
      icon: CheckCircle
    },
    inactive: {
      color: 'red',
      label: 'Inactive',
      icon: XCircle
    }
  }

  const config = statusConfig[status] || statusConfig.inactive
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  )
}

const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: {
      color: 'purple',
      label: 'Admin'
    },
    staff: {
      color: 'blue',
      label: 'Staff'
    }
  }

  const config = roleConfig[role] || roleConfig.staff

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <Shield className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  )
}

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

const Users = () => {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [retryCount, setRetryCount] = useState(0)
  const [rateLimited, setRateLimited] = useState(false)

  // Use ref to prevent multiple simultaneous calls
  const isFetching = useRef(false)
  const abortControllerRef = useRef(null)

  const { register: registerSearch, handleSubmit: handleSearchSubmit, watch } = useForm({
    defaultValues: {
      search: '',
      role: ''
    }
  })

  // Watch search and role fields for debouncing
  const searchValue = watch('search')
  const roleValue = watch('role')

  // Debounced values
  const debouncedSearch = useDebounce(searchValue, 500) // 500ms delay
  const debouncedRole = useDebounce(roleValue, 300) // 300ms delay

  // Fetch users with proper error handling and retry logic
  const fetchUsers = useCallback(async (abortSignal) => {
    // Prevent multiple simultaneous calls
    if (isFetching.current) {
      return
    }

    isFetching.current = true
    setLoading(true)
    
    try {
      // Add a small delay to prevent rapid API calls
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const response = await authService.getAllUsers({
        ...searchParams,
        search: debouncedSearch,
        role: debouncedRole
      }, abortSignal)
      
      setUsers(response.users)
      setPagination(response.pagination)
      setRateLimited(false)
      setRetryCount(0)
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      if (error.response?.status === 429) {
        setRateLimited(true)
        toast.error('Too many requests. Please wait a moment.')
        
        // Implement exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, delay)
        
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        // Auth store will handle logout via interceptor
      } else {
        toast.error('Failed to fetch users')
        console.error('Error fetching users:', error)
      }
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [searchParams, debouncedSearch, debouncedRole, retryCount])

  // Effect to fetch users when search params change
  useEffect(() => {
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()
    
    fetchUsers(abortControllerRef.current.signal)

    // Cleanup function to abort pending request
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchUsers])

  // Handle search form submission
  const handleSearch = (data) => {
    setSearchParams(prev => ({
      ...prev,
      ...data,
      page: 1 // Reset to first page when searching
    }))
  }

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true)
      await authService.activateUser(userId)
      toast.success('User activated successfully')
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(true)
      await authService.deleteUser(userId)
      toast.success('User deleted successfully')
      
      // Refresh the users list
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }))
  }

  const handleRefresh = () => {
    if (rateLimited) {
      toast('Please wait before trying again')
      return
    }
    fetchUsers()
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.image ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.image}
                alt={user.username}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.firstName && user.lastName && (
              <div className="text-xs text-gray-400">
                {user.firstName} {user.lastName}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => <RoleBadge role={user.role} />
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <UserStatusBadge status={user.status} />
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user) => (
        <div className="space-y-1">
          {user.email && (
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </div>
          )}
          {user.mobile && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-3 w-3 mr-1" />
              {user.mobile}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (user) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-2">
          {user.status === 'inactive' && currentUser?.role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActivateUser(user._id)}
              loading={actionLoading}
              disabled={actionLoading}
              title="Activate User"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
          
          {currentUser?.role === 'admin' && user._id !== currentUser._id && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteUser(user._id)}
              loading={actionLoading}
              disabled={actionLoading}
              title="Delete User"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage system users and permissions ({pagination.totalUsers || 0} total users)
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={loading}
            disabled={rateLimited}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          {currentUser?.role === 'admin' && (
            <Button
              onClick={() => {
                setSelectedUser(null)
                setShowModal(true)
              }}
              icon={UserPlus}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimited && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Rate Limited
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Too many requests. Please wait a moment before trying again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSearchSubmit(handleSearch)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  {...registerSearch('search')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search by name, email..."
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Filter by Role
              </label>
              <select
                id="role"
                {...registerSearch('role')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                icon={Filter} 
                className="w-full"
                loading={loading}
                disabled={loading || rateLimited}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'staff').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage={
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {rateLimited ? 'Rate limited. Please try again later.' : 'Get started by adding your first user.'}
            </p>
          </div>
        }
      />
    </div>
  )
}

export default Users