// 'use client'

// import { motion, useScroll, useTransform } from 'framer-motion'
// import { useRef } from 'react'
// import SolutionsList from './SolutionsList'
// import SpectacularDemo from './SpectacularDemo'

// const ModularSolutionsSection = () => {
//     const containerRef = useRef<HTMLDivElement>(null)
//     const { scrollYProgress } = useScroll({
//         target: containerRef,
//         offset: ["start end", "end start"]
//     })

//     const y = useTransform(scrollYProgress, [0, 1], [100, -100])
//     const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

//     return (
//         <section ref={containerRef} className="relative py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden">
//             {/* Background Elements */}
//             <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]"
//                 style={{
//                     backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
//                     backgroundSize: '40px 40px, 40px 40px'
//                 }}
//             />

//             {/* Dark mode accent overlay */}
//             <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/5 dark:via-purple-900/5 dark:to-orange-900/5" />

//             {/* Floating geometric shapes */}
//             <motion.div
//                 className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl"
//                 animate={{
//                     scale: [1, 1.2, 1],
//                     opacity: [0.3, 0.6, 0.3],
//                 }}
//                 transition={{
//                     duration: 4,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                 }}
//             />

//             <motion.div
//                 className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
//                 animate={{
//                     scale: [1.2, 1, 1.2],
//                     opacity: [0.6, 0.3, 0.6],
//                 }}
//                 transition={{
//                     duration: 5,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                 }}
//             />

//             <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* Section Header */}
//                 <motion.div
//                     className="text-center mb-20"
//                     style={{ opacity, y }}
//                 >
//                     <motion.div
//                         className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium mb-6"
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                     >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
//                         </svg>
//                         Revolutionary Payment Solution
//                     </motion.div>

//                     <motion.h2
//                         className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
//                         initial={{ opacity: 0, y: 30 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.8, delay: 0.1 }}
//                     >
//                         The Complete{' '}
//                         <span className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
//                             sBTC Payment Ecosystem
//                         </span>
//                     </motion.h2>

//                     <motion.p
//                         className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
//                         initial={{ opacity: 0, y: 30 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.8, delay: 0.2 }}
//                     >
//                         Accept Bitcoin, STX, and sBTC payments with automatic conversion.
//                         Customers choose their preferred method while merchants always receive sBTC for instant settlement.
//                         No Stacks wallet required - inclusive for everyone.
//                     </motion.p>
//                 </motion.div>

//                 {/* Main Content Grid - Enterprise Layout */}
//                 <div className="grid lg:grid-cols-2 gap-16 items-start">
//                     {/* Left Column - Compact Solutions (No Scroll) */}
//                     <div className="lg:max-h-none">
//                         <SolutionsList />
//                     </div>

//                     {/* Right Column - Comprehensive Enterprise Demo */}
//                     <div className="lg:sticky lg:top-8">
//                         <SpectacularDemo />
//                     </div>
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default ModularSolutionsSection

'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import SolutionsList from './SolutionsList'
import SpectacularDemo from './SpectacularDemo'

