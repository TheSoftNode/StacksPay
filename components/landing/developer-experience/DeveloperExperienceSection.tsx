'use client'

import { motion } from 'framer-motion'

const DeveloperExperienceSection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Code pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px),
              linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating tech elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
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
            className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Developer Experience
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Built for{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 bg-clip-text text-transparent">
              Developers
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Experience the familiar Stripe-like API with the power of sBTC. Comprehensive SDKs, 
            real-time webhooks, and extensive documentation for rapid integration.
          </motion.p>
        </motion.div>

        {/* API Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Left: API Documentation */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Stripe-Compatible API
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you know Stripe, you already know our API. We've maintained 100% compatibility 
              while adding sBTC superpowers.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: '🔌', title: 'Familiar Endpoints', desc: 'Same routes, same parameters, same responses' },
                { icon: '📚', title: 'Multiple SDKs', desc: 'JavaScript, Python, PHP, Ruby, and more' },
                { icon: '⚡', title: 'Real-time Webhooks', desc: 'Instant notifications for all events' },
                { icon: '🧪', title: 'Sandbox Environment', desc: 'Test everything before going live' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-lg flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Code Examples */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Start Examples
            </h3>
            
            {/* JavaScript Example */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-2">JavaScript</span>
              </div>
              <div className="font-mono text-sm text-gray-300">
                <div className="text-blue-400">import</div> <span className="text-yellow-400">sbtc</span> <span className="text-blue-400">from</span> <span className="text-green-400">'@sbtc/sdk'</span><br/><br/>
                <span className="text-blue-400">const</span> <span className="text-yellow-400">payment</span> = <span className="text-blue-400">await</span> <span className="text-yellow-400">sbtc</span>.<span className="text-green-400">paymentIntents</span>.<span className="text-green-400">create</span>({'{'}<br/>
                &nbsp;&nbsp;amount: <span className="text-orange-400">5000</span>,<br/>
                &nbsp;&nbsp;currency: <span className="text-orange-400">'usd'</span>,<br/>
                &nbsp;&nbsp;payment_method_types: [<span className="text-orange-400">'bitcoin'</span>]<br/>
                {'}'});
              </div>
            </div>

            {/* Python Example */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-2">Python</span>
              </div>
              <div className="font-mono text-sm text-gray-300">
                <span className="text-blue-400">import</span> <span className="text-yellow-400">sbtc</span><br/><br/>
                <span className="text-yellow-400">sbtc</span>.<span className="text-green-400">api_key</span> = <span className="text-orange-400">'sk_test_...'</span><br/>
                <span className="text-blue-400">payment</span> = <span className="text-yellow-400">sbtc</span>.<span className="text-green-400">PaymentIntent</span>.<span className="text-green-400">create</span>(<br/>
                &nbsp;&nbsp;amount=<span className="text-orange-400">5000</span>,<br/>
                &nbsp;&nbsp;currency=<span className="text-orange-400">'usd'</span><br/>
                )
              </div>
            </div>
          </motion.div>
        </div>

        {/* SDK Showcase */}
        <motion.div
          className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-12 text-white mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Multi-Language SDKs</h3>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Choose your preferred language. All SDKs provide the same powerful features 
              with native language conventions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'JavaScript', icon: '⚡', color: 'from-yellow-500 to-orange-500', features: ['Node.js', 'Browser', 'TypeScript'] },
              { name: 'Python', icon: '🐍', color: 'from-blue-500 to-cyan-500', features: ['3.7+', 'Async', 'Django'] },
              { name: 'PHP', icon: '🐘', color: 'from-purple-500 to-pink-500', features: ['7.4+', 'Laravel', 'Composer'] },
              { name: 'Ruby', icon: '💎', color: 'from-red-500 to-pink-500', features: ['2.7+', 'Rails', 'Gem'] }
            ].map((sdk, index) => (
              <motion.div
                key={sdk.name}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sdk.color} text-white text-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {sdk.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{sdk.name}</h4>
                <div className="space-y-1">
                  {sdk.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="text-xs text-indigo-200">
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Documentation & Resources */}
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              title: 'API Reference',
              description: 'Complete endpoint documentation with examples and response schemas.',
              icon: '📖',
              color: 'from-blue-500 to-cyan-500',
              link: '#'
            },
            {
              title: 'Integration Guides',
              description: 'Step-by-step tutorials for popular frameworks and platforms.',
              icon: '🚀',
              color: 'from-green-500 to-emerald-500',
              link: '#'
            },
            {
              title: 'Community Support',
              description: 'Join our developer community for help, examples, and best practices.',
              icon: '👥',
              color: 'from-purple-500 to-pink-500',
              link: '#'
            }
          ].map((resource, index) => (
            <motion.div
              key={resource.title}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-xl">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resource.color} text-white text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {resource.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {resource.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {resource.description}
                </p>
                <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Learn more
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DeveloperExperienceSection
