// 'use client'

// import { motion, useAnimation } from 'framer-motion'
// import { useEffect, useState } from 'react'
// import {
//     Bitcoin,
//     Zap,
//     Shield,
//     DollarSign,
//     ArrowRight,
//     CheckCircle,
//     Users,
//     Globe,
//     Lock,
//     TrendingUp,
//     Activity,
//     BarChart3,
//     Clock,
//     Wallet,
//     CreditCard,
//     ArrowUpDown,
//     Code,
//     Database,
//     Zap as ZapIcon,
//     Cpu,
//     Network,
//     Server
// } from 'lucide-react'

// const SpectacularDemo = () => {
//     const [currentFlow, setCurrentFlow] = useState(0)
//     const [currentHighlight, setCurrentHighlight] = useState('payments')
//     const controls = useAnimation()

//     const flows = [
//         {
//             id: 'customer-choice',
//             title: 'Customer Choice',
//             description: 'Choose your preferred payment method',
//             nodes: [
//                 { id: 'btc', label: 'Bitcoin', icon: Bitcoin, color: 'from-orange-500 to-yellow-500', time: '10-30 min', fee: '$1-5' },
//                 { id: 'stx', label: 'STX', icon: Zap, color: 'from-blue-500 to-purple-500', time: '6 seconds', fee: '$0.01' },
//                 { id: 'sbtc', label: 'sBTC', icon: Shield, color: 'from-green-500 to-emerald-500', time: 'Instant', fee: 'Minimal' }
//             ]
//         },
//         {
//             id: 'conversion',
//             title: 'Automatic Conversion',
//             description: 'All payments convert to sBTC for merchants',
//             nodes: [
//                 { id: 'gateway', label: 'Payment Gateway', icon: Shield, color: 'from-purple-500 to-indigo-500', status: 'Processing' },
//                 { id: 'sbtc', label: 'sBTC Output', icon: Shield, color: 'from-green-500 to-emerald-500', status: 'Ready' }
//             ]
//         },
//         {
//             id: 'merchant-benefits',
//             title: 'Merchant Benefits',
//             description: 'Instant settlement with flexible cashout options',
//             nodes: [
//                 { id: 'settlement', label: 'Instant Settlement', icon: CheckCircle, color: 'from-green-500 to-emerald-500', status: 'sBTC Received' },
//                 { id: 'conversion', label: 'USD Conversion', icon: DollarSign, color: 'from-blue-500 to-cyan-500', status: 'One-Click' },
//                 { id: 'withdrawal', label: 'Flexible Withdrawal', icon: TrendingUp, color: 'from-purple-500 to-pink-500', status: 'USD/USDC/sBTC' }
//             ]
//         }
//     ]

//     const highlights = [
//         {
//             id: 'payments',
//             title: 'Multi-Currency Engine',
//             icon: CreditCard,
//             color: 'from-orange-500 to-red-600',
//             metrics: [
//                 { label: 'Payment Methods', value: '3', unit: '' },
//                 { label: 'Settlement Time', value: '6s', unit: ' (STX)' },
//                 { label: 'Success Rate', value: '99.9', unit: '%' }
//             ]
//         },
//         {
//             id: 'wallet',
//             title: 'Universal Integration',
//             icon: Wallet,
//             color: 'from-blue-500 to-purple-600',
//             metrics: [
//                 { label: 'Supported Wallets', value: '4+', unit: '' },
//                 { label: 'Connection Time', value: '<2s', unit: '' },
//                 { label: 'Cross-Platform', value: '100', unit: '%' }
//             ]
//         },
//         {
//             id: 'conversion',
//             title: 'Instant Conversion',
//             icon: ArrowUpDown,
//             color: 'from-green-500 to-emerald-600',
//             metrics: [
//                 { label: 'Conversion Fee', value: '0.5', unit: '%' },
//                 { label: 'Settlement', value: '1-2', unit: ' days' },
//                 { label: 'Currencies', value: '4', unit: '' }
//             ]
//         },
//         {
//             id: 'developers',
//             title: 'Stripe-Compatible API',
//             icon: Code,
//             color: 'from-indigo-500 to-blue-600',
//             metrics: [
//                 { label: 'Response Time', value: '<200', unit: 'ms' },
//                 { label: 'Uptime', value: '99.9', unit: '%' },
//                 { label: 'SDKs', value: '3+', unit: '' }
//             ]
//         }
//     ]

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentFlow((prev) => (prev + 1) % flows.length)
//         }, 4000)

