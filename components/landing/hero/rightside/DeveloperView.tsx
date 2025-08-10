'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Zap, 
  Shield, 
  Globe, 
  Clock, 
  Check, 
  Code, 
  ArrowRight,
  Terminal,
  BookOpen,
  Download
} from 'lucide-react'
import { useAutoScroll } from '@/hooks/useAutoScroll'

const DeveloperView = ({ tabIndex }: { tabIndex?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useAutoScroll(scrollRef, tabIndex)

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{ 
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Integration.tsx</div>
            <div className="text-xs text-gray-500">sBTC Payment Gateway</div>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 p-4 rounded-xl space-y-2 font-mono text-xs overflow-x-auto">
          <div className="text-purple-400">import</div>
          <div className="text-yellow-300">{'{ SbtcPayment }'}</div>
          <div className="text-gray-400">from</div>
          <div className="text-green-400">"@stackspay/react"</div>
          
          <div className="pt-3" />
          
          <div className="text-blue-400">{'<SbtcPayment'}</div>
          <div className="text-cyan-300 pl-4">amount={'{0.084}'}</div>
          <div className="text-cyan-300 pl-4">currency="sBTC"</div>
          <div className="text-cyan-300 pl-4">onSuccess={'{handleSuccess}'}</div>
          <div className="text-cyan-300 pl-4">apiKey="pk_test_..."</div>
          <div className="text-blue-400">{'/>'}</div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-4">Developer Features</h4>
          <div className="space-y-3">
            {[
              { icon: Zap, text: '3-line integration', color: 'text-yellow-600' },
              { icon: Shield, text: 'Enterprise security', color: 'text-green-600' },
              { icon: Globe, text: 'Global compatibility', color: 'text-blue-600' },
              { icon: Clock, text: 'Real-time webhooks', color: 'text-purple-600' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm text-gray-700">{feature.text}</span>
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* API Status */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">API Status: Online</span>
          </div>
          <div className="text-xs text-green-600 space-y-1">
            <div>• Response time: <span className="font-medium">45ms</span></div>
            <div>• Uptime: <span className="font-medium">99.9%</span></div>
            <div>• Testnet ready</div>
          </div>
        </div>

        {/* SDK Installation */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Quick Start</h4>
          <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs mb-3">
            <div className="text-gray-600">npm install @stackspay/react</div>
          </div>
          <div className="text-xs text-gray-500">
            Get started with sBTC payments in under 5 minutes
          </div>
        </div>

        {/* Documentation Links - Revealed by scroll */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-700 text-sm mb-3">Documentation</h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">API Reference</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Code Examples</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">SDK Downloads</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Main CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Code className="w-5 h-5" />
          <span>View Documentation</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Additional Resources */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Additional Resources</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">GitHub Repository</div>
                <div className="text-xs text-gray-500">Open source SDK and examples</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Discord Community</div>
                <div className="text-xs text-gray-500">Get help from developers</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Video Tutorials</div>
                <div className="text-xs text-gray-500">Step-by-step integration guides</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h4 className="font-semibold text-orange-700 text-sm mb-2">Need Help?</h4>
          <p className="text-xs text-orange-600 mb-3">
            Our developer support team is here to help you integrate sBTC payments.
          </p>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeveloperView