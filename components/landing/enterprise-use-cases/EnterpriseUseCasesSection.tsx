'use client'

import { motion } from 'framer-motion'

const EnterpriseUseCasesSection = () => {
    return (
        <section className="relative py-32 bg-gradient-to-b from-gray-100 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.1) 0%, transparent 50%)`,
                }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Enterprise Integration
                    </motion.div>

                    <motion.h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Built for{' '}
                        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                            Enterprise Scale
                        </span>
                    </motion.h2>

                    <motion.p
                        className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Seamlessly integrate sBTC payments into your existing infrastructure with enterprise-grade reliability,
                        comprehensive APIs, and dedicated support for high-volume transactions.
                    </motion.p>
                </motion.div>

                {/* Use Cases Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            title: 'E-commerce Platforms',
                            description: 'Process thousands of daily transactions with automatic sBTC conversion and instant settlements.',
                            icon: '🛒',
                            features: ['High-volume processing', 'Multi-currency support', 'Real-time settlements'],
                            gradient: 'from-green-500 to-emerald-600'
                        },
                        {
                            title: 'SaaS Applications',
                            description: 'Integrate subscription billing with sBTC payments for global customer reach.',
                            icon: '☁️',
                            features: ['Recurring payments', 'Global accessibility', 'Developer-friendly APIs'],
                            gradient: 'from-blue-500 to-cyan-600'
                        },
                        {
                            title: 'Financial Services',
                            description: 'Build DeFi applications with instant sBTC liquidity and cross-chain functionality.',
                            icon: '🏦',
                            features: ['Cross-chain bridges', 'Liquidity pools', 'Smart contract integration'],
                            gradient: 'from-purple-500 to-pink-600'
                        }
                    ].map((useCase, index) => (
                        <motion.div
                            key={useCase.title}
                            className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} text-white text-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {useCase.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {useCase.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {useCase.description}
                            </p>

                            {/* Features */}
                            <ul className="space-y-2">
                                {useCase.features.map((feature, featureIndex) => (
                                    <motion.li
                                        key={featureIndex}
                                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                                    >
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                        <span>{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            {/* Hover effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </div>

                {/* Integration Showcase */}
                <motion.div
                    className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 text-white"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Code Example */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Simple Integration</h3>
                            <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm">
                                <div className="text-green-400">// Create payment in 3 lines</div>
                                <div className="text-blue-400">const</div> <span className="text-yellow-400">payment</span> = <span className="text-blue-400">await</span> <span className="text-purple-400">sbtc</span>.<span className="text-green-400">createPayment</span>({'{'}<br />
                                &nbsp;&nbsp;amount: <span className="text-orange-400">5000</span>, <span className="text-gray-500">// $50</span><br />
                                &nbsp;&nbsp;currency: <span className="text-orange-400">'USD'</span>,<br />
                                &nbsp;&nbsp;paymentMethods: [<span className="text-orange-400">'bitcoin'</span>, <span className="text-orange-400">'stx'</span>]<br />
                                {'}'});<br /><br />
                                <div className="text-green-400">// Customer pays, merchant gets sBTC instantly</div>
                            </div>
                        </div>

                        {/* Right: Benefits */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Why Enterprise Teams Choose Us</h3>
                            {[
                                { icon: '⚡', title: 'Lightning Fast', desc: '6-second STX settlements' },
                                { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 compliant infrastructure' },
                                { icon: '🌍', title: 'Global Reach', desc: 'No geographic restrictions' },
                                { icon: '📊', title: 'Real-time Analytics', desc: 'Comprehensive dashboards' }
                            ].map((benefit, index) => (
                                <motion.div
                                    key={benefit.title}
                                    className="flex items-center space-x-4"
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{benefit.title}</h4>
                                        <p className="text-gray-300">{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default EnterpriseUseCasesSection
