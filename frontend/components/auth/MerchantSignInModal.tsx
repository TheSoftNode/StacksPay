'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  Wallet, 
  Building2,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Logo from '@/components/shared/Logo'

interface MerchantSignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type SignInMethod = 'choice' | 'email' | 'wallet' | 'register'

interface WalletOption {
  id: string
  name: string
  description: string
  icon: string
  isRecommended?: boolean
  isNew?: boolean
}

const MerchantSignInModal = ({ isOpen, onClose }: MerchantSignInModalProps) => {
  const [currentView, setCurrentView] = useState<SignInMethod>('choice')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    website: '',
    agreeToTerms: false,
  })

  const walletOptions: WalletOption[] = [
    {
      id: 'hiro',
      name: 'Hiro Wallet',
      description: 'Most trusted for StacksPay Bitcoin payments',
      icon: '🟧',
      isRecommended: true
    },
    {
      id: 'xverse',
      name: 'Xverse',
      description: 'Bitcoin & Stacks wallet',
      icon: '🟣'
    },
    {
      id: 'leather',
      name: 'Leather',
      description: 'Open-source Stacks wallet',
      icon: '🟫',
      isNew: true
    }
    
  ]

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Email login logic here
      console.log('Email login:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Close modal on success
      onClose()
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWalletSignIn = async (walletId: string) => {
    setSelectedWallet(walletId)
    setLoading(true)
    setError('')
    
    try {
      // Connect wallet
      // const walletInfo = await walletService.connectWallet({
      //   name: 'StacksPay',
      //   icon: '/icons/stackspay-logo.png',
      // })

      if (true ) {
        // Generate challenge for wallet authentication
        // const challenge = walletAuthService.generateConnectionChallenge(walletInfo.address)
        
        // For demo purposes, assume wallet signing succeeds
        // In real implementation, this would prompt wallet signature
        // console.log(`Wallet ${walletId} connected with address: ${walletInfo.address}`)
        
        // Redirect to dashboard or wallet setup flow
        router.push('/dashboard/wallet-setup')
        onClose()
      }
    } catch (error) {
      setError('Wallet connection failed. Please try again.')
      console.error('Wallet connection error:', error)
    } finally {
      setLoading(false)
      setSelectedWallet(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setRegisterData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setRegisterData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (registerData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      if (!registerData.agreeToTerms) {
        throw new Error('Please agree to the terms of service')
      }

      // Register logic here
      console.log('Register:', registerData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Close modal on success
      onClose()
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', rememberMe: false })
    setRegisterData({ 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      businessType: '', 
      website: '', 
      agreeToTerms: false 
    })
    setError('')
    setShowPassword(false)
  }

  const handleBackToChoice = () => {
    setCurrentView('choice')
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] w-full mx-auto bg-white dark:bg-gray-900 border-0 shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[90vh] pt-10 flex flex-col">
        <DialogHeader className="p-4 sm:px-6 sm:py-2 pb-2 flex-shrink-0">
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" showText={true} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentView === 'choice' && 'Welcome to StacksPay'}
                {currentView === 'email' && 'Merchant Dashboard'}
                {currentView === 'wallet' && 'Connect Your Wallet'}
                {currentView === 'register' && 'Create Merchant Account'}
              </DialogTitle>
            </div>
            {currentView !== 'choice' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToChoice}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 ml-4"
              >
                ← Back
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentView === 'choice' && 'Choose how you\'d like to access your StacksPay merchant account'}
            {currentView === 'email' && 'Sign in to your StacksPay dashboard with your business credentials'}
            {currentView === 'wallet' && 'Connect your Stacks wallet for instant StacksPay setup'}
            {currentView === 'register' && 'Set up your StacksPay business account to start accepting sBTC payments'}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* Choice View */}
            {currentView === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Merchant Dashboard Option */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setCurrentView('email')}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 text-left group relative overflow-hidden"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          Merchant Dashboard
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          Business
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Sign in with email to access analytics, API keys, and payment management
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>API Management</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Analytics</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Webhooks</span>
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 transform translate-x-full group-hover:translate-x-[-150%] duration-700" />
                </motion.button>

                {/* Wallet Connect Option */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setCurrentView('wallet')}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 text-left group relative overflow-hidden"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          Quick Wallet Setup
                        </h3>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                          Instant
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Connect your Stacks wallet to start receiving sBTC payments immediately
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Instant Setup</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Auto API Keys</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Direct Payments</span>
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 transform translate-x-full group-hover:translate-x-[-150%] duration-700" />
                </motion.button>
              </motion.div>
            )}

            {/* Email Sign In View */}
            {currentView === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Business Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="merchant@yourcompany.com"
                        className="pl-10 pr-4 h-11"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your secure password"
                        className="pl-10 pr-12 h-11"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Keep me signed in</span>
                    </label>
                    
                    <button type="button" className="text-sm text-orange-600 hover:text-orange-500 hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !formData.email || !formData.password}
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Access Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setCurrentView('register')}
                      className="text-orange-600 hover:text-orange-500 font-medium hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Wallet Connect View */}
            {currentView === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {walletOptions.map((wallet, index) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleWalletSignIn(wallet.id)}
                      disabled={loading}
                      className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left group relative overflow-hidden ${
                        selectedWallet === wallet.id && loading
                          ? 'border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          {wallet.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 text-sm sm:text-base">
                              {wallet.name}
                            </h3>
                            {wallet.isRecommended && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full whitespace-nowrap">
                                Recommended
                              </span>
                            )}
                            {wallet.isNew && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full whitespace-nowrap">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {wallet.description}
                          </p>
                        </div>

                        <div className="flex items-center flex-shrink-0">
                          {loading && selectedWallet === wallet.id ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-orange-500 dark:border-orange-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform group-hover:translate-x-1" />
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 transform translate-x-full group-hover:translate-x-[-150%] duration-700" />
                    </button>
                  </motion.div>
                ))}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        New to Stacks?
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-3">
                        Get a Stacks wallet to receive sBTC payments directly
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-8"
                      >
                        Learn about wallets
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register View */}
            {currentView === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Business Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={registerData.name}
                        onChange={handleRegisterInputChange}
                        placeholder="Your Business Name"
                        className="h-11"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType" className="text-sm font-medium">
                        Business Type *
                      </Label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={registerData.businessType}
                        onChange={handleRegisterInputChange}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                      >
                        <option value="">Select business type</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="saas">SaaS/Software</option>
                        <option value="marketplace">Marketplace</option>
                        <option value="nonprofit">Non-profit</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">
                      Business Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        value={registerData.email}
                        onChange={handleRegisterInputChange}
                        placeholder="merchant@yourcompany.com"
                        className="pl-10 pr-4 h-11"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      Website (Optional)
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={registerData.website}
                      onChange={handleRegisterInputChange}
                      placeholder="https://yourcompany.com"
                      className="h-11"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={registerData.password}
                          onChange={handleRegisterInputChange}
                          placeholder="Create secure password"
                          className="pl-10 pr-12 h-11"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerData.confirmPassword}
                        onChange={handleRegisterInputChange}
                        placeholder="Confirm your password"
                        className="h-11"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      name="agreeToTerms"
                      type="checkbox"
                      checked={registerData.agreeToTerms}
                      onChange={handleRegisterInputChange}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      disabled={loading}
                      required
                    />
                    <label className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                      I agree to the{' '}
                      <button type="button" className="text-orange-600 hover:text-orange-500 hover:underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-orange-600 hover:text-orange-500 hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.businessType || !registerData.agreeToTerms}
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Create StacksPay Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setCurrentView('email')}
                      className="text-orange-600 hover:text-orange-500 font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Security Notice */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your data is protected with enterprise-grade security. We never store private keys.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MerchantSignInModal
