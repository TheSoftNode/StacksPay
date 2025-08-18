'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit3,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  Code,
  Globe,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  key: string
  environment: 'test' | 'live'
  permissions: string[]
  createdAt: string
  lastUsed?: string
  status: 'active' | 'inactive' | 'expired'
  expiresAt?: string
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_1234567890abcdef1234567890abcdef',
    environment: 'live',
    permissions: ['payments.read', 'payments.write', 'webhooks.write'],
    createdAt: '2024-08-01T10:00:00Z',
    lastUsed: '2024-08-18T09:30:00Z',
    status: 'active'
  },
  {
    id: '2', 
    name: 'Test Environment',
    key: 'sk_test_abcdef1234567890abcdef1234567890',
    environment: 'test',
    permissions: ['payments.read', 'payments.write'],
    createdAt: '2024-07-15T14:20:00Z',
    lastUsed: '2024-08-17T16:45:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Legacy Key',
    key: 'sk_live_fedcba0987654321fedcba0987654321',
    environment: 'live',
    permissions: ['payments.read'],
    createdAt: '2024-06-01T08:00:00Z',
    lastUsed: '2024-07-20T12:15:00Z',
    status: 'inactive'
  }
]

const availablePermissions = [
  { id: 'payments.read', name: 'Read Payments', description: 'View payment data' },
  { id: 'payments.write', name: 'Write Payments', description: 'Create and modify payments' },
  { id: 'customers.read', name: 'Read Customers', description: 'View customer data' },
  { id: 'customers.write', name: 'Write Customers', description: 'Create and modify customers' },
  { id: 'webhooks.write', name: 'Manage Webhooks', description: 'Create and modify webhooks' },
  { id: 'analytics.read', name: 'Read Analytics', description: 'View analytics data' }
]

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    environment: 'test' as 'test' | 'live',
    permissions: [] as string[],
    description: ''
  })

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Toast notification would go here
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
    }

    return (
      <Badge className={cn('text-xs font-medium', variants[status as keyof typeof variants])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getEnvironmentBadge = (environment: string) => {
    return environment === 'live' ? (
      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
        <Globe className="w-3 h-3 mr-1" />
        Live
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Code className="w-3 h-3 mr-1" />
        Test
      </Badge>
    )
  }

  const handleCreateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyData.name,
      key: `sk_${newKeyData.environment}_${Math.random().toString(36).substring(2, 34)}`,
      environment: newKeyData.environment,
      permissions: newKeyData.permissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    setApiKeys(prev => [newKey, ...prev])
    setIsCreateDialogOpen(false)
    setNewKeyData({
      name: '',
      environment: 'test',
      permissions: [],
      description: ''
    })
  }

  const togglePermission = (permission: string) => {
    setNewKeyData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const deleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your StacksPay API keys and permissions
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your application
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production API Key"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select 
                  value={newKeyData.environment} 
                  onValueChange={(value: 'test' | 'live') => 
                    setNewKeyData(prev => ({ ...prev, environment: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Environment</SelectItem>
                    <SelectItem value="live">Live Environment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Switch
                        id={permission.id}
                        checked={newKeyData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will this key be used for?"
                  value={newKeyData.description}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateKey}
                disabled={!newKeyData.name || newKeyData.permissions.length === 0}
              >
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Keep your API keys secure
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Never share your API keys publicly or store them in client-side code. 
                Use environment variables and keep them secret.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey, index) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {apiKey.name}
                      </h3>
                      {getEnvironmentBadge(apiKey.environment)}
                      {getStatusBadge(apiKey.status)}
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
                        {showKeys[apiKey.id] 
                          ? apiKey.key 
                          : `${apiKey.key.substring(0, 12)}${'•'.repeat(20)}`
                        }
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{formatDate(apiKey.createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Used:</span>
                        <p>{apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Permissions:</span>
                        <p>{apiKey.permissions.length} permission{apiKey.permissions.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {apiKey.permissions.map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {availablePermissions.find(p => p.id === permission)?.name || permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Key
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        Regenerate Key
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400"
                        onClick={() => deleteKey(apiKey.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Key
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Key className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              No API keys yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Create your first API key to start integrating with StacksPay
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Start</CardTitle>
          <CardDescription>
            Get started with the StacksPay API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Authentication</h4>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`curl -X GET https://api.stackspay.com/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Need help getting started?
            </span>
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiKeysPage
