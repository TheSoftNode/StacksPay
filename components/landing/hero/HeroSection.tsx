'use client'

import HeroTitle from './leftside/HeroTitle'
import HeroStats from './leftside/HeroStats'
import HeroCTA from './leftside/HeroCTA'
import SpectacularPhonePreview from './rightside/SpectacularPhonePreview'

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 lg:space-y-12">
            <HeroTitle />
            <HeroStats />
            <HeroCTA />
          </div>

          {/* Right Column - Beautiful Phone & Dashboard */}
          <div className="flex justify-center lg:justify-end">
            <SpectacularPhonePreview />
          </div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-black dark:via-black/50" />
    </section>
  )
}

export default HeroSection