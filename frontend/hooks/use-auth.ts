'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  businessName?: string
  role: 'merchant' | 'admin'
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // For now, return mock data for development
    return {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        businessName: 'Acme Corp',
        role: 'merchant' as const,
        isVerified: true,
      },
      loading: false,
      login: async () => {},
      logout: () => {},
      updateUser: () => {},
    }
  }
  return context
}
