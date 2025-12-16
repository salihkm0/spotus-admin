import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  User, 
  Lock, 
  Shield,
  Bell,
  Palette,
  Globe,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'

const Settings = () => {
  const { user, updateUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors },
    reset: resetProfile 
  } = useForm()

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    formState: { errors: passwordErrors }, 
    reset: resetPassword,
    watch: watchPassword 
  } = useForm()

  const { 
    register: registerPreferences,
    handleSubmit: handlePreferencesSubmit,
    formState: { errors: preferencesErrors }
  } = useForm()

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        mobile: user.mobile || ''
      })
    }
  }, [user, resetProfile])

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })

      const response = await authService.updateProfile(user._id, formData)
      updateUser(response.user)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (data) => {
    try {
      setLoading(true)
      await authService.changePassword(data)
      toast.success('Password changed successfully')
      resetPassword()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async (data) => {
    try {
      setLoading(true)
      // Implement preferences update
      toast.success('Preferences updated successfully')
    } catch (error) {
      toast.error('Failed to update preferences')
      console.error('Error updating preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    try {
      setLoading(true)
      await authService.deactivateAccount()
      toast.success('Account deactivated successfully')
      logout()
      window.location.href = '/login'
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate account')
      console.error('Error deactivating account:', error)
    } finally {
      setLoading(false)
      setShowDeactivateModal(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Security', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  const newPassword = watchPassword('newPassword')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary-100">
                        <span className="text-2xl font-bold text-primary-700">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-600" />
                  </label>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    className="hidden"
                    {...registerProfile('image')}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.username}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(handleProfileUpdate)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...registerProfile('firstName')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...registerProfile('lastName')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...registerProfile('username', { 
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {profileErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...registerProfile('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    {...registerProfile('mobile', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9+\-() ]+$/,
                        message: 'Invalid mobile number'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {profileErrors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.mobile.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetProfile()}
                  >
                    Reset
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'password' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <form onSubmit={handlePasswordSubmit(handlePasswordUpdate)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password *
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            id="currentPassword"
                            {...registerPassword('currentPassword', { 
                              required: 'Current password is required'
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword.current ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password *
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            id="newPassword"
                            {...registerPassword('newPassword', { 
                              required: 'New password is required',
                              minLength: { 
                                value: 6, 
                                message: 'Password must be at least 6 characters' 
                              },
                              validate: (value) => {
                                if (value === watchPassword('currentPassword')) {
                                  return 'New password must be different from current password'
                                }
                                return true
                              }
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword.new ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password *
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            id="confirmPassword"
                            {...registerPassword('confirmPassword', { 
                              required: 'Please confirm your new password',
                              validate: (value) => 
                                value === newPassword || 'Passwords do not match'
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" loading={loading}>
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Deactivate Account</p>
                          <p className="text-xs text-red-600 mt-1">
                            Your account will be temporarily disabled. You can reactivate it later.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeactivateModal(true)}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="max-w-2xl">
              <form onSubmit={handlePreferencesSubmit(handlePreferencesUpdate)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Switch to dark theme for better visibility in low light
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          {...registerPreferences('darkMode')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Language</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose your preferred language
                        </p>
                      </div>
                      <select
                        {...registerPreferences('language')}
                        className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Time Zone</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Set your local time zone
                        </p>
                      </div>
                      <select
                        {...registerPreferences('timezone')}
                        className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    Save Preferences
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Device Status Updates</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Receive emails when device status changes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Security Alerts</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Get notified about security-related activities
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">News & Updates</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Receive product updates and announcements
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Browser Notifications</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Show notifications in your browser
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" loading={loading}>
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Account Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Deactivating your account will:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Temporarily disable your account</li>
                    <li>Prevent you from logging in</li>
                    <li>Keep your data saved for 30 days</li>
                    <li>Allow you to reactivate later</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to deactivate your account? You can reactivate it at any time by contacting support.
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeactivateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeactivateAccount}
              loading={loading}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings