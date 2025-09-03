'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Return null during SSR and initial hydration
  }
  
  // Don't show navbar on dashboard routes
  if (pathname?.startsWith('/dashboard')) {
    return null
  }
  
  return <Navbar />
}
