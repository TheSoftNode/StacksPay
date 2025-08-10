'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  ChevronDown,
  Code, 
  BookOpen, 
  Zap, 
  Shield, 
  ArrowRight,
  ExternalLink,
  Database,
  GitBranch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '../shared/Logo'
import WalletConnectModal from '../payment/wallet/WalletConnectModal'
import ThemeToggle from '../shared/ThemeToggle'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800' 
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Logo size="md" showText={true} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Products */}
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium px-3 py-2"
                >
                  Products
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
                
                {/* Dropdown - Stacks style */}
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                  <div className="grid gap-3">
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Code className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Payment API</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accept sBTC payments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Payment Widgets</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Drop-in components</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Enterprise</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Custom solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developers */}
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium px-3 py-2"
                >
                  Developers
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
                
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-4">
                  <div className="grid gap-3">
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Documentation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Complete guides</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">API Reference</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Interactive docs</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">GitHub</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Open source</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium">
                Pricing
              </Button>
              
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium">
                Company
              </Button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium"
                onClick={() => setIsWalletModalOpen(true)}
              >
                Sign in
              </Button>
              
              <Button 
                className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-medium rounded-full px-6 transition-colors"
              >
                Start Building
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Theme Toggle */}
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-4"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Products</h3>
                  <div className="space-y-2 pl-4">
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Payment API</a>
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Payment Widgets</a>
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Enterprise</a>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Developers</h3>
                  <div className="space-y-2 pl-4">
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Documentation</a>
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">API Reference</a>
                    <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">GitHub</a>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => setIsWalletModalOpen(true)}
                  >
                    Sign in
                  </Button>
                  <Button className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full transition-colors">
                    Start Building
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  )
}

export default Navbar