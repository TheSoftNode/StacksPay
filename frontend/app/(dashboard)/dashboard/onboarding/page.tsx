'use client'

import MerchantOnboardingWizard from '@/components/dashboard/onboarding/MerchantOnboardingWizard'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <MerchantOnboardingWizard />
    </div>
  )
}