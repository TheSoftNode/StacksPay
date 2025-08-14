'use client'

import { motion } from 'framer-motion'
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ArrowRight, 
  ExternalLink,
  Code,
  BookOpen,
  Zap,
  Shield,
  Globe,
  Users,
  Heart,
  Star
} from 'lucide-react'
import Logo from '../shared/Logo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Payment API', href: '#', description: 'Accept sBTC payments' },
        { name: 'Payment Widgets', href: '#', description: 'Drop-in components' },
        { name: 'Enterprise', href: '#', description: 'Custom solutions' },
        { name: 'Pricing', href: '#', description: 'Transparent pricing' }
      ]
    },
    {
      title: 'Developers',
      links: [
        { name: 'Documentation', href: '#', description: 'Complete guides' },
        { name: 'API Reference', href: '#', description: 'Interactive docs' },
        { name: 'SDKs', href: '#', description: 'Multi-language support' },
        { name: 'GitHub', href: '#', description: 'Open source' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#', description: 'Our mission' },
        { name: 'Blog', href: '#', description: 'Latest updates' },
        { name: 'Careers', href: '#', description: 'Join our team' },
        { name: 'Contact', href: '#', description: 'Get in touch' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '#', description: 'Support & guides' },
        { name: 'Community', href: '#', description: 'Developer forum' },
        { name: 'Status', href: '#', description: 'System status' },
        { name: 'Security', href: '#', description: 'Trust & compliance' }
      ]
    }
  ]

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-900 dark:hover:text-white' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'Email', icon: Mail, href: '#', color: 'hover:text-orange-500' }
  ]

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Sophisticated grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 40px 40px'
        }} />

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-20">
          {/* Top Section with Logo and CTA */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left: Logo and Description */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Logo size="lg" showText={true} />
              <p className="text-xl text-gray-300 leading-relaxed max-w-md">
                The complete sBTC payment ecosystem. Accept Bitcoin, STX, and sBTC payments 
                with automatic conversion and instant settlements.
              </p>
              
              {/* Stats Row */}
              <div className="flex items-center space-x-8 pt-4">
                {[
                  { value: '99.97%', label: 'Uptime' },
                  { value: '6s', label: 'Settlement' },
                  { value: '3+', label: 'Currencies' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: CTA Section */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold">Ready to Transform Your Payments?</h3>
              <p className="text-gray-300 leading-relaxed">
                Join thousands of businesses already using our sBTC payment gateway 
                to process millions in transactions daily.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,140,0,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Building
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  className="px-8 py-4 border-2 border-gray-600 text-gray-300 font-bold rounded-xl hover:border-orange-500 hover:text-orange-400 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Schedule Demo
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Global Infrastructure</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                <h4 className="font-semibold text-lg text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: linkIndex * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="group flex items-start space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        <span className="text-sm group-hover:text-orange-400 transition-colors">
                          {link.name}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {link.description}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Section */}
          <motion.div
            className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Get the latest updates on sBTC integration, new features, and developer resources. 
                No spam, just valuable insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left: Copyright and Links */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="text-gray-400 text-sm">
                © {currentYear} StacksPay. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>

            {/* Right: Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`text-gray-400 transition-colors duration-200 ${social.color}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Made with Love */}
          <motion.div
            className="text-center pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>by the StacksPay team</span>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
