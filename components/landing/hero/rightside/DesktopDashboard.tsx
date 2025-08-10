'use client'

import Logo from '@/components/shared/Logo'
import { motion } from 'framer-motion'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const DesktopDashboard = () => {
  const dailyData = [
    { time: '12:00 AM', volume: 12500 },
    { time: '4:00 AM', volume: 8200 },
    { time: '8:00 AM', volume: 25600 },
    { time: '12:00 PM', volume: 42800 },
    { time: '4:00 PM', volume: 38200 },
    { time: '8:00 PM', volume: 31500 },
    { time: 'Now, 2:00 PM', volume: 39274 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="hidden lg:block w-[600px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mr-12"
    >
      {/* Desktop Header */}
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center"> */}
              <Logo size="md" showText={false} />
            {/* </div> */}
            <div>
              <h3 className="text-xl font-bold text-gray-900">StacksPay Analytics</h3>
              <p className="text-gray-600 text-sm">Real-time payment dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="p-6 h-full">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">$3.5M</div>
            <div className="text-sm text-blue-600">Net Volume</div>
            <div className="text-xs text-green-600 mt-1">+32.8%</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-700">2,847</div>
            <div className="text-sm text-green-600">Transactions</div>
            <div className="text-xs text-green-600 mt-1">Updated today</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">374</div>
            <div className="text-sm text-purple-600">Active Users</div>
            <div className="text-xs text-gray-500 mt-1">Last 24h</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
            <div className="text-2xl font-bold text-orange-700">$39K</div>
            <div className="text-sm text-orange-600">Sales Revenue</div>
            <div className="text-xs text-gray-500 mt-1">vs $29,573</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 h-48">
          <h4 className="font-semibold text-gray-900 mb-4">Net volume from sales</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#desktopGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

export default DesktopDashboard