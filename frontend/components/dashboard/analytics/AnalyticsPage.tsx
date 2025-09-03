'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight
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
import { cn } from '@/lib/utils'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    change: number
  }
  transactions: {
    current: number
    previous: number
    change: number
  }
  customers: {
    current: number
    previous: number
    change: number
  }
  avgTransaction: {
    current: number
    previous: number
    change: number
  }
}

const mockAnalytics: AnalyticsData = {
  revenue: {
    current: 12847.32,
    previous: 11456.28,
    change: 12.1
  },
  transactions: {
    current: 1453,
    previous: 1298,
    change: 11.9
  },
  customers: {
    current: 324,
    previous: 298,
    change: 8.7
  },
  avgTransaction: {
    current: 39.6,
    previous: 38.4,
    change: 3.1
  }
}

// Mock data for charts
const revenueData = [
  { date: 'Aug 1', revenue: 850, transactions: 45 },
  { date: 'Aug 3', revenue: 920, transactions: 52 },
  { date: 'Aug 5', revenue: 1100, transactions: 48 },
  { date: 'Aug 7', revenue: 980, transactions: 41 },
  { date: 'Aug 9', revenue: 1250, transactions: 55 },
  { date: 'Aug 11', revenue: 1180, transactions: 49 },
  { date: 'Aug 13', revenue: 1320, transactions: 62 },
  { date: 'Aug 15', revenue: 1450, transactions: 58 },
  { date: 'Aug 17', revenue: 1280, transactions: 53 },
  { date: 'Aug 18', revenue: 1380, transactions: 61 }
]

const paymentMethodsData = [
  { name: 'Leather Wallet', value: 45, count: 652 },
  { name: 'Xverse Wallet', value: 32, count: 465 },
  { name: 'Hiro Wallet', value: 18, count: 261 },
  { name: 'Other', value: 5, count: 75 }
]

const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#8b5cf6']

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics)
  const [timeRange, setTimeRange] = useState('30d')
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

  const MetricCard = ({ 
    title, 
    current, 
    previous, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string
    current: number
    previous: number
    change: number
    icon: any
    format?: 'number' | 'currency' | 'percentage'
  }) => {
    const isPositive = change > 0
    const formatValue = (value: number) => {
      switch (format) {
        case 'currency':
          return `$${value.toLocaleString()}`
        case 'percentage':
          return `${value}%`
        default:
          return value.toLocaleString()
      }
    }

    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {formatValue(current)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  vs {formatValue(previous)} last period
                </p>
              </div>
              
              <div className="ml-4">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className={cn(
                'flex items-center space-x-1 text-sm font-medium',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into your sBTC payment performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button 
            size="sm" 
            onClick={refreshData} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
          >
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
          current={analytics.revenue.current}
          previous={analytics.revenue.previous}
          change={analytics.revenue.change}
          icon={DollarSign}
          format="currency"
        />
        
        <MetricCard
          title="Transactions"
          current={analytics.transactions.current}
          previous={analytics.transactions.previous}
          change={analytics.transactions.change}
          icon={CreditCard}
        />
        
        <MetricCard
          title="Active Customers"
          current={analytics.customers.current}
          previous={analytics.customers.previous}
          change={analytics.customers.change}
          icon={Users}
        />
        
        <MetricCard
          title="Avg Transaction"
          current={analytics.avgTransaction.current}
          previous={analytics.avgTransaction.previous}
          change={analytics.avgTransaction.change}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="bg-white dark:bg-gray-900 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Revenue Trend</span>
            </CardTitle>
            <CardDescription>
              sBTC revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ea580c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-white dark:bg-gray-900 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              <span>Payment Methods</span>
            </CardTitle>
            <CardDescription>
              Distribution by wallet type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value}% (${props.payload.count} payments)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="space-y-2 mt-4">
              {paymentMethodsData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{entry.value}%</span>
                    <p className="text-xs text-gray-500">{entry.count} payments</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Customers */}
        <Card className="bg-white dark:bg-gray-900 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span>Top Customers</span>
            </CardTitle>
            <CardDescription>
              Highest spending customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Alice Johnson', amount: 2.5, transactions: 28 },
              { name: 'Bob Wilson', amount: 1.8, transactions: 15 },
              { name: 'Carol Smith', amount: 1.2, transactions: 22 },
            ].map((customer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.transactions} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {customer.amount} sBTC
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="bg-white dark:bg-gray-900 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span>Success Rate</span>
            </CardTitle>
            <CardDescription>
              Payment completion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                98.7%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                1,432 of 1,453 payments successful
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="text-green-600">1,432</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed</span>
                  <span className="text-red-600">21</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card className="bg-white dark:bg-gray-900 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Network Performance</span>
            </CardTitle>
            <CardDescription>
              Blockchain metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Block Time</span>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                10.2 min
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Network Fee</span>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                0.0001 sBTC
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confirmation Time</span>
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                2.3 min
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
