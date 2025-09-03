'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Save,
  User,
  Building,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Key,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Trash2,
  Plus,
  Check,
  X,
  AlertTriangle,
  Lock,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface BusinessProfile {
  name: string
  description: string
  website: string
  businessType: string
  country: string
  address: string
  city: string
  postalCode: string
  phone: string
  taxId: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  webhookNotifications: boolean
  paymentAlerts: boolean
  securityAlerts: boolean
  marketingEmails: boolean
}

const SettingsPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: 'Acme Corp',
    description: 'Digital services and consulting',
    website: 'https://acme.com',
    businessType: 'consulting',
    country: 'United States',
    address: '123 Business Ave',
    city: 'San Francisco',
    postalCode: '94102',
    phone: '+1 (555) 123-4567',
    taxId: '12-3456789'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    webhookNotifications: true,
    paymentAlerts: true,
    securityAlerts: true,
    marketingEmails: false
  })

  const [personalInfo, setPersonalInfo] = useState({
    name: 'John Doe',
    email: 'john@acme.com',
    avatar: '',
    timezone: 'America/Los_Angeles',
    language: 'en'
  })

  const handleSave = async (section: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const updateBusinessProfile = (field: keyof BusinessProfile, value: string) => {
    setBusinessProfile(prev => ({ ...prev, [field]: value }))
  }

  const updateNotificationSetting = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your sBTC Gateway account and business settings
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-900 border shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <TabsList className="grid w-full grid-cols-4 max-w-lg bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="profile" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Profile</TabsTrigger>
                <TabsTrigger value="business" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Business</TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Notifications</TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Security</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">

              <TabsContent value="profile" className="mt-0">
                <Card className="bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={personalInfo.avatar} alt={personalInfo.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 text-xl">
                    {personalInfo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={personalInfo.timezone}
                    onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                      <SelectItem value="Europe/Berlin">CET</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={personalInfo.language}
                    onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('profile')} 
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

              <TabsContent value="business" className="mt-0">
                <Card className="bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessProfile.name}
                    onChange={(e) => updateBusinessProfile('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select 
                    value={businessProfile.businessType}
                    onValueChange={(value) => updateBusinessProfile('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS/Software</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={businessProfile.description}
                    onChange={(e) => updateBusinessProfile('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={businessProfile.website}
                    onChange={(e) => updateBusinessProfile('website', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={businessProfile.phone}
                    onChange={(e) => updateBusinessProfile('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessProfile.address}
                    onChange={(e) => updateBusinessProfile('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={businessProfile.city}
                    onChange={(e) => updateBusinessProfile('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={businessProfile.postalCode}
                    onChange={(e) => updateBusinessProfile('postalCode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={businessProfile.country}
                    onValueChange={(value) => updateBusinessProfile('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={businessProfile.taxId}
                    onChange={(e) => updateBusinessProfile('taxId', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('business')} 
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card className="bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => updateNotificationSetting('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Webhook Notifications</h4>
                    <p className="text-sm text-gray-500">Send notifications to your webhook endpoints</p>
                  </div>
                  <Switch
                    checked={notifications.webhookNotifications}
                    onCheckedChange={(checked) => updateNotificationSetting('webhookNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Payment Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified about successful payments</p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting('paymentAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Security Alerts</h4>
                    <p className="text-sm text-gray-500">Important security notifications</p>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting('securityAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Marketing Emails</h4>
                    <p className="text-sm text-gray-500">Product updates and tips</p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => updateNotificationSetting('marketingEmails', checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave('notifications')} 
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

              <TabsContent value="security" className="mt-0">
                <div className="space-y-6">
                  {/* Security Overview */}
                  <Card className="bg-white dark:bg-gray-900 border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        <span>Security Overview</span>
                      </CardTitle>
                      <CardDescription>
                        Quick security status and access to detailed security management
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Security Score */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <Shield className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Security Score</p>
                              <p className="text-lg font-bold text-green-600">85%</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Globe className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Sessions</p>
                              <p className="text-lg font-bold text-blue-600">2</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">API Keys</p>
                              <p className="text-lg font-bold text-gray-600 dark:text-gray-400">3</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Smartphone className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Two-Factor Auth</span>
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs">
                                  Disabled
                                </Badge>
                              </div>
                              <p className="text-xs text-orange-700 dark:text-orange-300">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
                              Enable
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Lock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Password</span>
                                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs">
                                  30 days old
                                </Badge>
                              </div>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                Last changed 30 days ago
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
                              Change
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Link to Full Security Page */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-5 w-5 text-orange-600" />
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">Advanced Security Management</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              View security events, manage active sessions, and access advanced security features
                            </p>
                          </div>
                          <Button 
                            onClick={() => router.push('/dashboard/security')}
                            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                          >
                            Open Security Center
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                        <CardHeader>
                          <CardTitle className="text-red-900 dark:text-red-100 text-base">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-red-900 dark:text-red-100">
                                Delete Account
                              </h5>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                Permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                              <Button variant="destructive" size="sm" className="mt-3">
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