const ModularSolutionsSection = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [100, -100])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={containerRef} className="relative py-32 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0">
                {/* Sophisticated grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 2px 2px, rgba(0,0,0,0.4) 1px, transparent 0),
                            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px, 60px 60px, 60px 60px'
                    }}
                />

                {/* Neural network overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.02] dark:opacity-[0.08]" viewBox="0 0 1000 1000">
                    <defs>
                        <pattern id="neuralNetwork" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                            <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.6" />
                            <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.4" />
                            <circle cx="150" cy="150" r="2" fill="currentColor" opacity="0.4" />
                            <circle cx="50" cy="150" r="1.5" fill="currentColor" opacity="0.3" />
                            <circle cx="150" cy="50" r="1.5" fill="currentColor" opacity="0.3" />
                            <line x1="100" y1="100" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                            <line x1="100" y1="100" x2="150" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                            <line x1="100" y1="100" x2="50" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                            <line x1="100" y1="100" x2="150" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#neuralNetwork)" />
                </svg>
            </div>

            {/* Dynamic floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large ambient orbs */}
                <motion.div
                    className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-400/15 via-amber-400/10 to-red-400/15 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <motion.div
                    className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 via-purple-400/10 to-indigo-400/15 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.6, 0.3, 0.6],
                        x: [0, -100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Smaller floating particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-4 h-4 rounded-full ${i % 3 === 0 ? 'bg-orange-400/20' :
                            i % 3 === 1 ? 'bg-purple-400/20' : 'bg-blue-400/20'
                            } blur-sm`}
                        style={{
                            left: `${10 + (i * 12)}%`,
                            top: `${15 + (i * 8)}%`,
                        }}
                        animate={{
                            scale: [0.5, 1, 0.5],
                            opacity: [0.3, 0.8, 0.3],
                            x: [0, Math.sin(i) * 50, 0],
                            y: [0, Math.cos(i) * 30, 0]
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 1.5
                        }}
                    />
                ))}
            </div>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent dark:from-transparent dark:via-black/20 dark:to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Sophisticated Section Header */}
                <motion.div
                    className="text-center mb-24"
                    style={{ opacity, y }}
                >
                    {/* Premium badge */}
                    <motion.div
                        className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-red-500/10 border border-orange-500/20 backdrop-blur-sm text-orange-600 dark:text-orange-400 text-sm font-bold mb-8"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{
                            boxShadow: [
                                '0 0 0 0 rgba(255,140,0,0.1)',
                                '0 0 0 20px rgba(255,140,0,0.05)',
                                '0 0 0 0 rgba(255,140,0,0.1)'
                            ],
                            borderColor: [
                                'rgba(255,140,0,0.2)',
                                'rgba(255,140,0,0.4)',
                                'rgba(255,140,0,0.2)'
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Enterprise Payment Revolution
                        <motion.div
                            className="ml-3 w-2 h-2 bg-orange-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>

                    {/* Main heading with sophisticated typography */}
                    <motion.h2
                        className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="block mb-2">The Complete</span>
                        <span className="relative">
                            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 bg-clip-text text-transparent">
                                sBTC Payment
                            </span>
                            <motion.div
                                className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 rounded-lg blur opacity-20"
                                animate={{
                                    opacity: [0.2, 0.4, 0.2],
                                    scale: [1, 1.02, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </span>
                        <span className="block mt-2">
                            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                                Ecosystem
                            </span>
                        </span>
                    </motion.h2>

                    {/* Enhanced description */}
                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                            Accept Bitcoin, STX, and sBTC payments with{' '}
                            <span className="text-orange-600 dark:text-orange-400 font-bold">automatic conversion</span>.
                            Customers choose their preferred method while merchants always receive{' '}
                            <span className="text-green-600 dark:text-green-400 font-bold">instant sBTC settlements</span>.
                        </p>

                        <motion.p
                            className="text-lg text-gray-500 dark:text-gray-400 font-medium"
                            animate={{
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            No Stacks wallet required • Inclusive for everyone • Enterprise-grade security
                        </motion.p>
                    </motion.div>

                    {/* Key metrics showcase */}
                    <motion.div
                        className="flex justify-center items-center space-x-8 mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {[
                            { value: '6s', label: 'Settlement', gradient: 'from-orange-500 to-red-500' },
                            { value: '99.97%', label: 'Success Rate', gradient: 'from-blue-500 to-purple-500' },
                            { value: '3+', label: 'Currencies', gradient: 'from-green-500 to-emerald-500' },
                            { value: '0%', label: 'Chargebacks', gradient: 'from-purple-500 to-pink-500' }
                        ].map((metric, index) => (
                            <motion.div
                                key={metric.label}
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
                                <div className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                                    {metric.value}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                    {metric.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Enhanced Main Content Layout */}
                <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                    {/* Left Column - Solutions List */}
                    <motion.div
                        className="lg:max-h-none space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Section sub-header */}
                        <div className="mb-8">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Enterprise Solutions
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                Comprehensive payment infrastructure designed for modern businesses
                            </p>
                        </div>

                        <SolutionsList />
                    </motion.div>

                    {/* Right Column - Enhanced Demo */}
                    <motion.div
                        className="lg:sticky lg:top-8"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <SpectacularDemo />
                    </motion.div>
                </div>

                {/* Bottom CTA Section */}
                <motion.div
                    className="text-center mt-24 pt-16 border-t border-gray-200 dark:border-gray-800"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Ready to Transform Your Payment Infrastructure?
                    </h3>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join leading enterprises already using our sBTC payment ecosystem to process millions in transactions daily.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,140,0,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Start Enterprise Trial
                        </motion.button>

                        <motion.button
                            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Schedule Demo
                        </motion.button>
                    </div>

                    {/* Trust indicators */}
                    <motion.div
                        className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400"
                        animate={{
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Enterprise Grade</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>24/7 Support</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>SOC 2 Compliant</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ModularSolutionsSection