'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Smartphone,
  Monitor,
  Shield,
  Zap,
  Info,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OnboardingData } from '../MerchantOnboardingWizard'

interface WalletSetupStepProps {
  data: OnboardingData
  updateData: (section: keyof OnboardingData, updates: any) => void
  onComplete: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const supportedWallets = [
  {
    name: 'Hiro Wallet',
    description: 'Official Stacks wallet with full sBTC support',
    icon: '🟠',
    downloadUrl: 'https://wallet.hiro.so',
    features: ['sBTC Support', 'Desktop & Mobile', 'Hardware Integration'],
    recommended: true
  },
  {
    name: 'Xverse',
    description: 'Bitcoin & Stacks wallet with sBTC functionality',
    icon: '⚡',
    downloadUrl: 'https://xverse.app',
    features: ['Multi-chain', 'Mobile First', 'NFT Support']
  },
  {
    name: 'Leather',
    description: 'Advanced Stacks wallet for power users',
    icon: '🔷',
    downloadUrl: 'https://leather.io',
    features: ['Advanced Features', 'Developer Tools', 'Multi-account']
  }
]

const WalletSetupStep = ({ data, updateData, onComplete, isLoading, setIsLoading }: WalletSetupStepProps) => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [walletAddress, setWalletAddress] = useState('')
  const [signature, setSignature] = useState('')
  const [challengeMessage, setChallengeMessage] = useState('')

  const walletInfo = data.walletInfo

  const generateChallenge = async () => {
    try {
      // Generate challenge message from backend
      const response = await fetch('/api/auth/wallet/challenge?address=' + walletAddress + '&type=connection')
      const challengeData = await response.json()
      
      if (challengeData.success) {
        setChallengeMessage(challengeData.challenge)
        return challengeData.challenge
      }
    } catch (error) {
      console.error('Error generating challenge:', error)
    }
    return null
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setConnectionStatus('connecting')

    try {
      // Check if Stacks wallet is available
      if (typeof window !== 'undefined' && (window as any).StacksProvider) {
        const stacks = (window as any).StacksProvider
        
        // Request wallet connection
        const response = await stacks.connect()
        
        if (response && response.address) {
          setWalletAddress(response.address)
          
          // Generate challenge message
          const challenge = await generateChallenge()
          if (!challenge) throw new Error('Failed to generate challenge')
          
          // Request signature
          const signatureResponse = await stacks.signMessage(challenge)
          
          if (signatureResponse && signatureResponse.signature) {
            setSignature(signatureResponse.signature)
            
            // Verify signature with backend
            const verifyResponse = await fetch('/api/auth/wallet/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address: response.address,
                signature: signatureResponse.signature,
                message: challenge,
                publicKey: signatureResponse.publicKey || response.publicKey,
                walletType: 'stacks'
              })
            })
            
            const verificationResult = await verifyResponse.json()
            
            if (verificationResult.success && verificationResult.verified) {
              // Update onboarding data
              updateData('walletInfo', {
                stacksAddress: response.address,
                bitcoinAddress: response.btcAddress || '',
                walletType: 'stacks',
                connected: true
              })
              
              setConnectionStatus('connected')
              onComplete()
            } else {
              throw new Error('Wallet signature verification failed')
            }
          }
        }
      } else {
        throw new Error('No Stacks wallet detected')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      setConnectionStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Connect Your Stacks Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your wallet is where you'll receive sBTC payments. Connect a Stacks wallet to continue.
        </p>
      </div>

      {/* Connection Status */}
      {connectionStatus === 'connected' && walletInfo.connected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Wallet Connected Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Address: {walletInfo.stacksAddress}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </CardTitle>
              <CardDescription>
                Connect your Stacks wallet to receive sBTC payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Button */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Wallet className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                
                <Button 
                  size="lg"
                  onClick={connectWallet}
                  disabled={isLoading || connectionStatus === 'connecting'}
                  className="min-w-[200px]"
                >
                  {connectionStatus === 'connecting' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Stacks Wallet
                    </>
                  )}
                </Button>

                {connectionStatus === 'error' && (
                  <Alert className="border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      Failed to connect wallet. Please make sure you have a Stacks wallet installed and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Supported Wallets */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Supported Wallets
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {supportedWallets.map((wallet, index) => (
                    <motion.div
                      key={wallet.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{wallet.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                  {wallet.name}
                                </h5>
                                {wallet.recommended && (
                                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {wallet.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {wallet.features.map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Get Wallet
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Your wallet private keys always remain in your control. 
              We only use your wallet address to send you payments - we never have access to your funds.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Need help setting up your wallet?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                We've created step-by-step guides for each supported wallet to help you get started quickly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Wallet Setup Guide
                </Button>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                  <Smartphone className="mr-2 h-3 w-3" />
                  Mobile Setup
                </Button>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                  <Monitor className="mr-2 h-3 w-3" />
                  Desktop Setup
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletSetupStep