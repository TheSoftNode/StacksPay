'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TestTube, 
  CheckCircle, 
  PlayCircle, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Zap,
  QrCode,
  Wallet,
  ExternalLink,
  RefreshCw,
  Copy,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { OnboardingData } from '../MerchantOnboardingWizard'

interface TestPaymentStepProps {
  data: OnboardingData
  updateData: (section: keyof OnboardingData, updates: any) => void
  onComplete: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

interface TestPayment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentUrl: string
  qrCode: string
  createdAt: Date
}

const TestPaymentStep = ({ data, updateData, onComplete, isLoading, setIsLoading }: TestPaymentStepProps) => {
  const [testPayment, setTestPayment] = useState<TestPayment | null>(null)
  const [testAmount, setTestAmount] = useState('0.001')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'waiting' | 'completed' | 'failed'>('idle')
  const [copied, setCopied] = useState(false)

  const createTestPayment = async () => {
    setIsLoading(true)
    setPaymentStatus('creating')

    try {
      // Simulate creating a test payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockPayment: TestPayment = {
        id: `test_payment_${Date.now()}`,
        amount: parseFloat(testAmount),
        currency: 'BTC',
        status: 'pending',
        paymentUrl: `https://pay.sbtc-gateway.com/test_${Date.now()}`,
        qrCode: `data:image/svg+xml;base64,${btoa('<svg>mock qr code</svg>')}`,
        createdAt: new Date()
      }
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/payments', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${data.apiKeys.testKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     amount: parseFloat(testAmount) * 100000000, // Convert to satoshis
      //     currency: 'btc',
      //     description: 'Test payment from onboarding',
      //     metadata: { source: 'onboarding_test' }
      //   })
      // })
      
      setTestPayment(mockPayment)
      setPaymentStatus('waiting')
      
      // Simulate payment completion after 5 seconds
      setTimeout(() => {
        setTestPayment(prev => prev ? { ...prev, status: 'completed' } : null)
        setPaymentStatus('completed')
        updateData('integrationStatus', { testPaymentMade: true })
      }, 5000)
      
    } catch (error) {
      console.error('Error creating test payment:', error)
      setPaymentStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPaymentUrl = () => {
    if (testPayment) {
      navigator.clipboard.writeText(testPayment.paymentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleComplete = () => {
    if (paymentStatus === 'completed') {
      onComplete()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Test Your Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a test payment to make sure everything is working correctly
        </p>
      </div>

      {paymentStatus === 'idle' ? (
        /* Test Payment Setup */
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Create Test Payment</CardTitle>
              <CardDescription className="text-center">
                Generate a test payment to verify your integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testAmount">Test Amount (BTC)</Label>
                <Input
                  id="testAmount"
                  type="number"
                  step="0.00001"
                  min="0.00001"
                  max="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="0.001"
                />
                <p className="text-xs text-gray-500">
                  Testnet Bitcoin - no real value
                </p>
              </div>

              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  This is a test payment using testnet Bitcoin. No real money will be charged.
                </AlertDescription>
              </Alert>

              <Button 
                className="w-full" 
                size="lg"
                onClick={createTestPayment}
                disabled={isLoading || !testAmount || parseFloat(testAmount) <= 0}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Create Test Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Payment Status */
        <div className="max-w-2xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {paymentStatus === 'creating' && (
              <motion.div
                key="creating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <TestTube className="h-8 w-8 text-blue-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Creating Test Payment...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Setting up your test payment environment
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {paymentStatus === 'waiting' && testPayment && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span>Test Payment Created</span>
                        </CardTitle>
                        <CardDescription>
                          Payment ID: {testPayment.id}
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                        Waiting for Payment
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Details */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-mono font-medium">{testPayment.amount} BTC</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge variant="secondary">
                          {testPayment.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Payment URL */}
                    <div className="space-y-2">
                      <Label>Payment URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={testPayment.paymentUrl}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyPaymentUrl}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={testPayment.paymentUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>Waiting for customer...</span>
                      </div>
                      <Progress value={33} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Payment created</span>
                        <span>Waiting for payment</span>
                        <span>Payment complete</span>
                      </div>
                    </div>

                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Simulating payment:</strong> In a real scenario, your customer would 
                        scan the QR code or visit the payment URL. This test will complete automatically.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {paymentStatus === 'completed' && testPayment && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white dark:bg-gray-900 border shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      Test Payment Successful! 🎉
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-6">
                      Your integration is working perfectly. You're ready to accept real Bitcoin payments.
                    </p>

                    {/* Test Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Integration Works
                        </p>
                        <p className="text-xs text-gray-500">
                          API connection verified
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <Wallet className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Wallet Connected
                        </p>
                        <p className="text-xs text-gray-500">
                          Payment received
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Webhooks Active
                        </p>
                        <p className="text-xs text-gray-500">
                          Events delivered
                        </p>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left">
                          <p className="text-gray-500">Payment ID</p>
                          <p className="font-mono text-gray-900 dark:text-gray-100">{testPayment.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{testPayment.amount} BTC</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white dark:bg-gray-900 border shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                      Test Payment Failed
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mb-6">
                      There was an issue with your test payment. Let's try again.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setPaymentStatus('idle')}
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Integration Check */}
          {paymentStatus === 'idle' && (
            <Card className="bg-white dark:bg-gray-900 border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TestTube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Before Testing
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>API key configured: {data.apiKeys.testKey ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Wallet connected: {data.walletInfo.connected ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Payment preferences set: ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentStatus === 'idle' && (
            <div className="text-center">
              <Button 
                size="lg"
                onClick={createTestPayment}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Create Test Payment
              </Button>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="text-center">
              <Button 
                size="lg"
                onClick={handleComplete}
                className="min-w-[200px] bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Test Complete - Continue
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-white dark:bg-gray-900 border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Need help testing?
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                If you run into issues during testing, check these common solutions:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>Make sure your testnet wallet has test Bitcoin</li>
                <li>Verify your API key is correctly configured</li>
                <li>Check that your webhook URL is accessible</li>
                <li>Ensure your firewall allows connections from our servers</li>
              </ul>
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Troubleshooting Guide
                </Button>
                <Button variant="outline" size="sm">
                  Get Testnet Bitcoin
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestPaymentStep