// 'use client'

// import { motion } from 'framer-motion'
// import { ArrowRight, Play, Code, BookOpen } from 'lucide-react'
// import { Button } from '@/components/ui/button'

// const HeroCTA = () => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, delay: 1.0 }}
//       className="flex flex-col sm:flex-row gap-4 items-start"
//     >
//       {/* Primary CTA */}
//       <motion.div
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <Button 
//           size="lg"
//           className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
//         >
//           <Code className="mr-3 w-5 h-5" />
//           Start Building
//           <motion.div
//             className="ml-2"
//             animate={{ x: [0, 4, 0] }}
//             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//           >
//             <ArrowRight className="w-5 h-5" />
//           </motion.div>
//         </Button>
//       </motion.div>

//       {/* Secondary CTA */}
//       <motion.div
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <Button 
//           variant="outline"
//           size="lg"
//           className="border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 font-semibold px-8 py-4 rounded-full text-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
//         >
//           <Play className="mr-3 w-5 h-5" />
//           Watch Demo
//         </Button>
//       </motion.div>

//       {/* Tertiary CTA */}
//       <motion.div
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <Button 
//           variant="ghost"
//           size="lg"
//           className="font-semibold px-6 py-4 rounded-full text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
//         >
//           <BookOpen className="mr-3 w-5 h-5" />
//           Read Docs
//           <ArrowRight className="ml-2 w-4 h-4" />
//         </Button>
//       </motion.div>
//     </motion.div>
//   )
// }

// export default HeroCTA

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
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start"
    >
      {/* Primary CTA */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full blur-xl opacity-20 scale-110" />
        
        <Button 
          size="lg"
          className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700/20"
        >
          <Code className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />
          Start Building
          <motion.div
            className="ml-2"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Secondary CTA */}
      {/* <motion.div
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Button 
          variant="outline"
          size="lg"
          className="relative border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Play className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />
          Watch Demo
        </Button>
      </motion.div> */}

      {/* Tertiary CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="hidden sm:block"
      >
        <Button 
          variant="ghost"
          size="lg"
          className="font-semibold px-4 sm:px-6 py-3 sm:py-4 rounded-full text-base sm:text-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all duration-300 group"
        >
          <BookOpen className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
          Read Docs
          <motion.div
            className="ml-2"
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Mobile: Show tertiary CTA as a simple link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="sm:hidden mt-2"
      >
        <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200 flex items-center group">
          <BookOpen className="mr-2 w-4 h-4" />
          Read Documentation
          <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </motion.div>
    </motion.div>
  )
}

export default HeroCTA