'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  Calendar,
  Eye,
  Copy,
  ExternalLink,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  amount: number
  currency: 'BTC' | 'sBTC' | 'STX'
  usdAmount: number
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  createdAt: string
  completedAt?: string
  description: string
  transactionHash?: string
  paymentMethod: string
}

const mockPayments: Payment[] = [
  {
    id: 'pay_1KjHnKMaR2TdqCX1',
    customer: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
    amount: 0.025,
    currency: 'sBTC',
    usdAmount: 1250.00,
    status: 'completed',
    createdAt: '2024-08-18T10:30:00Z',
    completedAt: '2024-08-18T10:32:15Z',
    description: 'Premium subscription - Monthly',
    transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
    paymentMethod: 'Leather Wallet'
  },
  {
    id: 'pay_2LmInOPbS3UeRdY2',
    customer: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
    },
    amount: 0.05,
    currency: 'sBTC',
    usdAmount: 2500.00,
    status: 'pending',
    createdAt: '2024-08-18T10:25:00Z',
    description: 'Product purchase - Digital goods',
    paymentMethod: 'Xverse Wallet'
  },
  {
    id: 'pay_3NoQrSdTu4VfWeZ3',
    customer: {
      name: 'Carol Smith',
      email: 'carol@example.com',
    },
    amount: 0.01,
    currency: 'sBTC',
    usdAmount: 500.00,
    status: 'completed',
    createdAt: '2024-08-18T10:18:00Z',
    completedAt: '2024-08-18T10:19:45Z',
    description: 'Service payment - Consultation',
    transactionHash: '0x5678901234abcdef5678901234abcdef56789012',
    paymentMethod: 'Hiro Wallet'
  },
  {
    id: 'pay_4PqUvWyXz5YgAfB4',
    customer: {
      name: 'David Brown',
      email: 'david@example.com',
    },
    amount: 0.075,
    currency: 'sBTC',
    usdAmount: 3750.00,
    status: 'failed',
    createdAt: '2024-08-18T10:10:00Z',
    description: 'Monthly billing - Enterprise plan',
    paymentMethod: 'Leather Wallet'
  },
]

const PaymentsPage = () => {
  const [payments] = useState<Payment[]>(mockPayments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }

    return (
      <Badge className={cn('text-xs font-medium', variants[status as keyof typeof variants])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Toast notification would go here
  }

  const exportPayments = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log('Exporting payments...')
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your sBTC payment transactions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={exportPayments}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Link
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments, customers, or payment IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="customer">Sort by Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredPayments.length} of {payments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={payment.customer.avatar} alt={payment.customer.name} />
                          <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                            {payment.customer.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {payment.customer.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${payment.usdAmount.toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(payment.createdAt)}
                        </p>
                        {payment.completedAt && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Completed {formatDate(payment.completedAt)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {payment.paymentMethod}
                      </p>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(payment.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Payment ID
                          </DropdownMenuItem>
                          {payment.transactionHash && (
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View on Explorer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {payment.status === 'failed' && (
                            <DropdownMenuItem>
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'pending' && (
                            <DropdownMenuItem className="text-red-600">
                              Cancel Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sortedPayments.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                No payments found
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Payments will appear here once you start receiving them'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentsPage
