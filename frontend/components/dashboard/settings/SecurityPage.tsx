'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login' | 'api_key_created' | 'password_change' | '2fa_enabled' | 'suspicious_activity'
  description: string
  timestamp: string
  location: string
  device: string
  status: 'success' | 'failed' | 'warning'
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'login',
    description: 'Successful login',
    timestamp: '2024-01-15T10:30:00Z',
    location: 'San Francisco, CA',
    device: 'Chrome on macOS',
    status: 'success'
  },
  {
    id: '2',
    type: 'api_key_created',
    description: 'API key created for production',
    timestamp: '2024-01-15T09:15:00Z',
    location: 'San Francisco, CA',
    device: 'Chrome on macOS',
    status: 'success'
  },
  {
    id: '3',
    type: 'suspicious_activity',
    description: 'Multiple failed login attempts',
    timestamp: '2024-01-14T23:45:00Z',
    location: 'Unknown Location',
    device: 'Unknown Browser',
    status: 'warning'
  }
]

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [notifications, setNotifications] = useState({
    loginAlerts: true,
    apiActivity: true,
    suspiciousActivity: true
  })

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <Key className="h-4 w-4" />
      case 'api_key_created':
        return <Globe className="h-4 w-4" />
      case 'password_change':
        return <Lock className="h-4 w-4" />
      case '2fa_enabled':
        return <Smartphone className="h-4 w-4" />
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security settings and monitor activity
          </p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-green-600">85%</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Good security posture</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">2 devices logged in</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Today</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">10:30 AM from SF</p>
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure your security preferences</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Security Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Login alerts</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get notified of new logins</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications.loginAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications.loginAlerts ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">API activity</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get notified of API key usage</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, apiActivity: !prev.apiActivity }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications.apiActivity ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications.apiActivity ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Suspicious activity</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get notified of security threats</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, suspiciousActivity: !prev.suspiciousActivity }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications.suspiciousActivity ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications.suspiciousActivity ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your account security events</p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockSecurityEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.description}
                      </p>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                      <span>{event.location}</span>
                      <span>{event.device}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