//         return () => clearInterval(interval)
//     }, [flows.length])

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentHighlight((prev) => {
//                 const currentIndex = highlights.findIndex(h => h.id === prev)
//                 const nextIndex = (currentIndex + 1) % highlights.length
//                 return highlights[nextIndex].id
//             })
//         }, 3000)

//         return () => clearInterval(interval)
//     }, [highlights.length])

//     useEffect(() => {
//         controls.start({
//             scale: [1, 1.02, 1],
//             transition: { duration: 0.5 }
//         })
//     }, [currentFlow, currentHighlight, controls])

//     const renderFlowNodes = (flow: any) => {
//         return (
//             <div className="relative">
//                 {/* Connection Lines */}
//                 <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
//                     {flow.nodes.map((node: any, index: number) => {
//                         if (index === flow.nodes.length - 1) return null

//                         const startX = 50 + (index * 150)
//                         const endX = 200 + (index * 150)
//                         const y = 150

//                         return (
//                             <g key={`line-${index}`}>
//                                 {/* Animated path */}
//                                 <motion.path
//                                     d={`M ${startX} ${y} Q ${(startX + endX) / 2} ${y - 30} ${endX} ${y}`}
//                                     stroke="url(#gradient)"
//                                     strokeWidth="3"
//                                     fill="none"
//                                     strokeDasharray="5,5"
//                                     initial={{ pathLength: 0, opacity: 0 }}
//                                     animate={{ pathLength: 1, opacity: 1 }}
//                                     transition={{ duration: 1.5, delay: index * 0.3 }}
//                                 />

//                                 {/* Animated dots along the path */}
//                                 <motion.circle
//                                     cx={startX + 75}
//                                     cy={y - 15}
//                                     r="3"
//                                     fill="url(#gradient)"
//                                     initial={{ scale: 0, opacity: 0 }}
//                                     animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
//                                     transition={{
//                                         duration: 2,
//                                         repeat: Infinity,
//                                         delay: index * 0.5,
//                                         ease: "easeInOut"
//                                     }}
//                                 />
//                             </g>
//                         )
//                     })}

//                     {/* Gradient definition */}
//                     <defs>
//                         <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                             <stop offset="0%" stopColor="#f97316" />
//                             <stop offset="50%" stopColor="#ef4444" />
//                             <stop offset="100%" stopColor="#8b5cf6" />
//                         </linearGradient>
//                     </defs>
//                 </svg>

//                 {/* Flow Nodes */}
//                 <div className="grid grid-cols-3 gap-8 relative z-10">
//                     {flow.nodes.map((node: any, index: number) => (
//                         <motion.div
//                             key={node.id}
//                             className="text-center"
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.6, delay: index * 0.2 }}
//                         >
//                             {/* Node Icon */}
//                             <motion.div
//                                 className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${node.color} text-white flex items-center justify-center shadow-lg`}
//                                 animate={{
//                                     scale: currentFlow === flows.indexOf(flow) ? [1, 1.1, 1] : 1,
//                                     rotate: currentFlow === flows.indexOf(flow) ? [0, 5, -5, 0] : 0
//                                 }}
//                                 transition={{ duration: 2, repeat: Infinity }}
//                             >
//                                 <node.icon className="w-8 h-8" />
//                             </motion.div>

//                             {/* Node Label */}
//                             <h4 className="text-sm font-bold text-white mb-1">
//                                 {node.label}
//                             </h4>

