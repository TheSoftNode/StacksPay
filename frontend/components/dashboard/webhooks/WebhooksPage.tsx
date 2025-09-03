'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  Webhook,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  Activity,
  Clock,
  Shield,
  Zap,
  Code,
  Globe,
  TestTube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WebhookEndpoint {
  id: string
  url: string
  description: string
  events: string[]
  status: 'active' | 'inactive' | 'failed'
  lastDelivery: string
  successRate: number
  createdAt: string
  secret: string
}

interface WebhookEvent {
  id: string
  type: string
  status: 'success' | 'failed' | 'pending'
  timestamp: string
  endpoint: string
  attempts: number
  response: {
    status: number
    body?: string
  }
}

const WebhooksPage = () => {
  const [showAddWebhook, setShowAddWebhook] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)
  const [activeTab, setActiveTab] = useState('endpoints')

  // Mock data
  const webhookEndpoints: WebhookEndpoint[] = [
    {
      id: '1',
      url: 'https://api.example.com/webhooks/payments',
      description: 'Payment notifications for main application',
      events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
      status: 'active',
      lastDelivery: '2024-01-15T10:30:00Z',
      successRate: 98.5,
      createdAt: '2023-12-01T09:00:00Z',
      secret: 'whsec_1234567890abcdef'
    },
    {
      id: '2',
      url: 'https://analytics.example.com/webhook',
      description: 'Analytics and reporting webhook',
      events: ['payment.succeeded', 'customer.created'],
      status: 'active',
      lastDelivery: '2024-01-15T10:25:00Z',
      successRate: 100,
      createdAt: '2024-01-02T14:30:00Z',
      secret: 'whsec_abcdef1234567890'
    },
    {
      id: '3',
      url: 'https://backup.example.com/webhooks',
      description: 'Backup webhook endpoint',
      events: ['payment.succeeded', 'payment.failed'],
      status: 'failed',
      lastDelivery: '2024-01-14T15:45:00Z',
      successRate: 45.2,
      createdAt: '2023-11-15T11:20:00Z',
      secret: 'whsec_fedcba0987654321'
    }
  ]

  const webhookEvents: WebhookEvent[] = [
    {
      id: '1',
      type: 'payment.succeeded',
      status: 'success',
      timestamp: '2024-01-15T10:30:00Z',
      endpoint: 'https://api.example.com/webhooks/payments',
      attempts: 1,
      response: { status: 200 }
    },
    {
      id: '2',
      type: 'payment.failed',
      status: 'failed',
      timestamp: '2024-01-15T10:28:00Z',
      endpoint: 'https://backup.example.com/webhooks',
      attempts: 3,
      response: { status: 500, body: 'Internal Server Error' }
    },
    {
      id: '3',
      type: 'customer.created',
      status: 'success',
      timestamp: '2024-01-15T10:25:00Z',
      endpoint: 'https://analytics.example.com/webhook',
      attempts: 1,
      response: { status: 200 }
    },
    {
      id: '4',
      type: 'payment.refunded',
      status: 'pending',
      timestamp: '2024-01-15T10:22:00Z',
      endpoint: 'https://api.example.com/webhooks/payments',
      attempts: 0,
      response: { status: 0 }
    }
  ]

  const availableEvents = [
    'payment.succeeded',
    'payment.failed',
    'payment.refunded',
    'payment.disputed',
    'customer.created',
    'customer.updated',
    'subscription.created',
    'subscription.updated',
    'subscription.cancelled'
  ]

  const getStatusBadge = (status: WebhookEndpoint['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300">Inactive</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getEventStatusIcon = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const activeEndpoints = webhookEndpoints.filter(w => w.status === 'active').length
  const totalEvents = webhookEvents.length
  const successfulEvents = webhookEvents.filter(e => e.status === 'success').length
  const failedEvents = webhookEvents.filter(e => e.status === 'failed').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Webhooks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage webhook endpoints and monitor delivery events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Code className="mr-2 h-4 w-4" />
            Documentation
          </Button>
          <Button onClick={() => setShowAddWebhook(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Endpoints
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeEndpoints}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Webhook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Events Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalEvents}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Successful
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {successfulEvents}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {failedEvents}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="events">Event Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>
                Manage your webhook endpoints and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Last Delivery</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEndpoints.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                              {webhook.url}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {webhook.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(webhook.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 2).map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{webhook.events.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${webhook.successRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {webhook.successRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(webhook.lastDelivery)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedWebhook(webhook)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit Endpoint
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TestTube className="mr-2 h-4 w-4" />
                                Test Endpoint
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyToClipboard(webhook.secret)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Secret
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Endpoint
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>
                View recent webhook delivery attempts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getEventStatusIcon(event.status)}
                            <span className="capitalize">{event.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {event.endpoint}
                        </TableCell>
                        <TableCell>
                          {event.attempts}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              event.response.status >= 200 && event.response.status < 300
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                            }
                          >
                            {event.response.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(event.timestamp)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Settings</CardTitle>
              <CardDescription>
                Configure global webhook behavior and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Retry Failed Deliveries</h4>
                    <p className="text-sm text-gray-500">Automatically retry failed webhook deliveries</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Signature Verification</h4>
                    <p className="text-sm text-gray-500">Require signature verification for all webhooks</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Maximum Retry Attempts</Label>
                  <Select defaultValue="3">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Webhook Modal */}
      <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
            <DialogDescription>
              Create a new webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Endpoint URL</Label>
              <Input id="webhookUrl" placeholder="https://api.example.com/webhooks" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookDescription">Description</Label>
              <Input id="webhookDescription" placeholder="Description of this webhook endpoint" />
            </div>

            <div className="space-y-2">
              <Label>Events to Send</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                {availableEvents.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input type="checkbox" id={event} className="rounded" />
                    <Label htmlFor={event} className="text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWebhook(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddWebhook(false)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Detail Modal */}
      <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
            <DialogDescription>
              View webhook endpoint configuration and statistics
            </DialogDescription>
          </DialogHeader>
          
          {selectedWebhook && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={selectedWebhook.url} readOnly />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(selectedWebhook.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    {getStatusBadge(selectedWebhook.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Success Rate</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedWebhook.successRate}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Created</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(selectedWebhook.createdAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex items-center space-x-2">
                  <Input value={selectedWebhook.secret} readOnly type="password" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(selectedWebhook.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subscribed Events</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedWebhook.events.map((event) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View webhook event delivery details
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <p className="font-medium">{selectedEvent.type}</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getEventStatusIcon(selectedEvent.status)}
                    <span className="capitalize">{selectedEvent.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attempts</Label>
                  <p>{selectedEvent.attempts}</p>
                </div>

                <div className="space-y-2">
                  <Label>Response Code</Label>
                  <Badge 
                    className={
                      selectedEvent.response.status >= 200 && selectedEvent.response.status < 300
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    }
                  >
                    {selectedEvent.response.status || 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endpoint</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {selectedEvent.endpoint}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Timestamp</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(selectedEvent.timestamp)}
                </p>
              </div>

              {selectedEvent.response.body && (
                <div className="space-y-2">
                  <Label>Response Body</Label>
                  <Textarea 
                    value={selectedEvent.response.body} 
                    readOnly 
                    className="font-mono text-sm"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WebhooksPage
