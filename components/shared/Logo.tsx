'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <motion.div 
      className={`flex items-center space-x-3 cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative">
        {/* Main Logo Container - Elegant for light/dark mode */}
        <div className={`${sizeClasses[size]} relative rounded-2xl bg-black dark:bg-white shadow-lg dark:shadow-white/10`}>
          <div className="w-full h-full flex items-center justify-center">
            {/* Custom sBTC Icon - Clean & Elegant */}
            <div className="relative">
              {/* Bitcoin S symbol */}
              <div className="text-white dark:text-black font-black text-lg leading-none">
                s₿
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Status Indicator - Subtle */}
        <motion.div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {showText && (
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className={`${textSizeClasses[size]} font-semibold text-gray-900 dark:text-white`}>
              StacksPay
            </h1>
            <div className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-200 dark:border-orange-800">
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">STACKS</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            sBTC payment gateway
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default Logo