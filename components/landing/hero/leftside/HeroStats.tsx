'use client'

import { motion } from 'framer-motion'

const HeroStats = () => {
  const stats = [
    {
      value: '0.5%',
      label: 'Transaction fee',
      subtext: 'vs 2.9% with cards',
      color: 'text-green-600'
    },
    {
      value: '0',
      label: 'Chargebacks',
      subtext: 'Bitcoin finality',
      color: 'text-blue-600'
    },
    {
      value: '5min',
      label: 'Setup time',
      subtext: 'Start accepting sBTC',
      color: 'text-purple-600'
    },
    {
      value: '24/7',
      label: 'Settlement',
      subtext: 'No banking hours',
      color: 'text-orange-600'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}>
            {stat.value}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {stat.label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stat.subtext}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HeroStats