'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Terminal, 
  FileCode, 
  Globe, 
  Key, 
  Book, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Download,
  Zap,
  Layers,
  Shield,
  Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CodeSnippet {
  id: string
  title: string
  language: string
  code: string
  description: string
}

const codeSnippets: CodeSnippet[] = [
  {
    id: '1',
    title: 'Initialize Payment',
    language: 'javascript',
    description: 'Create a new sBTC payment using our SDK',
    code: `import { StacksPay } from '@stackspay/sdk';

const stacksPay = new StacksPay({
  apiKey: 'your-api-key',
  network: 'testnet'
});

const payment = await stacksPay.payments.create({
  amount: 100000000, // 1 sBTC in satoshis
  currency: 'SBTC',
  description: 'Payment for services',
  customer: {
    email: 'customer@example.com'
  },
  webhook_url: 'https://your-site.com/webhooks'
});`
  },
  {
    id: '2',
    title: 'Verify Payment',
    language: 'javascript',
    description: 'Verify payment status and handle confirmations',
    code: `// Check payment status
const payment = await stacksPay.payments.retrieve(paymentId);

if (payment.status === 'confirmed') {
  // Payment confirmed on blockchain
  console.log('Payment confirmed:', payment.tx_id);
  
  // Update your database
  await updateOrderStatus(payment.metadata.order_id, 'paid');
} else if (payment.status === 'pending') {
  // Still waiting for confirmations
  console.log('Waiting for confirmations:', payment.confirmations);
}`
  },
  {
    id: '3',
    title: 'Handle Webhooks',
    language: 'javascript',
    description: 'Process webhook notifications from StacksPay',
    code: `app.post('/webhooks/stackspay', (req, res) => {
  const signature = req.headers['x-stackspay-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify webhook signature
  if (!stacksPay.webhooks.verify(payload, signature)) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'payment.confirmed':
      console.log('Payment confirmed:', event.data.id);
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.id);
      break;
  }
  
  res.status(200).send('OK');
});`
  }
]

const sdkLanguages = [
  {
    name: 'Node.js',
    icon: Terminal,
    status: 'available',
    version: 'v2.1.0',
    installCommand: 'npm install @stackspay/sdk'
  },
  {
    name: 'Python',
    icon: Code,
    status: 'available',
    version: 'v1.8.0',
    installCommand: 'pip install stackspay'
  },
  {
    name: 'PHP',
    icon: FileCode,
    status: 'available',
    version: 'v1.5.0',
    installCommand: 'composer require stackspay/stackspay-php'
  },
  {
    name: 'Ruby',
    icon: Code,
    status: 'coming-soon',
    version: 'Coming Soon',
    installCommand: ''
  }
]

export default function DeveloperPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedSnippet, setSelectedSnippet] = useState(codeSnippets[0])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Resources</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tools, documentation, and code examples to integrate StacksPay
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">API Version</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">v2.1</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">150ms</p>
            </div>
            <Cpu className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">SDKs Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
            <Layers className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SDK Libraries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SDK Libraries</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Official SDKs for popular programming languages</p>
          </div>

          <div className="p-6 space-y-4">
            {sdkLanguages.map((sdk, index) => (
              <div key={sdk.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <sdk.icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sdk.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sdk.version}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={sdk.status === 'available' ? 'default' : 'secondary'}
                    className={sdk.status === 'available' ? 'bg-green-100 text-green-700' : ''}
                  >
                    {sdk.status === 'available' ? 'Available' : 'Coming Soon'}
                  </Badge>
                  {sdk.installCommand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(sdk.installCommand, `install-${index}`)}
                    >
                      {copiedCode === `install-${index}` ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Essential resources for developers</p>
          </div>

          <div className="p-6 space-y-3">
            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center space-x-3">
                <Book className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">API Documentation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complete API reference</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">sBTC Testnet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Test your integration</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Webhook Guide</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Handle real-time events</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Postman Collection</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Test API endpoints</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Code Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Code Examples</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Common integration patterns and examples</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Code Snippet Selector */}
            <div className="space-y-2">
              {codeSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippet(snippet)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSnippet.id === snippet.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="font-medium text-sm">{snippet.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{snippet.description}</p>
                </button>
              ))}
            </div>

            {/* Code Display */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{selectedSnippet.language}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.id)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedCode === selectedSnippet.id ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
