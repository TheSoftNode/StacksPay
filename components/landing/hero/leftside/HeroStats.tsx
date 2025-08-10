// 'use client'

// import { motion } from 'framer-motion'

// const HeroStats = () => {
//   const stats = [
//     {
//       value: '0.5%',
//       label: 'Transaction fee',
//       subtext: 'vs 2.9% with cards',
//       color: 'text-green-600'
//     },
//     {
//       value: '0',
//       label: 'Chargebacks',
//       subtext: 'Bitcoin finality',
//       color: 'text-blue-600'
//     },
//     {
//       value: '5min',
//       label: 'Setup time',
//       subtext: 'Start accepting sBTC',
//       color: 'text-purple-600'
//     },
//     {
//       value: '24/7',
//       label: 'Settlement',
//       subtext: 'No banking hours',
//       color: 'text-orange-600'
//     }
//   ]

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, delay: 0.9 }}
//       className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
//     >
//       {stats.map((stat, index) => (
//         <motion.div
//           key={stat.label}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
//           className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
//         >
//           <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2`}>
//             {stat.value}
//           </div>
//           <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
//             {stat.label}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">
//             {stat.subtext}
//           </div>
//         </motion.div>
//       ))}
//     </motion.div>
//   )
// }

// export default HeroStats

'use client'

import { motion } from 'framer-motion'

const HeroStats = () => {
  const stats = [
    { 
      value: '0.5%', 
      label: 'Transaction fee',
      gradient: 'from-emerald-500 to-green-600',
      glow: 'shadow-emerald-500/20'
    },
    { 
      value: '0', 
      label: 'Chargebacks',
      gradient: 'from-blue-500 to-cyan-600',
      glow: 'shadow-blue-500/20'
    },
    { 
      value: '5min', 
      label: 'Setup time',
      gradient: 'from-orange-500 to-red-500',
      glow: 'shadow-orange-500/20'
    },
    { 
      value: '24/7', 
      label: 'Settlement',
      gradient: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/20'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="flex items-center justify-between max-w-2xl gap-4 sm:gap-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.3 + index * 0.1,
            type: "spring",
            stiffness: 100 
          }}
          whileHover={{ 
            scale: 1.05,
            y: -2
          }}
          className={`relative text-center group cursor-default`}
        >
          {/* Animated background glow */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-xl blur-xl transition-all duration-300`}
            whileHover={{ scale: 1.2 }}
          />
          
          {/* Main content */}
          <div className="relative">
            <motion.div 
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent drop-shadow-sm`}
              whileHover={{ 
                textShadow: "0 0 20px rgba(249, 115, 22, 0.3)" 
              }}
            >
              {stat.value}
            </motion.div>
            <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
              {stat.label}
            </div>
          </div>

          {/* Subtle animated dot */}
          <motion.div
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HeroStats