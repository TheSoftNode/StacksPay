'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Shield, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WalletOption {
  id: string
  name: string
  description: string
  icon: string
  isRecommended?: boolean
  isNew?: boolean
}

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const walletOptions: WalletOption[] = [
    {
      id: 'hiro',
      name: 'Hiro Wallet',
      description: 'The most trusted Stacks wallet',
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
    },
    {
      id: 'asigna',
      name: 'Asigna',
      description: 'Multi-signature wallet',
      icon: '🔷'
    }
  ]

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId)
    setIsConnecting(true)
    
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would integrate with actual wallet SDKs
    console.log(`Connecting to ${walletId}`)
    
    setIsConnecting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Connect your wallet
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Connect your Stacks wallet to manage your payment gateway
          </p>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="space-y-3">
            {walletOptions.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleWalletSelect(wallet.id)}
                  disabled={isConnecting}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group relative overflow-hidden ${
                    selectedWallet === wallet.id && isConnecting
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                      {wallet.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                          {wallet.name}
                        </h3>
                        {wallet.isRecommended && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            Recommended
                          </span>
                        )}
                        {wallet.isNew && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {wallet.description}
                      </p>
                    </div>

                    <div className="flex items-center">
                      {isConnecting && selectedWallet === wallet.id ? (
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>

                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -skew-x-12 transform translate-x-full group-hover:translate-x-[-150%] duration-700" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* New to Stacks section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5">
                <Wallet className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  New to Stacks?
                </h4>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  Set up your merchant account to start accepting sBTC payments
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs border-gray-200 hover:border-gray-300"
                >
                  Learn about wallets
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                Your wallet stays secure. We never store your private keys.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WalletConnectModal