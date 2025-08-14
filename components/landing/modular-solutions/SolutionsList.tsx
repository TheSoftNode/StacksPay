// 'use client'

// import { motion } from 'framer-motion'
// import { 
//   CreditCard, 
//   Wallet, 
//   ArrowUpDown,
//   Code,
//   ArrowRight,
//   CheckCircle
// } from 'lucide-react'
// import { useState, useEffect } from 'react'

// const SolutionsList = () => {
//   const [activeSolution, setActiveSolution] = useState('payments')

//   const solutions = [
//     {
//       id: 'payments',
//       title: 'Multi-Currency Payment Engine',
//       subtitle: 'Accept Bitcoin, STX, and sBTC with automatic conversion',
//       description: 'Seamlessly process payments in multiple cryptocurrencies. Customers choose their preferred method while merchants always receive sBTC for instant settlement.',
//       icon: CreditCard,
//       color: 'from-orange-500 to-red-600',
//       features: [
//         'Bitcoin payments (10-30 min)',
//         'STX payments (6 seconds)',
//         'Direct sBTC payments',
//         'Automatic sBTC conversion',
//         'Zero chargebacks'
//       ]
//     },
//     {
//       id: 'wallet',
//       title: 'Universal Wallet Integration',
//       subtitle: 'Connect any wallet or pay without one',
//       description: 'Support for all major Bitcoin and Stacks wallets, plus seamless wallet-less payments for newcomers. No Stacks wallet required at registration.',
//       icon: Wallet,
//       color: 'from-blue-500 to-purple-600',
//       features: [
//         'Xverse, Hiro, Leather support',
//         'Bitcoin wallet compatibility',
//         'Wallet-less payment options',
//         'Multi-signature security',
//         'Cross-platform accessibility'
//       ]
//     },
//     {
//       id: 'conversion',
//       title: 'Instant sBTC to USD Conversion',
//       subtitle: 'Convert and withdraw in multiple currencies',
//       description: 'Merchants receive sBTC instantly and can convert to USD, USDC, or USDT with one click. Direct withdrawal to any wallet or bank account.',
//       icon: ArrowUpDown,
//       color: 'from-green-500 to-emerald-600',
//       features: [
//         'sBTC → USD conversion',
//         'USDC/USDT withdrawal',
//         'Direct sBTC withdrawal',
//         'Real-time exchange rates',
//         '1-2 business day settlement'
//       ]
//     },
//     {
//       id: 'developers',
//       title: 'Stripe-Compatible API',
//       subtitle: 'Familiar developer experience with crypto benefits',
//       description: 'Build with confidence using our Stripe-like API. Comprehensive SDKs, real-time webhooks, and sandbox environment for seamless integration.',
//       icon: Code,
//       color: 'from-indigo-500 to-blue-600',
//       features: [
//         'Stripe-compatible endpoints',
//         'JavaScript, Python, PHP SDKs',
//         'Real-time webhooks',
//         'Comprehensive documentation',
//         'Sandbox testing environment'
//       ]
//     }
//   ]

//   // Auto-rotate through solutions to sync with demo
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveSolution((prev) => {
//         const currentIndex = solutions.findIndex(s => s.id === prev)
//         const nextIndex = (currentIndex + 1) % solutions.length
//         return solutions[nextIndex].id
//       })
//     }, 4000)

//     return () => clearInterval(interval)
//   }, [solutions.length])

//   return (
//     <motion.div
//       className="space-y-6"
//       initial={{ opacity: 0, x: -50 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.8, delay: 0.3 }}
//     >
//       {solutions.map((solution, index) => (
//         <motion.div
//           key={solution.id}
//           className={`group cursor-pointer transition-all duration-500 ${
//             activeSolution === solution.id 
//               ? 'ring-2 ring-orange-500 ring-opacity-50 bg-orange-50 dark:bg-orange-900/20 scale-[1.02] shadow-lg' 
//               : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:scale-[1.01]'
//           } rounded-xl p-5`}
//           onClick={() => setActiveSolution(solution.id)}
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 * index }}
//           whileHover={{ scale: 1.01 }}
//         >
//           <div className="flex items-start space-x-4">
//             <motion.div 
//               className={`p-3 rounded-xl bg-gradient-to-br ${solution.color} text-white`}
//               animate={{
//                 scale: activeSolution === solution.id ? [1, 1.1, 1] : 1,
//                 rotate: activeSolution === solution.id ? [0, 5, -5, 0] : 0
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//             >
//               <solution.icon className="w-5 h-5" />
//             </motion.div>

//             <div className="flex-1 min-w-0">
//               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
//                 {solution.title}
//               </h3>
//               <p className="text-orange-600 dark:text-orange-400 font-medium text-xs mb-2 line-clamp-1">
//                 {solution.subtitle}
//               </p>
//               <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
//                 {solution.description}
//               </p>

