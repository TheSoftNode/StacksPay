'use client'

import { motion } from 'framer-motion'

const HeroTitle = () => {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
      >
        Accept{' '}
        <span className="relative">
          <span className="text-orange-500">sBTC</span>
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-200 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
        </span>{' '}
        payments{' '}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="block lg:inline"
        >
          in minutes
        </motion.span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed"
      >
        The first payment gateway built for{' '}
        <span className="font-semibold text-gray-900 dark:text-white">sBTC</span>.
        Enable Bitcoin payments on your platform with a few lines of code.
        <span className="block mt-2 text-lg text-gray-500">
          Zero chargebacks. Global reach. Instant settlement.
        </span>
      </motion.p>
    </div>
  )
}

export default HeroTitle