'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Copy, CheckCircle, Download, Share, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface QRCodeProps {
  value: string
  size?: number
  label?: string
  showCopy?: boolean
  showDownload?: boolean
  showShare?: boolean
  logo?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  darkColor?: string
  lightColor?: string
  onScan?: () => void
}

export default function QRCode({ 
  value, 
  size = 200, 
  label,
  showCopy = true,
  showDownload = false,
  showShare = false,
  logo,
  errorCorrectionLevel = 'M',
  margin = 4,
  darkColor = '#000000',
  lightColor = '#ffffff',
  onScan
}: QRCodeProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [value, size, errorCorrectionLevel, margin, darkColor, lightColor])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Simulate QR code generation - in real implementation, use a library like qrcode
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate a simple pattern for demo purposes
      // In production, use a proper QR code library
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = size
        canvas.height = size
        
        // Fill background
        ctx.fillStyle = lightColor
        ctx.fillRect(0, 0, size, size)
        
        // Draw QR pattern (simplified demo pattern)
        ctx.fillStyle = darkColor
        const moduleSize = size / 25 // 25x25 modules
        
        // Draw finder patterns (corners)
        drawFinderPattern(ctx, 0, 0, moduleSize)
        drawFinderPattern(ctx, 18 * moduleSize, 0, moduleSize)
        drawFinderPattern(ctx, 0, 18 * moduleSize, moduleSize)
        
        // Draw some data modules (random pattern for demo)
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if (shouldDrawModule(i, j, value)) {
              ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
            }
          }
        }
        
        // Add logo if provided
        if (logo) {
          const logoSize = size * 0.2
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2
          
          // White background for logo
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)
          
          // In real implementation, draw actual logo image
          ctx.fillStyle = '#333333'
          ctx.fillRect(logoX, logoY, logoSize, logoSize)
        }
        
        setQrDataUrl(canvas.toDataURL('image/png'))
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Draw 7x7 finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          (i === 0 || i === 6 || j === 0 || j === 6) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          ctx.fillRect(x + i * moduleSize, y + j * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  const shouldDrawModule = (x: number, y: number, data: string): boolean => {
    // Skip finder patterns
    if (
      (x < 9 && y < 9) ||
      (x > 15 && y < 9) ||
      (x < 9 && y > 15)
    ) {
      return false
    }
    
    // Simple hash-based pattern for demo
    const hash = data.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return ((x + y + hash) % 3) === 0
  }

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "QR code data copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy QR code data",
        variant: "destructive"
      })
    }
  }

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a')
      link.download = `qr-code-${Date.now()}.png`
      link.href = qrDataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Downloaded!",
        description: "QR code saved to your device",
      })
    }
  }

  const shareQR = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrDataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'qr-code.png', { type: 'image/png' })
        
        await navigator.share({
          title: 'QR Code',
          text: label || 'Scan this QR code',
          files: [file]
        })
      } catch (error) {
        // Fallback to copying the value
        copyValue()
      }
    } else {
      copyValue()
    }
  }

  return (
    <Card className="w-fit mx-auto">
      <CardContent className="p-4 text-center space-y-4">
        {/* QR Code Display */}
        <div className="relative inline-block">
          {isGenerating ? (
            <div 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                <div className="text-xs text-gray-500">Generating...</div>
              </div>
            </div>
          ) : qrDataUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src={qrDataUrl}
              alt="QR Code"
              className="rounded-lg shadow-sm"
              style={{ width: size, height: size }}
              onClick={onScan}
            />
          ) : (
            <div 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
              style={{ width: size, height: size }}
            >
              <div className="text-center space-y-2">
                <QrCode className="h-8 w-8 text-gray-400 mx-auto" />
                <div className="text-xs text-gray-500">QR Code</div>
              </div>
            </div>
          )}
        </div>

        {/* Label */}
        {label && (
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {label}
          </div>
        )}

        {/* Value Display */}
        <div className="text-xs text-gray-500 font-mono break-all px-2">
          {value.length > 40 ? `${value.substring(0, 40)}...` : value}
        </div>

        {/* Action Buttons */}
        {(showCopy || showDownload || showShare) && (
          <div className="flex justify-center space-x-2">
            {showCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyValue}
                className={copied ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-1 text-xs">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </Button>
            )}
            
            {showDownload && qrDataUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
              >
                <Download className="h-4 w-4" />
                <span className="ml-1 text-xs">Download</span>
              </Button>
            )}
            
            {showShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={shareQR}
              >
                <Share className="h-4 w-4" />
                <span className="ml-1 text-xs">Share</span>
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500">
          Scan with any QR code reader or compatible wallet
        </div>
      </CardContent>
    </Card>
  )
}