//               <div className="grid grid-cols-2 gap-1">
//                 {solution.features.slice(0, 4).map((feature, featureIndex) => (
//                   <motion.div
//                     key={featureIndex}
//                     className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400"
//                     initial={{ opacity: 0, x: -10 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.4, delay: 0.1 * featureIndex }}
//                   >
//                     <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
//                     <span className="line-clamp-1">{feature}</span>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             <motion.div
//               animate={{
//                 x: activeSolution === solution.id ? [0, 5, 0] : 0,
//                 opacity: activeSolution === solution.id ? 1 : 0.6
//               }}
//               transition={{ duration: 1, repeat: Infinity }}
//             >
//               <ArrowRight className={`w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors ${
//                 activeSolution === solution.id ? 'text-orange-500' : ''
//               }`} />
//             </motion.div>
//           </div>
//         </motion.div>
//       ))}

//       {/* Enterprise Stats Row */}
//       <motion.div
//         className="grid grid-cols-3 gap-4 mt-8"
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.5 }}
//       >
//         <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
//           <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">6s</div>
//           <div className="text-xs text-gray-600 dark:text-gray-400">STX Settlement</div>
//         </div>

//         <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
//           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
//           <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
//         </div>

//         <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
//           <div className="text-2xl font-bold text-green-600 dark:text-green-400">0%</div>
//           <div className="text-xs text-gray-600 dark:text-gray-400">Chargebacks</div>
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }

// export default SolutionsList

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Wallet,
  ArrowUpDown,
  Code,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

