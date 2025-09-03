'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Key, 
  CheckCircle, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Shield, 
  Code, 
  TestTube,
  Rocket,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OnboardingData } from '../MerchantOnboardingWizard'

interface ApiKeySetupStepProps {
  data: OnboardingData
  updateData: (section: keyof OnboardingData, updates: any) => void
  onComplete: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ApiKeySetupStep = ({ data, updateData, onComplete, isLoading, setIsLoading }: ApiKeySetupStepProps) => {
  const [showTestKey, setShowTestKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [keyGenerated, setKeyGenerated] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const apiKeys = data.apiKeys

  const generateApiKeys = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API key generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate test API key
      const testKey = `sk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      const webhookSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/api-keys', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: 'Default Test Key',
      //     permissions: ['read', 'write'],
      //     environment: 'test'
      //   })
      // })
      
      updateData('apiKeys', {
        testKey,
        webhookSecret,
        liveKey: '' // Will be generated after verification
      })
      
      setKeyGenerated(true)
    } catch (error) {
      console.error('Error generating API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleContinue = () => {
    if (keyGenerated && apiKeys.testKey) {
      onComplete()
    }
  }

  useEffect(() => {
    // Auto-generate keys when component mounts
    if (!apiKeys.testKey && !isLoading) {
      generateApiKeys()
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Generate Your API Keys
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          These keys allow your website to securely communicate with sBTC Gateway
        </p>
      </div>

      {/* Key Generation Status */}
      {isLoading && !keyGenerated ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Key className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </motion.div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Generating Your API Keys...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Creating secure credentials for your integration
            </p>
          </div>
        </motion.div>
      ) : keyGenerated ? (
        <div className="space-y-6">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-white dark:bg-gray-900 border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      API Keys Generated Successfully!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Your integration credentials are ready to use
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Keys Display */}
          <div className="grid grid-cols-1 gap-6">
            {/* Test API Key */}
            <Card className="bg-white dark:bg-gray-900 border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TestTube className="h-5 w-5 text-blue-600" />
                    <CardTitle>Test API Key</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      Test Mode
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Use this key for testing your integration. No real payments will be processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={showTestKey ? apiKeys.testKey : apiKeys.testKey.replace(/./g, '•')}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTestKey(!showTestKey)}
                    >
                      {showTestKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKeys.testKey, 'testKey')}
                    >
                      {copied === 'testKey' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Alert className="bg-white dark:bg-gray-900 border shadow-sm">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security:</strong> Treat your API keys like passwords. 
                    Never share them publicly or commit them to version control.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Webhook Secret */}
            <Card className="bg-white dark:bg-gray-900 border shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  <CardTitle>Webhook Secret</CardTitle>
                  <Badge variant="secondary">Optional</Badge>
                </div>
                <CardDescription>
                  Use this secret to verify webhook signatures and ensure events come from sBTC Gateway.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={showWebhookSecret ? apiKeys.webhookSecret : apiKeys.webhookSecret.replace(/./g, '•')}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKeys.webhookSecret, 'webhookSecret')}
                    >
                      {copied === 'webhookSecret' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Key Info */}
            <Card className="bg-white dark:bg-gray-900 border shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-orange-600" />
                  <CardTitle>Live API Key</CardTitle>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                    Coming Soon
                  </Badge>
                </div>
                <CardDescription>
                  Your live API key will be generated after completing verification and testing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>✓ Complete business verification</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>✓ Successfully process a test payment</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>✓ Configure webhook endpoints</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Quick Start */}
          <Card className="bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-200">
                Quick Integration Preview
              </CardTitle>
              <CardDescription>
                Here's how you'll use your API key in your code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{`// Your sBTC payment integration
import { SbtcPayment } from '@sbtc-gateway/react'

<SbtcPayment 
  apiKey="${apiKeys.testKey.substring(0, 20)}..."
  amount={0.001}
  currency="btc"
  onSuccess={handlePaymentSuccess}
/>`}</code>
                </pre>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Full integration guide in the next step
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              disabled={!keyGenerated}
              className="min-w-[200px] bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
            >
              <Code className="mr-2 h-4 w-4" />
              Continue to Integration
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <Button 
            size="lg"
            onClick={generateApiKeys}
            disabled={isLoading}
            className="min-w-[200px] bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
          >
            <Key className="mr-2 h-4 w-4" />
            Generate API Keys
          </Button>
        </div>
      )}
    </div>
  )
}

export default ApiKeySetupStep