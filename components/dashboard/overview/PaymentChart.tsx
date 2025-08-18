'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface PaymentChartProps {
  timeRange: string
}

interface ChartDataPoint {
  date: string
  value: number
  count: number
}

const generateMockData = (timeRange: string): ChartDataPoint[] => {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  const data: ChartDataPoint[] = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 5 + 0.5, // Random sBTC amount between 0.5 and 5.5
      count: Math.floor(Math.random() * 50) + 5 // Random count between 5 and 55
    })
  }
  
  return data
}

const PaymentChart = ({ timeRange }: PaymentChartProps) => {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData(timeRange))
      setLoading(false)
    }, 500)
  }, [timeRange])

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="h-64 relative">
      {/* Chart Area */}
      <div className="h-full flex items-end space-x-2 px-4 py-4">
        {data.map((point, index) => {
          const heightPercentage = (point.value / maxValue) * 100
          
          return (
            <motion.div
              key={index}
              className="flex-1 flex flex-col items-center group cursor-pointer"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 transform -translate-x-1/2">
                <div className="font-medium">{point.value.toFixed(3)} sBTC</div>
                <div className="text-gray-300 dark:text-gray-600">{point.count} payments</div>
                <div className="text-gray-400 dark:text-gray-500">{point.date}</div>
              </div>
              
              {/* Bar */}
              <motion.div
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm hover:from-orange-600 hover:to-orange-500 transition-colors origin-bottom"
                style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                whileHover={{ scaleY: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{maxValue.toFixed(2)}</span>
        <span>{(maxValue * 0.75).toFixed(2)}</span>
        <span>{(maxValue * 0.5).toFixed(2)}</span>
        <span>{(maxValue * 0.25).toFixed(2)}</span>
        <span>0</span>
      </div>

      {/* X-axis */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-200 dark:bg-gray-700" />
      
      {/* Legend */}
      <div className="absolute -bottom-8 left-4 right-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>sBTC Volume</span>
        <span>Hover for details</span>
      </div>
    </div>
  )
}

export default PaymentChart