const SolutionsList = () => {
  const [activeSolution, setActiveSolution] = useState('payments')
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null)

  const solutions = [
    {
      id: 'payments',
      title: 'Multi-Currency Payment Engine',
      subtitle: 'Accept Bitcoin, STX, and sBTC with automatic conversion',
      description: 'Enterprise-grade payment processing that seamlessly handles multiple cryptocurrencies. Customers pay with their preferred method while merchants receive consistent sBTC settlements.',
      icon: CreditCard,
      color: 'from-orange-500 via-amber-500 to-red-600',
      accent: 'orange',
      metrics: { success: '99.97%', speed: '6s', volume: '$2.4M+' },
      features: [
        { text: 'Bitcoin Layer 1 payments', time: '10-30 min', icon: '₿' },
        { text: 'STX lightning settlements', time: '6 seconds', icon: '⚡' },
        { text: 'Direct sBTC transactions', time: 'Instant', icon: '🛡️' },
        { text: 'Automatic conversion engine', time: 'Real-time', icon: '🔄' },
        { text: 'Zero chargeback guarantee', time: 'Always', icon: '✓' }
      ]
    },
    {
      id: 'wallet',
      title: 'Universal Wallet Integration',
      subtitle: 'Connect any wallet or pay without one',
      description: 'Comprehensive wallet ecosystem supporting all major Bitcoin and Stacks wallets, plus innovative wallet-less payment flows for seamless user onboarding.',
      icon: Wallet,
      color: 'from-blue-500 via-indigo-500 to-purple-600',
      accent: 'blue',
      metrics: { wallets: '12+', connection: '<2s', compatibility: '100%' },
      features: [
        { text: 'Xverse & Hiro integration', type: 'Premium', icon: '🔗' },
        { text: 'Bitcoin wallet compatibility', type: 'Universal', icon: '₿' },
        { text: 'Wallet-less payment flows', type: 'Innovative', icon: '🚀' },
        { text: 'Multi-signature security', type: 'Enterprise', icon: '🔐' },
        { text: 'Cross-platform accessibility', type: 'Global', icon: '🌍' }
      ]
    },
    {
      id: 'conversion',
      title: 'Instant sBTC Conversion',
      subtitle: 'Convert and withdraw in multiple currencies',
      description: 'Advanced liquidity engine providing instant sBTC to fiat conversion with competitive rates and multiple withdrawal options for maximum flexibility.',
      icon: ArrowUpDown,
      color: 'from-emerald-500 via-green-500 to-teal-600',
      accent: 'emerald',
      metrics: { conversion: '0.5%', settlement: '1-2 days', currencies: '4+' },
      features: [
        { text: 'sBTC to USD conversion', rate: '0.5% fee', icon: '💵' },
        { text: 'USDC/USDT withdrawals', rate: 'Instant', icon: '🏦' },
        { text: 'Direct sBTC withdrawal', rate: 'No fee', icon: '🛡️' },
        { text: 'Real-time exchange rates', rate: 'Live', icon: '📊' },
        { text: 'Bank account settlement', rate: '1-2 days', icon: '🏛️' }
      ]
    },
    {
      id: 'developers',
      title: 'Stripe-Compatible API',
      subtitle: 'Familiar developer experience with crypto benefits',
      description: 'Production-ready API architecture with comprehensive SDKs, real-time webhooks, and extensive documentation for rapid integration and deployment.',
      icon: Code,
      color: 'from-violet-500 via-purple-500 to-indigo-600',
      accent: 'violet',
      metrics: { response: '<200ms', uptime: '99.9%', sdks: '5+' },
      features: [
        { text: 'Stripe-compatible endpoints', version: 'v2024', icon: '🔌' },
        { text: 'JavaScript, Python, PHP SDKs', version: 'Latest', icon: '📚' },
        { text: 'Real-time webhooks', version: 'v3', icon: '⚡' },
        { text: 'OpenAPI documentation', version: '3.0', icon: '📖' },
        { text: 'Sandbox testing environment', version: 'Full', icon: '🧪' }
      ]
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSolution((prev) => {
        const currentIndex = solutions.findIndex(s => s.id === prev)
        const nextIndex = (currentIndex + 1) % solutions.length
        return solutions[nextIndex].id
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [solutions.length])

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {solutions.map((solution, index) => (
        <motion.div
          key={solution.id}
          className={`group relative overflow-hidden transition-all duration-700 ease-out cursor-pointer ${activeSolution === solution.id
            ? 'ring-2 ring-orange-400/50 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 dark:from-gray-800 dark:via-orange-900/10 dark:to-amber-900/5 scale-[1.02] shadow-2xl'
            : 'hover:bg-gradient-to-br hover:from-white hover:via-gray-50/50 hover:to-gray-100/30 dark:hover:from-gray-800/50 dark:hover:via-gray-700/30 dark:hover:to-gray-600/10 hover:scale-[1.01] hover:shadow-lg'
            } rounded-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm`}
          onClick={() => setActiveSolution(solution.id)}
          onMouseEnter={() => setHoveredSolution(solution.id)}
          onMouseLeave={() => setHoveredSolution(null)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 * index }}
        >
          {/* Animated Background Gradient */}
          <AnimatePresence>
            {activeSolution === solution.id && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${solution.color} opacity-5`}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ x: '200%' }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}
          </AnimatePresence>

          <div className="relative p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <motion.div
                  className={`relative p-3 rounded-xl bg-gradient-to-br ${solution.color} text-white shadow-lg`}
                  animate={{
                    scale: activeSolution === solution.id ? [1, 1.1, 1] : 1,
                    boxShadow: activeSolution === solution.id
                      ? ['0 4px 20px rgba(0,0,0,0.1)', '0 8px 40px rgba(255,140,0,0.3)', '0 4px 20px rgba(0,0,0,0.1)']
                      : '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <solution.icon className="w-6 h-6" />

                  {/* Pulse ring for active state */}
                  {activeSolution === solution.id && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-white/30"
                      animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors">
                    {solution.title}
                  </h3>
                  <p className={`font-medium text-sm mb-2 transition-colors ${activeSolution === solution.id
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    {solution.subtitle}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>

              {/* Metrics Panel */}
              <motion.div
                className="flex flex-col space-y-1 text-right ml-4"
                animate={{
                  scale: activeSolution === solution.id ? 1.05 : 1,
                  opacity: activeSolution === solution.id ? 1 : 0.8
                }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(solution.metrics).map(([key, value], idx) => (
                  <motion.div
                    key={key}
                    className="text-xs"
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className={`font-bold ${activeSolution === solution.id
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-900 dark:text-white'
                      }`}>
                      {value}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 capitalize">{key}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-2 mb-4">
              <AnimatePresence mode="wait">
                {solution.features.slice(0, activeSolution === solution.id ? 5 : 3).map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{feature.icon}</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature.text}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {'time' in feature && feature.time && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                          {feature.time}
                        </span>
                      )}
                      {'type' in feature && feature.type && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                          {feature.type}
                        </span>
                      )}
                      {'rate' in feature && feature.rate && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                          {feature.rate}
                        </span>
                      )}
                      {'version' in feature && feature.version && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium">
                          {feature.version}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {[0, 1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${solutions.findIndex(s => s.id === activeSolution) === dot
                      ? 'bg-orange-500 w-6'
                      : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    animate={{
                      scale: solutions.findIndex(s => s.id === activeSolution) === dot ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                ))}
              </div>

              <motion.div
                className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
                animate={{
                  x: activeSolution === solution.id ? [0, 5, 0] : 0,
                  opacity: activeSolution === solution.id ? 1 : 0.7
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="font-medium">Explore</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          {/* Border glow effect */}
          {activeSolution === solution.id && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 0 1px rgba(255,140,0,0.1)',
                  '0 0 0 1px rgba(255,140,0,0.3)',
                  '0 0 0 1px rgba(255,140,0,0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}

      {/* Enterprise Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4 mt-8 p-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-2xl text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {[
          { value: '6s', label: 'Settlement', icon: Clock, color: 'text-orange-400' },
          { value: '99.97%', label: 'Uptime', icon: Shield, color: 'text-blue-400' },
          { value: '0%', label: 'Chargebacks', icon: TrendingUp, color: 'text-green-400' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-300 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default SolutionsList