//                             {/* Node Details */}
//                             {node.time && (
//                                 <p className="text-xs text-gray-300 mb-1">
//                                     {node.time}
//                                 </p>
//                             )}
//                             {node.fee && (
//                                 <p className="text-xs text-gray-300 mb-1">
//                                     {node.fee}
//                                 </p>
//                             )}
//                             {node.status && (
//                                 <p className="text-xs text-green-400 font-medium">
//                                     {node.status}
//                                 </p>
//                             )}
//                         </motion.div>
//                     ))}
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <motion.div
//             className="relative space-y-8"
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//         >
//             {/* Demo Header */}
//             <div className="text-center">
//                 <motion.h3
//                     className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
//                     animate={{ opacity: [0.7, 1, 0.7] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                 >
//                     Live Enterprise Demo
//                 </motion.h3>
//                 <p className="text-gray-600 dark:text-gray-400">
//                     Comprehensive demonstration of the sBTC payment ecosystem
//                 </p>
//             </div>

//             {/* Main Flow Demo */}
//             <motion.div
//                 className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 overflow-hidden shadow-2xl"
//                 animate={controls}
//             >
//                 {/* Animated Background Elements */}
//                 <div className="absolute inset-0 opacity-20">
//                     <motion.div
//                         className="absolute top-4 left-4 w-3 h-3 bg-orange-400 rounded-full"
//                         animate={{
//                             scale: [1, 2, 1],
//                             opacity: [0.3, 0.8, 0.3],
//                         }}
//                         transition={{
//                             duration: 3,
//                             repeat: Infinity,
//                             ease: "easeInOut"
//                         }}
//                     />
//                     <motion.div
//                         className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full"
//                         animate={{
//                             scale: [1, 1.5, 1],
//                             opacity: [0.5, 1, 0.5],
//                         }}
//                         transition={{
//                             duration: 4,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                             delay: 1
//                         }}
//                     />
//                     <motion.div
//                         className="absolute bottom-6 left-1/2 w-2.5 h-2.5 bg-green-400 rounded-full"
//                         animate={{
//                             scale: [1, 2, 1],
//                             opacity: [0.4, 0.9, 0.4],
//                         }}
//                         transition={{
//                             duration: 3.5,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                             delay: 2
//                         }}
//                     />
//                 </div>

//                 {/* Current Flow Display */}
//                 <div className="relative z-10">
//                     <motion.div
//                         key={currentFlow}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5 }}
//                         className="text-center mb-6"
//                     >
//                         <h4 className="text-white text-lg font-semibold mb-2">
//                             {flows[currentFlow].title}
//                         </h4>
//                         <p className="text-gray-300 text-sm">
//                             {flows[currentFlow].description}
//                         </p>
//                     </motion.div>

//                     {/* Flow Visualization */}
//                     <div className="h-48">
//                         {renderFlowNodes(flows[currentFlow])}
//                     </div>
//                 </div>

//                 {/* Flow Navigation */}
//                 <div className="flex justify-center space-x-2 mt-6">
//                     {flows.map((_, index) => (
//                         <button
//                             key={index}
//                             onClick={() => setCurrentFlow(index)}
//                             className={`w-3 h-3 rounded-full transition-all duration-300 ${currentFlow === index
//                                 ? 'bg-orange-500 scale-125'
//                                 : 'bg-gray-600 hover:bg-gray-500'
//                                 }`}
//                         />
//                     ))}
//                 </div>
//             </motion.div>

//             {/* Solution Highlights Grid */}
//             <div className="grid grid-cols-2 gap-4">
//                 {highlights.map((highlight) => (
//                     <motion.div
//                         key={highlight.id}
//                         className={`relative p-4 rounded-2xl border-2 transition-all duration-500 ${currentHighlight === highlight.id
//                             ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-105 shadow-lg'
//                             : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600'
//                             }`}
//                         whileHover={{ scale: 1.02 }}
//                     >
//                         {/* Header */}
//                         <div className="flex items-center space-x-3 mb-3">
//                             <motion.div
//                                 className={`p-2 rounded-lg bg-gradient-to-br ${highlight.color} text-white`}
//                                 animate={{
//                                     scale: currentHighlight === highlight.id ? [1, 1.2, 1] : 1,
//                                     rotate: currentHighlight === highlight.id ? [0, 10, -10, 0] : 0
//                                 }}
//                                 transition={{ duration: 2, repeat: Infinity }}
//                             >
//                                 <highlight.icon className="w-4 h-4" />
//                             </motion.div>
//                             <h4 className="text-sm font-bold text-gray-900 dark:text-white">
//                                 {highlight.title}
//                             </h4>
//                         </div>

