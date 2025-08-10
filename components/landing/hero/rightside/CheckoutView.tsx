'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Bitcoin, Check, QrCode, Wallet, Shield, CheckCircle } from 'lucide-react'
import { useAutoScroll } from '@/hooks/useAutoScroll'

const CheckoutView = ({ tabIndex }: { tabIndex?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useAutoScroll(scrollRef, tabIndex)

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{ 
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      <div className="p-4 space-y-4 pb-24">
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mx-auto flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">TechStore Pro</h3>
            <p className="text-sm text-gray-500">Secure sBTC Checkout</p>
          </div>
        </div>

        {/* Product */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">MacBook Pro M3</div>
              <div className="text-sm text-gray-500">15-inch, 512GB</div>
              <div className="text-sm text-gray-500 mt-1">Qty: 1</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">$2,499</div>
              <div className="text-sm text-gray-500">≈ 0.084 sBTC</div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Payment Method</h4>
          
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-orange-900">Pay with sBTC</div>
                <div className="text-sm text-orange-700">Secure Bitcoin payment</div>
              </div>
              <Check className="w-5 h-5 text-orange-600" />
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-center mt-3">
                <div className="text-sm font-medium text-gray-700">Scan to pay</div>
                <div className="text-xs text-gray-500 mt-1">0.084 sBTC</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </motion.button>
          </motion.div>

          {/* Payment Info */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Secure Payment</span>
            </div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• No chargebacks or reversals</div>
              <div>• Instant settlement to your wallet</div>
              <div>• Protected by Bitcoin network</div>
            </div>
          </div>

          {/* Additional Security Info - Revealed by scroll */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Transaction Security</span>
            </div>
            <div className="text-xs text-green-600 space-y-1">
              <div>• End-to-end encryption</div>
              <div>• Multi-signature validation</div>
              <div>• Real-time fraud monitoring</div>
            </div>
          </div>

          {/* Order Summary - Additional scrollable content */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-700 text-sm mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">$2,499.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium">$12.50</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$2,511.50</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">≈ 0.084 sBTC</div>
              </div>
            </div>
          </div>

          {/* Payment Guarantee */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">StacksPay Guarantee</span>
            </div>
            <div className="text-xs text-purple-600 space-y-1">
              <div>• 100% secure transaction processing</div>
              <div>• Industry-leading fraud protection</div>
              <div>• 24/7 customer support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutView