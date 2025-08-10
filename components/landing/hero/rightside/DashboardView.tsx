'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, ArrowUpRight, Eye, Bell, Bitcoin, BarChart3, Settings } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useAutoScroll } from '@/hooks/useAutoScroll'

const DashboardView = ({ tabIndex }: { tabIndex?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useAutoScroll(scrollRef, tabIndex)

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 72000 },
    { month: 'Jun', revenue: 85000 }
  ]

  const pieData = [
    { name: 'sBTC', value: 65, color: '#f97316' },
    { name: 'Lightning', value: 25, color: '#3b82f6' },
    { name: 'On-chain', value: 10, color: '#10b981' }
  ]

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{ 
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Dashboard</h3>
            <p className="text-sm text-gray-500">Your payment overview</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-blue-700">$85K</div>
            <div className="text-xs text-blue-600">This Month</div>
            <div className="text-xs text-green-600 mt-1">+12.5%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-700">750</div>
            <div className="text-xs text-green-600">Transactions</div>
            <div className="text-xs text-green-600 mt-1">+8.3%</div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-700 text-sm">Revenue Trend</h4>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Payment Methods</h4>
          <div className="space-y-2">
            {pieData.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {[
              { amount: '0.05 sBTC', status: 'completed', time: '2m ago', merchant: 'TechStore' },
              { amount: '0.12 sBTC', status: 'completed', time: '5m ago', merchant: 'CoffeeShop' },
              { amount: '0.08 sBTC', status: 'pending', time: '7m ago', merchant: 'BookStore' }
            ].map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{tx.amount}</div>
                    <div className="text-xs text-gray-500">{tx.merchant}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {tx.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{tx.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions - This will be revealed by auto-scroll */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Manage Settings</span>
            </button>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView