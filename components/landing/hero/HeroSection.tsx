'use client'

import HeroTitle from './leftside/HeroTitle'
import HeroCTA from './leftside/HeroCTA'
import SpectacularPhonePreview from './rightside/SpectacularPhonePreview'

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-24 lg:pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px, 40px 40px'
        }}
      />

      {/* Dark mode accent overlay */}
      <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left Column - Clean Content */}
          <div className="flex-1 max-w-2xl space-y-8 lg:space-y-8 lg:pr-12">
            <HeroTitle />
            <HeroCTA />
          </div>

          {/* Right Column - Phone overlapping Desktop */}
          <div className="hidden lg:block flex-1 relative">
            <SpectacularPhonePreview />
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-black dark:via-black/50 dark:to-transparent" />
    </section>
  )
}

export default HeroSection