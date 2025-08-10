'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MenuItem {
  icon: any
  title: string
  description: string
  href: string
  badge?: string
  gradient?: string
}

interface NavDropdownProps {
  title: string
  items: MenuItem[]
  gradientFrom?: string
  gradientTo?: string
}

const NavDropdown = ({ 
  title, 
  items, 
  gradientFrom = '#F7931A', 
  gradientTo = '#5546FF' 
}: NavDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-[#64748B] hover:text-[#0A1628] font-medium h-auto p-2 hover:bg-[#F8FAFC] group"
        >
          {title}
          <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4 bg-white  border border-gray-200/50 shadow-2xl rounded-2xl">
        <div className="space-y-2">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DropdownMenuItem className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#F8FAFC] hover:to-[#F1F5F9] cursor-pointer group border border-transparent hover:border-gray-200/50">
                <div className="flex items-start space-x-4 w-full">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}15)`
                    }}
                  >
                    <item.icon 
                      className="w-5 h-5" 
                      style={{ color: gradientFrom }} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-[#0A1628] group-hover:text-[#1E293B]">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded-full border"
                          style={{
                            background: `linear-gradient(135deg, ${gradientFrom}10, ${gradientTo}10)`,
                            borderColor: `${gradientFrom}30`,
                            color: gradientFrom
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavDropdown