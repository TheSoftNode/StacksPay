'use client'

import { useState, useRef, useEffect } from 'react'
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
  CreditCard,
  RefreshCw,
  RotateCcw,
  X,
  AlertCircle,
  Link,
  QrCode,
  Share,
  Mail,
  Loader2
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { 
  usePayments, 
  useCreatePaymentLink, 
  useCancelPayment, 
  useRefundPayment,
  useUpdatePayment
} from '@/hooks/use-payments'
import { Payment } from '@/lib/api/payment-api'
import { usePaymentStore, useFilteredPayments } from '@/stores/payment-store'
import { useToast } from '@/hooks/use-toast'

const PaymentsPage = () => {
  const { toast } = useToast()
  
  // Get payment state and actions from store
  const {
    selectedPayment,
    generatedPaymentLink,
    statusFilter,
    paymentMethodFilter,
    searchQuery,
    currentPage,
    isLoading: storeLoading,
    error: storeError,
    setSelectedPayment,
    setStatusFilter,
    setPaymentMethodFilter,
    setSearchQuery,
    setCurrentPage,
    clearGeneratedPaymentLink
  } = usePaymentStore();

  // Get filtered payments from store
  const filteredPayments = useFilteredPayments();

  // API hooks
  const { data: paymentsData, isLoading: queryLoading, error: queryError, refetch } = usePayments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
    page: currentPage,
    limit: 20,
  });

  const createPaymentLink = useCreatePaymentLink();
  const cancelPayment = useCancelPayment();
  const refundPayment = useRefundPayment();
  const updatePayment = useUpdatePayment();

  // Combined loading state
  const isLoading = storeLoading || queryLoading || createPaymentLink.isPending || 
                    cancelPayment.isPending || refundPayment.isPending || updatePayment.isPending;
  
  // Local component state
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState('all')
  const downloadRef = useRef<HTMLAnchorElement>(null)
  
  // Modal states
  const [modalPayment, setModalPayment] = useState<Payment | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false)
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false)
  const [isConvertToSubscriptionModalOpen, setIsConvertToSubscriptionModalOpen] = useState(false)
  
  // Form states
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Payment link form state
  const [paymentLinkData, setPaymentLinkData] = useState({
    amount: '',
    currency: 'sBTC',
    description: '',
    customerEmail: '',
    expiresIn: '24h', // hours
    customId: ''
  })

  // Subscription conversion form state
  const [subscriptionData, setSubscriptionData] = useState({
    planName: '',
    interval: 'monthly',
    trialDays: '14',
    setupFee: '',
    features: []
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300',
      refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
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

  // Modal handlers
  const openDetailsModal = (payment: any) => {
    setModalPayment(payment)
    setIsDetailsModalOpen(true)
  }

  const openRefundModal = (payment: any) => {
    setModalPayment(payment)
    setRefundAmount(payment.amount.toString())
    setIsRefundModalOpen(true)
  }

  const openCancelModal = (payment: any) => {
    setModalPayment(payment)
    setIsCancelModalOpen(true)
  }

  const openRetryModal = (payment: any) => {
    setModalPayment(payment)
    setIsRetryModalOpen(true)
  }

  const handleRefund = async () => {
    if (!modalPayment || !refundAmount) return;

    // TODO: Add blockchain transaction handling for refunds
    // For now, this is a placeholder that marks the payment as refunded
    await refundPayment.mutateAsync({
      paymentId: modalPayment.id,
      refundData: {
        amount: parseFloat(refundAmount),
        reason: refundReason,
        blockchainRefundData: {
          transactionId: `refund_${Date.now()}`, // Mock transaction ID
          status: 'confirmed'
        }
      }
    });

    setIsRefundModalOpen(false);
    setModalPayment(null);
  }

  const handleCancel = async () => {
    if (!modalPayment) return;

    console.log('Modal payment object:', modalPayment);
    console.log('Payment ID:', modalPayment.id);
    console.log('Payment _id:', (modalPayment as any)._id);

    // Use _id if id is not available (MongoDB compatibility)
    const paymentId = modalPayment.id || (modalPayment as any)._id;
    
    if (!paymentId) {
      console.error('No payment ID found in modalPayment:', modalPayment);
      return;
    }

    await cancelPayment.mutateAsync(paymentId);
    setIsCancelModalOpen(false);
    setModalPayment(null);
  }

  const handleRetry = async () => {
    if (!modalPayment) return;

    // Retry by updating status back to pending
    await updatePayment.mutateAsync({
      paymentId: modalPayment.id,
      updateData: { status: 'completed' } // Mock retry as success
    });

    setIsRetryModalOpen(false);
    setModalPayment(null);
  }

  const generatePaymentLink = async () => {
    if (!paymentLinkData.amount || !paymentLinkData.description) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    await createPaymentLink.mutateAsync({
      amount: parseFloat(paymentLinkData.amount),
      currency: paymentLinkData.currency as any,
      description: paymentLinkData.description,
      customerEmail: paymentLinkData.customerEmail || undefined,
      expiresIn: paymentLinkData.expiresIn,
      customId: paymentLinkData.customId || undefined,
    });
  }

  const resetPaymentLinkForm = () => {
    setPaymentLinkData({
      amount: '',
      currency: 'sBTC',
      description: '',
      customerEmail: '',
      expiresIn: '24h',
      customId: ''
    });
    clearGeneratedPaymentLink();
  }

  const openConvertToSubscriptionModal = (payment: Payment) => {
    setModalPayment(payment);
    // Pre-fill form with payment data
    setSubscriptionData({
      planName: `${payment.description} - Subscription`,
      interval: 'monthly',
      trialDays: '14',
      setupFee: '',
      features: []
    });
    setIsConvertToSubscriptionModalOpen(true);
  }

  const handleConvertToSubscription = async () => {
    if (!modalPayment || !subscriptionData.planName) return;

    setIsSubmitting(true);
    try {
      // Here you would make API call to create subscription plan
      console.log('Converting payment to subscription:', {
        paymentId: modalPayment.id,
        originalAmount: modalPayment.amount,
        planName: subscriptionData.planName,
        interval: subscriptionData.interval,
        trialDays: subscriptionData.trialDays,
        setupFee: subscriptionData.setupFee
      });

      toast({
        title: "Success",
        description: "Payment converted to subscription plan successfully!",
      });

      setIsConvertToSubscriptionModalOpen(false);
      setModalPayment(null);
      // Reset form
      setSubscriptionData({
        planName: '',
        interval: 'monthly',
        trialDays: '14',
        setupFee: '',
        features: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert payment to subscription",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderPaymentsTable = () => (
    <div className="overflow-x-auto">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {filteredPayments.length} of {payments.length} payments
      </div>
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
                    <AvatarImage src="" alt={payment.customerInfo?.name || 'Customer'} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                      {(payment.customerInfo?.name || payment.customerInfo?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {payment.customerInfo?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.customerInfo?.email || 'No email provided'}
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
                    {/* TODO: Add USD conversion based on exchange rates */}
                    ${(payment.amount * 50000).toLocaleString()} (estimated)
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
                  {payment.paymentMethod?.toUpperCase()} Wallet
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
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openDetailsModal(payment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(payment.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Payment ID
                    </DropdownMenuItem>
                    {payment.transactionData?.txId && (
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {payment.status === 'confirmed' && (
                      <>
                        <DropdownMenuItem onClick={() => openConvertToSubscriptionModal(payment)} className="text-purple-600">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Convert to Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openRefundModal(payment)} className="text-orange-600">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Refund Payment
                        </DropdownMenuItem>
                      </>
                    )}
                    {(payment.status === 'failed' || payment.status === 'expired') && (
                      <DropdownMenuItem onClick={() => openRetryModal(payment)} className="text-blue-600">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Payment
                      </DropdownMenuItem>
                    )}
                    {(payment.status === 'pending' || payment.status === 'processing') && (
                      <DropdownMenuItem onClick={() => openCancelModal(payment)} className="text-red-600">
                        <X className="mr-2 h-4 w-4" />
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
              : activeTab !== 'all' 
                ? `No ${activeTab} payments found`
                : 'Payments will appear here once you start receiving them'
            }
          </p>
        </div>
      )}
    </div>
  )

  // Use the payments from the store (which are filtered by the store selectors)
  const payments = filteredPayments;

  const sortedPayments = [...payments].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'customer':
        const aName = a.customerInfo?.name || a.customerInfo?.email || 'Unknown';
        const bName = b.customerInfo?.name || b.customerInfo?.email || 'Unknown';
        comparison = aName.localeCompare(bName)
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
          <Button variant="outline" size="sm" onClick={exportPayments} className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => setIsPaymentLinkModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Link
          </Button>
        </div>
      </div>

      {/* Payment Tabs */}
      <Card className="bg-white dark:bg-gray-900 border shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <TabsList className="grid w-full grid-cols-4 max-w-md bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Completed</TabsTrigger>
                <TabsTrigger value="failed" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Failed</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments, customers, or payment IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-900 border hover:border-orange-300 dark:hover:border-orange-600"
                  />
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900 border hover:border-orange-300 dark:hover:border-orange-600">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900 border hover:border-orange-300 dark:hover:border-orange-600">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                    <SelectItem value="customer">Sort by Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              <TabsContent value="all" className="mt-0">
                {renderPaymentsTable()}
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                {renderPaymentsTable()}
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                {renderPaymentsTable()}
              </TabsContent>
              <TabsContent value="failed" className="mt-0">
                {renderPaymentsTable()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={(open) => {
        setIsDetailsModalOpen(open)
        if (!open) setModalPayment(null)
      }}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about payment {modalPayment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {modalPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment ID</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{modalPayment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(modalPayment.status)}
                    {getStatusBadge(modalPayment.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={isRefundModalOpen} onOpenChange={(open) => {
        setIsRefundModalOpen(open)
        if (!open) {
          setModalPayment(null)
          setRefundAmount('')
          setRefundReason('')
        }
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Process a refund for payment {modalPayment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {modalPayment && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Original amount: <span className="font-medium">{modalPayment.amount} {modalPayment.currency}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount</Label>
                <Input 
                  id="refundAmount" 
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                  max={modalPayment.amount}
                  className="bg-white dark:bg-gray-900 border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundReason">Reason (Optional)</Label>
                <Input 
                  id="refundReason" 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for refund"
                  className="bg-white dark:bg-gray-900 border"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundModalOpen(false)} className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </Button>
            <Button 
              onClick={handleRefund}
              disabled={isSubmitting || !refundAmount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={(open) => {
        setIsCancelModalOpen(open)
        if (!open) setModalPayment(null)
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Cancel Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this pending payment?
            </DialogDescription>
          </DialogHeader>
          
          {modalPayment && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                    This action cannot be undone
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  The payment will be permanently cancelled and the customer will be notified.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono">{modalPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{modalPayment.customerInfo?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{modalPayment.amount} {modalPayment.currency}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
              Keep Payment
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Cancelling...' : 'Cancel Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retry Modal */}
      <Dialog open={isRetryModalOpen} onOpenChange={(open) => {
        setIsRetryModalOpen(open)
        if (!open) setModalPayment(null)
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Retry Payment</DialogTitle>
            <DialogDescription>
              Attempt to process this failed payment again
            </DialogDescription>
          </DialogHeader>
          
          {modalPayment && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Payment Retry
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  This will attempt to process the payment with the same details.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono">{modalPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{modalPayment.customerInfo?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{modalPayment.amount} {modalPayment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original Date:</span>
                  <span>{formatDate(modalPayment.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRetryModalOpen(false)} className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </Button>
            <Button 
              onClick={handleRetry}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Retrying...' : 'Retry Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payment Link Modal */}
      <Dialog open={isPaymentLinkModalOpen} onOpenChange={(open) => {
        setIsPaymentLinkModalOpen(open)
        if (!open) {
          resetPaymentLinkForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-orange-600" />
              <span>Create Payment Link</span>
            </DialogTitle>
            <DialogDescription>
              Generate a secure payment link to share with customers
            </DialogDescription>
          </DialogHeader>
          
          {!generatedPaymentLink ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Payment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-amount">Amount *</Label>
                    <Input
                      id="link-amount"
                      type="number"
                      step="0.000001"
                      placeholder="0.001"
                      value={paymentLinkData.amount}
                      onChange={(e) => setPaymentLinkData(prev => ({ ...prev, amount: e.target.value }))}
                      className="bg-white dark:bg-gray-900 border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="link-currency">Currency</Label>
                    <Select 
                      value={paymentLinkData.currency} 
                      onValueChange={(value) => setPaymentLinkData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900 border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <SelectItem value="sBTC">sBTC</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="STX">STX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-description">Description *</Label>
                  <Input
                    id="link-description"
                    placeholder="Premium subscription, Product purchase, etc."
                    value={paymentLinkData.description}
                    onChange={(e) => setPaymentLinkData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white dark:bg-gray-900 border"
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Customer Information (Optional)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Customer Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="customer@example.com"
                    value={paymentLinkData.customerEmail}
                    onChange={(e) => setPaymentLinkData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="bg-white dark:bg-gray-900 border"
                  />
                  <p className="text-xs text-gray-500">Receipt and updates will be sent to this email</p>
                </div>
              </div>

              {/* Link Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Link Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expires-in">Expires In</Label>
                    <Select 
                      value={paymentLinkData.expiresIn} 
                      onValueChange={(value) => setPaymentLinkData(prev => ({ ...prev, expiresIn: value }))}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900 border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                        <SelectItem value="720">30 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-id">Custom ID (Optional)</Label>
                    <Input
                      id="custom-id"
                      placeholder="order-123, inv-456"
                      value={paymentLinkData.customId}
                      onChange={(e) => setPaymentLinkData(prev => ({ ...prev, customId: e.target.value }))}
                      className="bg-white dark:bg-gray-900 border"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Preview</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Amount:</span> {paymentLinkData.amount || '0'} {paymentLinkData.currency}</p>
                  <p><span className="font-medium">Description:</span> {paymentLinkData.description || 'Payment description'}</p>
                  {paymentLinkData.customerEmail && (
                    <p><span className="font-medium">Customer:</span> {paymentLinkData.customerEmail}</p>
                  )}
                  <p><span className="font-medium">Expires:</span> {paymentLinkData.expiresIn === 'never' ? 'Never' : `In ${paymentLinkData.expiresIn} hours`}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Payment Link Created!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share this link with your customer to collect payment
                  </p>
                </div>
              </div>

              {/* Generated Link */}
              <div className="space-y-3">
                <Label>Payment Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={generatedPaymentLink?.url || ''}
                    readOnly
                    className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPaymentLink?.url || '')}
                    className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center space-y-3">
                <Label>QR Code</Label>
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center space-y-2">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">QR Code Preview</p>
                  </div>
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigator.share?.({ url: generatedPaymentLink?.url || '', title: 'Payment Link' })}
                  className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${paymentLinkData.customerEmail}?subject=Payment Request&body=Please complete your payment: ${generatedPaymentLink?.url || ''}`)}
                  className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentLinkModalOpen(false)}
              className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {generatedPaymentLink ? 'Close' : 'Cancel'}
            </Button>
            {!generatedPaymentLink ? (
              <Button 
                onClick={generatePaymentLink}
                disabled={!paymentLinkData.amount || !paymentLinkData.description || isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
              >
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Payment Link'}
              </Button>
            ) : (
              <Button 
                onClick={resetPaymentLinkForm}
                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Subscription Modal */}
      <Dialog open={isConvertToSubscriptionModalOpen} onOpenChange={(open) => {
        setIsConvertToSubscriptionModalOpen(open)
        if (!open) {
          setModalPayment(null)
          setSubscriptionData({
            planName: '',
            interval: 'monthly',
            trialDays: '14',
            setupFee: '',
            features: []
          })
        }
      }}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <span>Convert to Subscription</span>
            </DialogTitle>
            <DialogDescription>
              Create a recurring subscription plan based on this payment
            </DialogDescription>
          </DialogHeader>
          
          {modalPayment && (
            <div className="space-y-4">
              {/* Original Payment Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <span className="font-medium">Original Payment:</span> {modalPayment.amount} {modalPayment.currency}
                </p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <span className="font-medium">Description:</span> {modalPayment.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input 
                  id="planName" 
                  value={subscriptionData.planName}
                  onChange={(e) => setSubscriptionData(prev => ({ ...prev, planName: e.target.value }))}
                  placeholder="Premium Monthly Plan"
                  className="bg-white dark:bg-gray-900 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Interval</Label>
                  <Select 
                    value={subscriptionData.interval}
                    onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, interval: value }))}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900 border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input 
                    id="trialDays" 
                    type="number"
                    value={subscriptionData.trialDays}
                    onChange={(e) => setSubscriptionData(prev => ({ ...prev, trialDays: e.target.value }))}
                    min="0"
                    max="90"
                    className="bg-white dark:bg-gray-900 border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setupFee">Setup Fee (Optional)</Label>
                <Input 
                  id="setupFee" 
                  type="number"
                  step="0.000001"
                  value={subscriptionData.setupFee}
                  onChange={(e) => setSubscriptionData(prev => ({ ...prev, setupFee: e.target.value }))}
                  placeholder="0.001"
                  className="bg-white dark:bg-gray-900 border"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Preview</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Recurring Amount:</span> {modalPayment.amount} {modalPayment.currency}</p>
                  <p><span className="font-medium">Billing:</span> Every {subscriptionData.interval}</p>
                  {subscriptionData.trialDays && (
                    <p><span className="font-medium">Trial:</span> {subscriptionData.trialDays} days free</p>
                  )}
                  {subscriptionData.setupFee && (
                    <p><span className="font-medium">Setup Fee:</span> {subscriptionData.setupFee} {modalPayment.currency}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertToSubscriptionModalOpen(false)} className="bg-white dark:bg-gray-900 border hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </Button>
            <Button 
              onClick={handleConvertToSubscription}
              disabled={isSubmitting || !subscriptionData.planName}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Converting...' : 'Create Subscription Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PaymentsPage