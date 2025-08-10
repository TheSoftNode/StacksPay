'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, CreditCard, Code } from 'lucide-react'
import DesktopDashboard from './DesktopDashboard'
import PhoneFrame from './PhoneFrame'
import DashboardView from './DashboardView'
import CheckoutView from './CheckoutView'
import DeveloperView from './DeveloperView'


const SpectacularPhonePreview = () => {
  const [currentView, setCurrentView] = useState(0)

  const views = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Analytics & Overview',
      icon: BarChart3,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'checkout',
      title: 'Checkout',
      subtitle: 'Customer Payment',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'developer',
      title: 'Integration',
      subtitle: 'Developer Tools',
      icon: Code,
      color: 'from-purple-500 to-pink-600'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const renderCurrentView = () => {
    switch (currentView) {
      case 0:
        return <DashboardView tabIndex={currentView} />
      case 1:
        return <CheckoutView tabIndex={currentView} />
      case 2:
        return <DeveloperView tabIndex={currentView} />
      default:
        return <DashboardView tabIndex={currentView} />
    }
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* Desktop Dashboard - Background Layer */}
      <div className="absolute top-16 left-0 z-10">
        <DesktopDashboard />
      </div>
      
      {/* Phone Frame - Overlapping Layer */}
      <div className="absolute top-0 -right-16 z-20">
        <PhoneFrame 
          views={views}
          currentView={currentView}
          setCurrentView={setCurrentView}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>
      </div>
    </div>
  )
}

export default SpectacularPhonePreview