//                         {/* Metrics */}
//                         <div className="space-y-2">
//                             {highlight.metrics.map((metric, index) => (
//                                 <motion.div
//                                     key={index}
//                                     className="flex justify-between items-center text-xs"
//                                     initial={{ opacity: 0, x: -10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ duration: 0.4, delay: index * 0.1 }}
//                                 >
//                                     <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
//                                     <span className="font-bold text-gray-900 dark:text-white">
//                                         {metric.value}{metric.unit}
//                                     </span>
//                                 </motion.div>
//                             ))}
//                         </div>

//                         {/* Active Indicator */}
//                         {currentHighlight === highlight.id && (
//                             <motion.div
//                                 className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 transition={{ duration: 0.3 }}
//                             />
//                         )}
//                     </motion.div>
//                 ))}
//             </div>

//             {/* Real-time Activity Monitor */}
//             <motion.div
//                 className="bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 rounded-2xl p-6 text-white"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//             >
//                 <div className="flex items-center space-x-3 mb-4">
//                     <Activity className="w-5 h-5 text-cyan-400" />
//                     <h4 className="font-semibold">Real-time Activity Monitor</h4>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                     <div className="text-center">
//                         <motion.div
//                             className="text-2xl font-bold text-cyan-400"
//                             animate={{ scale: [1, 1.1, 1] }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                         >
//                             1,247
//                         </motion.div>
//                         <div className="text-xs text-gray-300">Active Payments</div>
//                     </div>

//                     <div className="text-center">
//                         <motion.div
//                             className="text-2xl font-bold text-green-400"
//                             animate={{ scale: [1, 1.1, 1] }}
//                             transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
//                         >
//                             $2.4M
//                         </motion.div>
//                         <div className="text-xs text-gray-300">Volume Today</div>
//                     </div>

//                     <div className="text-center">
//                         <motion.div
//                             className="text-2xl font-bold text-orange-400"
//                             animate={{ scale: [1, 1.1, 1] }}
//                             transition={{ duration: 2, repeat: Infinity, delay: 1 }}
//                         >
//                             6s
//                         </motion.div>
//                         <div className="text-xs text-gray-300">Avg. Settlement</div>
//                     </div>
//                 </div>
//             </motion.div>

//             {/* System Architecture Preview */}
//             <motion.div
//                 className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.3 }}
//             >
//                 <div className="flex items-center space-x-3 mb-4">
//                     <Server className="w-5 h-5 text-blue-400" />
//                     <h4 className="font-semibold text-white">System Architecture</h4>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                     <div className="text-center p-3 bg-white/10 rounded-lg">
//                         <Cpu className="w-6 h-6 text-green-400 mx-auto mb-2" />
//                         <div className="text-xs text-gray-300">sBTC Protocol</div>
//                     </div>

//                     <div className="text-center p-3 bg-white/10 rounded-lg">
//                         <Network className="w-6 h-6 text-blue-400 mx-auto mb-2" />
//                         <div className="text-xs text-gray-300">Multi-Chain</div>
//                     </div>

//                     <div className="text-center p-3 bg-white/10 rounded-lg">
//                         <Database className="w-6 h-6 text-purple-400 mx-auto mb-2" />
//                         <div className="text-xs text-gray-300">Real-time</div>
//                     </div>
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
// }

// export default SpectacularDemo

'use client'

import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
    Bitcoin,
    Zap,
    Shield,
    DollarSign,
    ArrowRight,
    CheckCircle,
    Users,
    Globe,
    Lock,
    TrendingUp,
    Activity,
    BarChart3,
    Clock,
    Wallet,
    CreditCard,
    ArrowUpDown,
    Code,
    Database,
    Cpu,
    Network,
    Server,
    Eye,
    Layers,
    Sparkles,
    Bolt
} from 'lucide-react'

