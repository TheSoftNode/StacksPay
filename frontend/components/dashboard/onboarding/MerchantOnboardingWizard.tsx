'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Building, 
  Wallet, 
  CreditCard, 
  Key, 
  Code, 
  TestTube, 
  Rocket,
  ArrowRight,
  ArrowLeft,
  Star,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Step Components
import WelcomeStep from './steps/WelcomeStep'
import BusinessInfoStep from './steps/BusinessInfoStep'
import WalletSetupStep from './steps/WalletSetupStep'
import PaymentPreferencesStep from './steps/PaymentPreferencesStep'
import ApiKeySetupStep from './steps/ApiKeySetupStep'
import IntegrationGuideStep from './steps/IntegrationGuideStep'
import TestPaymentStep from './steps/TestPaymentStep'
import GoLiveStep from './steps/GoLiveStep'

export interface OnboardingData {
  businessInfo: {
    name: string
    description: string
    businessType: string
    website: string
    country: string
    address: string
    city: string
    postalCode: string
    phone: string
    taxId: string
  }
  walletInfo: {
    stacksAddress: string
    bitcoinAddress: string
    walletType: string
    connected: boolean
  }
  paymentPreferences: {
    acceptBitcoin: boolean
    acceptSTX: boolean
    acceptSBTC: boolean
    preferredCurrency: 'sbtc' | 'usd' | 'usdt'
    autoConvertToUSD: boolean
    settlementFrequency: 'instant' | 'daily' | 'weekly'
  }
  apiKeys: {
    testKey: string
    liveKey: string
    webhookSecret: string
  }
  integrationStatus: {
    codeGenerated: boolean
    testPaymentMade: boolean
    webhooksConfigured: boolean
    readyForLive: boolean
  }
}

const initialData: OnboardingData = {
  businessInfo: {
    name: '',
    description: '',
    businessType: '',
    website: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    taxId: ''
  },
  walletInfo: {
    stacksAddress: '',
    bitcoinAddress: '',
    walletType: '',
    connected: false
  },
  paymentPreferences: {
    acceptBitcoin: true,
    acceptSTX: true,
    acceptSBTC: true,
    preferredCurrency: 'sbtc',
    autoConvertToUSD: false,
    settlementFrequency: 'instant'
  },
  apiKeys: {
    testKey: '',
    liveKey: '',
    webhookSecret: ''
  },
  integrationStatus: {
    codeGenerated: false,
    testPaymentMade: false,
    webhooksConfigured: false,
    readyForLive: false
  }
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with sBTC payments',
    icon: Star,
    component: WelcomeStep
  },
  {
    id: 'business',
    title: 'Business Info',
    description: 'Tell us about your business',
    icon: Building,
    component: BusinessInfoStep
  },
  {
    id: 'wallet',
    title: 'Wallet Setup',
    description: 'Connect your Stacks wallet',
    icon: Wallet,
    component: WalletSetupStep
  },
  {
    id: 'preferences',
    title: 'Payment Setup',
    description: 'Configure payment options',
    icon: CreditCard,
    component: PaymentPreferencesStep
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Generate integration keys',
    icon: Key,
    component: ApiKeySetupStep
  },
  {
    id: 'integration',
    title: 'Integration',
    description: 'Get your code snippets',
    icon: Code,
    component: IntegrationGuideStep
  },
  {
    id: 'test',
    title: 'Test Payment',
    description: 'Test your integration',
    icon: TestTube,
    component: TestPaymentStep
  },
  {
    id: 'go-live',
    title: 'Go Live',
    description: 'Activate your account',
    icon: Rocket,
    component: GoLiveStep
  }
]

const MerchantOnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
  }

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat([stepIndex])))
  }

  const isStepComplete = (stepIndex: number) => {
    return completedSteps.has(stepIndex)
  }

  const canProceedToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true
    return isStepComplete(stepIndex - 1)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      setCurrentStep(stepIndex)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to sBTC Gateway
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let's get your business ready to accept Bitcoin payments in minutes
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Setup Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Estimated time remaining: {Math.max(0, 8 - currentStep)} minutes
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Step Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Setup Steps</CardTitle>
              <CardDescription>
                Complete each step to start accepting payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = isStepComplete(index)
                const canAccess = canProceedToStep(index)

                return (
                  <motion.button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    disabled={!canAccess}
                    whileHover={canAccess ? { x: 4 } : {}}
                    whileTap={canAccess ? { scale: 0.98 } : {}}
                    className={`
                      w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all
                      ${isActive 
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : canAccess
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Done
                      </Badge>
                    )}
                  </motion.button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px] bg-white dark:bg-gray-900 border shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-orange-600 dark:text-orange-400" })}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                    <CardDescription className="text-base">
                      {steps[currentStep].description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {React.createElement(CurrentStepComponent, {
                    data,
                    updateData,
                    onComplete: () => markStepComplete(currentStep),
                    isLoading,
                    setIsLoading
                  })}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Navigation Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isLoading}
                  className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-orange-500'
                          : index < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1 || isLoading || !isStepComplete(currentStep)}
                  className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Complete Setup
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal or Completion State */}
      {completedSteps.size === steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Setup Complete! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your merchant account is ready to accept Bitcoin payments through sBTC
              </p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button variant="outline" className="w-full">
                View Documentation
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default MerchantOnboardingWizard