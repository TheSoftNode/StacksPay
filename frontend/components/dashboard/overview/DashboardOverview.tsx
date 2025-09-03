'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MetricCard from './MetricCard'
import QuickActions from './QuickActions'
import RecentPayments from './RecentPayments'
import PaymentChart from './PaymentChart'

interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalPayments: number
  paymentsChange: number
  successRate: number
  successRateChange: number
  activeCustomers: number
  customersChange: number
}

const mockStats: DashboardStats = {
  totalRevenue: 12847.32,
  revenueChange: 12.5,
  totalPayments: 1453,
  paymentsChange: 8.2,
  successRate: 98.7,
  successRateChange: 0.3,
  activeCustomers: 324,
  customersChange: -2.1,
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [timeRange])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your sBTC payment performance and business metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button size="sm" onClick={refreshData} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Activity className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={DollarSign}
          description="Revenue in USD equivalent"
          loading={loading}
        />
        
        <MetricCard
          title="Total Payments"
          value={stats.totalPayments.toLocaleString()}
          change={stats.paymentsChange}
          icon={CreditCard}
          description="Successful payments"
          loading={loading}
        />
        
        <MetricCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          change={stats.successRateChange}
          icon={TrendingUp}
          description="Payment success rate"
          loading={loading}
        />
        
        <MetricCard
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          change={stats.customersChange}
          icon={Users}
          description="Customers with recent activity"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Chart */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Volume</CardTitle>
                  <CardDescription>
                    sBTC payments over time
                  </CardDescription>
                </div>
                <Tabs defaultValue="volume" className="w-auto">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="volume">Volume</TabsTrigger>
                    <TabsTrigger value="count">Count</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <PaymentChart timeRange={timeRange} />
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>
                    Latest transactions from your customers
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RecentPayments />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Network Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stacks Network</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bitcoin Network</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Operational
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">sBTC Bridge</span>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Testnet
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated</span>
                  <span>2 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Overview */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Balance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
                  <span className="font-medium">2.847 sBTC</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending Settlements</span>
                  <span className="font-medium">0.125 sBTC</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">USD Equivalent</span>
                  <span className="font-medium">$12,847.32</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" size="sm" className="w-full">
                  Withdraw Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