const SpectacularDemo = () => {
    const [activeFlow, setActiveFlow] = useState(0)
    const [paymentProgress, setPaymentProgress] = useState(0)
    const [conversionStage, setConversionStage] = useState(0)
    const [liveMetrics, setLiveMetrics] = useState({
        volume: 2403847,
        transactions: 1247,
        avgSettlement: 6.2
    })
    const controls = useAnimation()

    // Enhanced flows with more sophisticated data
    const flows = [
        {
            id: 'customer-payment',
            title: 'Customer Payment Selection',
            subtitle: 'Multi-currency payment gateway',
            description: 'Customers choose their preferred cryptocurrency while the system automatically routes and converts to sBTC',
            phase: 'Input',
            nodes: [
                {
                    id: 'btc',
                    label: 'Bitcoin',
                    icon: Bitcoin,
                    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
                    time: '10-30 min',
                    fee: '$1-5',
                    networkLoad: 85,
                    status: 'active'
                },
                {
                    id: 'stx',
                    label: 'STX',
                    icon: Zap,
                    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
                    time: '6 seconds',
                    fee: '$0.01',
                    networkLoad: 12,
                    status: 'optimal'
                },
                {
                    id: 'sbtc',
                    label: 'sBTC',
                    icon: Shield,
                    gradient: 'from-emerald-500 via-green-500 to-teal-500',
                    time: 'Instant',
                    fee: 'Minimal',
                    networkLoad: 8,
                    status: 'instant'
                }
            ]
        },
        {
            id: 'processing-engine',
            title: 'Advanced Processing Engine',
            subtitle: 'Real-time conversion and validation',
            description: 'Our sophisticated engine processes all payment types and converts them into sBTC with enterprise-grade security',
            phase: 'Processing',
            nodes: [
                {
                    id: 'validation',
                    label: 'Validation Layer',
                    icon: Shield,
                    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
                    status: 'Verifying',
                    completion: 100
                },
                {
                    id: 'conversion',
                    label: 'Conversion Engine',
                    icon: ArrowUpDown,
                    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
                    status: 'Converting',
                    completion: 75
                },
                {
                    id: 'settlement',
                    label: 'sBTC Settlement',
                    icon: CheckCircle,
                    gradient: 'from-green-500 via-emerald-500 to-teal-500',
                    status: 'Ready',
                    completion: 0
                }
            ]
        },
        {
            id: 'merchant-dashboard',
            title: 'Merchant Settlement Dashboard',
            subtitle: 'Instant settlement with flexible options',
            description: 'Merchants receive sBTC instantly and can convert to various currencies or withdraw directly to their preferred destination',
            phase: 'Output',
            nodes: [
                {
                    id: 'settlement',
                    label: 'Instant Settlement',
                    icon: Bolt,
                    gradient: 'from-green-500 via-emerald-500 to-teal-500',
                    amount: '$2,847.50',
                    currency: 'sBTC'
                },
                {
                    id: 'conversion-options',
                    label: 'Conversion Hub',
                    icon: DollarSign,
                    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
                    options: ['USD', 'USDC', 'USDT']
                },
                {
                    id: 'withdrawal',
                    label: 'Multi-Channel Withdrawal',
                    icon: TrendingUp,
                    gradient: 'from-purple-500 via-pink-500 to-red-500',
                    channels: ['Bank', 'Wallet', 'Exchange']
                }
            ]
        }
    ]

    // Live data simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveMetrics(prev => ({
                volume: prev.volume + Math.floor(Math.random() * 1000),
                transactions: prev.transactions + Math.floor(Math.random() * 3),
                avgSettlement: 6.2 + (Math.random() - 0.5) * 0.5
            }))
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    // Flow rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFlow(prev => (prev + 1) % flows.length)
            setPaymentProgress(0)
            setConversionStage(0)
        }, 6000)

        return () => clearInterval(interval)
    }, [flows.length])

    // Progress simulation
    useEffect(() => {
        if (activeFlow === 1) { // Processing flow
            const interval = setInterval(() => {
                setConversionStage(prev => Math.min(prev + 1, 3))
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [activeFlow])

    useEffect(() => {
        const interval = setInterval(() => {
            setPaymentProgress(prev => (prev + 1) % 100)
        }, 100)

        return () => clearInterval(interval)
    }, [activeFlow])

    const renderFlowVisualization = (flow: any) => {
        return (
            <div className="relative h-80 overflow-hidden">
                {/* Advanced Background Grid */}
                <div className="absolute inset-0">
                    <svg className="w-full h-full opacity-20" viewBox="0 0 400 320">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Connection Network */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 320">
                    {flow.nodes.map((node: any, index: number) => {
                        if (index === flow.nodes.length - 1) return null

                        const startX = 50 + (index * 150)
                        const endX = 200 + (index * 150)
                        const y = 160

                        return (
                            <g key={`connection-${index}`}>
                                {/* Main connection line */}
                                <motion.path
                                    d={`M ${startX + 40} ${y} Q ${(startX + endX + 40) / 2} ${y - 40} ${endX} ${y}`}
                                    stroke="url(#flowGradient)"
                                    strokeWidth="2"
                                    fill="none"
                                    filter="url(#glow)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.8 }}
                                    transition={{ duration: 2, delay: index * 0.5 }}
                                />

                                {/* Data packets */}
                                <motion.circle
                                    cx={startX + 40}
                                    cy={y}
                                    r="4"
                                    fill="#f97316"
                                    filter="url(#glow)"
                                    initial={{ x: 0, opacity: 0 }}
                                    animate={{
                                        x: [0, endX - startX - 40],
                                        opacity: [0, 1, 1, 0],
                                        scale: [1, 1.5, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.3,
                                        ease: "easeInOut"
                                    }}
                                />

                                {/* Network activity indicators */}
                                <motion.circle
                                    cx={(startX + endX + 40) / 2}
                                    cy={y - 20}
                                    r="2"
                                    fill="#8b5cf6"
                                    animate={{
                                        scale: [0, 1.5, 0],
                                        opacity: [0, 0.8, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: index * 0.7
                                    }}
                                />
                            </g>
                        )
                    })}
                </svg>

                {/* Enhanced Flow Nodes */}
                <div className="relative z-10 h-full flex items-center justify-center">
                    <div className={`grid ${flow.nodes.length === 3 ? 'grid-cols-3' : 'grid-cols-3'} gap-12 w-full max-w-4xl px-8`}>
                        {flow.nodes.map((node: any, index: number) => (
                            <motion.div
                                key={node.id}
                                className="text-center"
                                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                            >
                                {/* Enhanced Node Container */}
                                <div className="relative">
                                    {/* Node Icon with Advanced Styling */}
                                    <motion.div
                                        className={`relative w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${node.gradient} text-white flex items-center justify-center shadow-2xl overflow-hidden`}
                                        animate={{
                                            scale: activeFlow === flows.indexOf(flow) ? [1, 1.1, 1] : 1,
                                            rotateY: activeFlow === flows.indexOf(flow) ? [0, 10, -10, 0] : 0,
                                            boxShadow: activeFlow === flows.indexOf(flow)
                                                ? ['0 10px 30px rgba(0,0,0,0.2)', '0 20px 60px rgba(255,140,0,0.4)', '0 10px 30px rgba(0,0,0,0.2)']
                                                : '0 10px 30px rgba(0,0,0,0.2)'
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <node.icon className="w-10 h-10 z-10" />

                                        {/* Animated background particles */}
                                        <div className="absolute inset-0">
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute w-1 h-1 bg-white rounded-full"
                                                    style={{
                                                        left: `${20 + i * 20}%`,
                                                        top: `${30 + i * 15}%`,
                                                    }}
                                                    animate={{
                                                        scale: [0, 1, 0],
                                                        opacity: [0, 0.8, 0],
                                                        x: [0, 10, 0],
                                                        y: [0, -10, 0]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        delay: i * 0.3,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Status indicator ring */}
                                        {activeFlow === flows.indexOf(flow) && (
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl border-2 border-white/30"
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                    rotate: [0, 360]
                                                }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Network Load Indicator (for payment options) */}
                                    {node.networkLoad && (
                                        <motion.div
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/80 text-white text-xs flex items-center justify-center font-bold"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.8, 1, 0.8]
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            {node.networkLoad}
                                        </motion.div>
                                    )}

                                    {/* Processing Completion Bar */}
                                    {node.completion !== undefined && (
                                        <motion.div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                animate={{ width: `${conversionStage > flows[1].nodes.indexOf(node) ? 100 : (conversionStage === flows[1].nodes.indexOf(node) ? node.completion : 0)}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Enhanced Node Information */}
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-white mb-1">
                                        {node.label}
                                    </h4>

                                    {/* Time & Fee Information */}
                                    {node.time && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Clock className="w-3 h-3 text-blue-400" />
                                            <span className="text-sm text-blue-400 font-medium">
                                                {node.time}
                                            </span>
                                        </div>
                                    )}

                                    {node.fee && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <DollarSign className="w-3 h-3 text-green-400" />
                                            <span className="text-sm text-green-400 font-medium">
                                                {node.fee}
                                            </span>
                                        </div>
                                    )}

                                    {/* Status Information */}
                                    {node.status && (
                                        <motion.div
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${node.status === 'active' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                                node.status === 'optimal' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                    node.status === 'instant' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                }`}
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                opacity: [0.8, 1, 0.8]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            {node.status}
                                        </motion.div>
                                    )}

                                    {/* Amount Information */}
                                    {node.amount && (
                                        <div className="text-xl font-bold text-green-400">
                                            {node.amount}
                                        </div>
                                    )}

                                    {/* Options or Channels */}
                                    {node.options && (
                                        <div className="flex justify-center space-x-1 mt-2">
                                            {node.options.map((option: string, idx: number) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                                                    {option}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {node.channels && (
                                        <div className="flex justify-center space-x-1 mt-2">
                                            {node.channels.map((channel: string, idx: number) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                                                    {channel}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Progress Wave Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-purple-500"
                        animate={{
                            x: ['-100%', '100%'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <motion.div
            className="relative space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
        >
            {/* Enhanced Demo Header */}
            <div className="text-center relative">
                <motion.div
                    className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 border border-orange-500/20 text-orange-400 text-sm font-bold mb-6 backdrop-blur-sm"
                    animate={{
                        boxShadow: ['0 0 0 0 rgba(255,140,0,0.4)', '0 0 0 10px rgba(255,140,0,0)', '0 0 0 0 rgba(255,140,0,0.4)'],
                        borderColor: ['rgba(255,140,0,0.2)', 'rgba(255,140,0,0.5)', 'rgba(255,140,0,0.2)']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Enterprise Payment Processing Demo
                </motion.div>

                <motion.h3
                    className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-3"
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    Live sBTC Payment Ecosystem
                </motion.h3>

                <p className="text-gray-400 text-lg font-medium">
                    Advanced demonstration of multi-currency payment processing
                </p>
            </div>

            {/* Main Flow Demonstration */}
            <motion.div
                className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800/50"
                animate={controls}
            >
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0">
                    {/* Animated mesh gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-purple-500/5 to-blue-500/5" />

                    {/* Floating orbs */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute w-32 h-32 rounded-full blur-3xl ${i % 3 === 0 ? 'bg-orange-500/10' :
                                i % 3 === 1 ? 'bg-purple-500/10' : 'bg-blue-500/10'
                                }`}
                            style={{
                                left: `${10 + (i * 15)}%`,
                                top: `${10 + (i * 12)}%`,
                            }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.7, 0.3],
                                x: [0, 30, 0],
                                y: [0, -20, 0]
                            }}
                            transition={{
                                duration: 8 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 1.2
                            }}
                        />
                    ))}

                    {/* Neural network pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                        <defs>
                            <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.5" />
                                <circle cx="20" cy="20" r="1" fill="currentColor" opacity="0.3" />
                                <circle cx="80" cy="30" r="1" fill="currentColor" opacity="0.4" />
                                <line x1="50" y1="50" x2="20" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                                <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#neural)" />
                    </svg>
                </div>

                <div className="relative z-10 p-8">
                    {/* Flow Header */}
                    <motion.div
                        key={activeFlow}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            <motion.div
                                className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {flows[activeFlow].phase}
                            </motion.div>

                            <div className="flex space-x-2">
                                {flows.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all duration-500 ${idx === activeFlow ? 'bg-orange-500 scale-125' : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <h4 className="text-2xl font-bold text-white mb-2">
                            {flows[activeFlow].title}
                        </h4>
                        <p className="text-orange-400 font-medium mb-2">
                            {flows[activeFlow].subtitle}
                        </p>
                        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                            {flows[activeFlow].description}
                        </p>
                    </motion.div>

                    {/* Flow Visualization */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFlow}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                        >
                            {renderFlowVisualization(flows[activeFlow])}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Enhanced System Metrics */}
            <div className="grid grid-cols-2 gap-6">
                {/* Real-time Performance Monitor */}
                <motion.div
                    className="bg-gradient-to-br from-blue-900/50 via-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <motion.div
                            className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Activity className="w-5 h-5 text-white" />
                        </motion.div>
                        <h4 className="font-bold text-white">Live Performance</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                            <motion.div
                                className="text-2xl font-bold text-cyan-400"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {liveMetrics.transactions.toLocaleString()}
                            </motion.div>
                            <div className="text-xs text-gray-400">Active Payments</div>
                            <motion.div
                                className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                    animate={{ width: [`${paymentProgress}%`, `${(paymentProgress + 10) % 100}%`] }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.div>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                            <motion.div
                                className="text-2xl font-bold text-green-400"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                ${(liveMetrics.volume / 1000000).toFixed(2)}M
                            </motion.div>
                            <div className="text-xs text-gray-400">Volume Today</div>
                            <motion.div
                                className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                    animate={{ width: ["60%", "85%", "60%"] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-4 text-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <motion.div
                            className="text-xl font-bold text-orange-400"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                            {liveMetrics.avgSettlement.toFixed(1)}s
                        </motion.div>
                        <div className="text-xs text-gray-400">Avg. Settlement Time</div>
                    </div>
                </motion.div>

                {/* System Architecture */}
                <motion.div
                    className="bg-gradient-to-br from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <motion.div
                            className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800"
                            animate={{
                                boxShadow: ['0 0 0 0 rgba(156,163,175,0.4)', '0 0 0 10px rgba(156,163,175,0)', '0 0 0 0 rgba(156,163,175,0.4)']
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Server className="w-5 h-5 text-white" />
                        </motion.div>
                        <h4 className="font-bold text-white">System Architecture</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Layers, label: 'sBTC Protocol', color: 'from-green-500 to-emerald-600', status: 'Online' },
                            { icon: Network, label: 'Multi-Chain', color: 'from-blue-500 to-purple-600', status: 'Active' },
                            { icon: Database, label: 'Real-time DB', color: 'from-purple-500 to-pink-600', status: '99.9%' },
                            { icon: Cpu, label: 'Processing', color: 'from-orange-500 to-red-600', status: 'Optimal' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="text-center p-3 rounded-xl bg-white/5 border border-white/10"
                                animate={{
                                    scale: [1, 1.02, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: idx * 0.5
                                }}
                            >
                                <motion.div
                                    className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: idx * 0.3 }}
                                >
                                    <item.icon className="w-5 h-5 text-white" />
                                </motion.div>
                                <div className="text-xs text-white font-medium mb-1">{item.label}</div>
                                <div className="text-xs text-green-400 font-bold">{item.status}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Interactive Flow Controls */}
            <motion.div
                className="flex justify-center space-x-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {flows.map((flow, index) => (
                    <button
                        key={flow.id}
                        onClick={() => setActiveFlow(index)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeFlow === index
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">{flow.phase}</span>
                            {activeFlow === index && (
                                <motion.div
                                    className="w-2 h-2 bg-white rounded-full"
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}
                        </div>
                    </button>
                ))}
            </motion.div>
        </motion.div>
    )
}

export default SpectacularDemo