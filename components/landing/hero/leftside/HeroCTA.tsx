'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Code, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HeroCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
      className="flex flex-col sm:flex-row gap-4 items-start"
    >
      {/* Primary CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          size="lg"
          className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <Code className="mr-3 w-5 h-5" />
          Start Building
          <motion.div
            className="ml-2"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Secondary CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline"
          size="lg"
          className="border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 font-semibold px-8 py-4 rounded-full text-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <Play className="mr-3 w-5 h-5" />
          Watch Demo
        </Button>
      </motion.div>

      {/* Tertiary CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="ghost"
          size="lg"
          className="font-semibold px-6 py-4 rounded-full text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
        >
          <BookOpen className="mr-3 w-5 h-5" />
          Read Docs
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default HeroCTA