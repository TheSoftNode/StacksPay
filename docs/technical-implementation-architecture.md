# StacksPay Dashboard - Technical Implementation & Integration Guide

## Architecture Overview

The StacksPay merchant dashboard is built as a comprehensive business management platform with the following technical architecture:

### Frontend Architecture

- **Framework**: Next.js 14 with App Router
- **UI Components**: Custom components built with Tailwind CSS and shadcn/ui
- **Charts & Analytics**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React hooks with custom stores
- **Real-time Updates**: WebSocket connections for live data

### Backend Integration

- **API Architecture**: RESTful APIs with real-time WebSocket support
- **Authentication**: JWT-based authentication with API key management
- **Database**: PostgreSQL with real-time change streams
- **Payment Processing**: Multi-provider integration (Circle, Coinbase Commerce, native sBTC)
- **Webhook System**: Reliable event delivery with retry logic

## Dashboard Pages Architecture

### 1. Overview Dashboard (`/dashboard`)

```typescript
// Components Structure
- DashboardLayout
  - Sidebar
  - Navbar
  - MainContent
    - StatsOverview (4 key metrics cards)
    - RevenueChart (Recharts LineChart)
    - RecentTransactions (DataTable)
    - QuickActions (Action buttons)
    - ActivityFeed (Real-time updates)

// Key Integrations
- Real-time WebSocket for live metrics
- API endpoints: /api/dashboard/overview
- Chart data: /api/analytics/revenue-trends
- Recent activities: /api/activities/recent
```

### 2. Payments Management (`/dashboard/payments`)

```typescript
// Components Structure
- PaymentsLayout
  - PaymentFilters (Search, date range, status)
  - PaymentStats (Summary cards)
  - PaymentsList (Paginated table)
  - PaymentDetails (Modal/sidebar)
  - CreatePayment (Modal form)
  - RefundModal (Refund processing)

// Key Integrations
- Payment creation: POST /api/payments
- Payment search: GET /api/payments?filter=...
- Refund processing: POST /api/payments/{id}/refund
- Real-time status updates via WebSocket
```

### 3. Analytics Dashboard (`/dashboard/analytics`)

```typescript
// Components Structure
- AnalyticsLayout
  - DateRangePicker
  - MetricsGrid (KPI cards)
  - RevenueChart (Multi-line chart)
  - PaymentMethodsChart (Pie chart)
  - GeographicChart (World map)
  - PerformanceMetrics (Bar charts)
  - ExportTools (PDF/CSV export)

// Key Integrations
- Analytics data: GET /api/analytics/{metric}?range=...
- Export functionality: POST /api/analytics/export
- Real-time metric updates
- Chart data aggregation and caching
```

### 4. Balance & Conversion (`/dashboard/conversion`)

```typescript
// Components Structure
- ConversionLayout
  - BalanceCards (Multi-currency balances)
  - ConversionWidget (Currency converter)
  - TransactionHistory (Conversion history)
  - WithdrawalForm (Withdrawal interface)
  - RateMonitor (Exchange rate tracking)
  - ConversionSettings (Preferences)

// Key Integrations
- Balance retrieval: GET /api/balances
- Conversion execution: POST /api/conversions
- Withdrawal requests: POST /api/withdrawals
- Rate monitoring: WebSocket /ws/rates
- Multiple provider APIs (Circle, Coinbase, CoinGecko)
```

### 5. Customer Management (`/dashboard/customers`)

```typescript
// Components Structure
- CustomersLayout
  - CustomerSearch (Advanced filtering)
  - CustomersList (Paginated grid/table)
  - CustomerProfile (Detailed view)
  - CustomerSegments (Grouping tools)
  - CommunicationTools (Messaging)
  - LoyaltyPrograms (Rewards management)

// Key Integrations
- Customer data: GET /api/customers
- Customer payments: GET /api/customers/{id}/payments
- Communication: POST /api/customers/{id}/messages
- Segmentation: POST /api/customers/segments
```

### 6. API Management (`/dashboard/api`)

```typescript
// Components Structure
- APILayout
  - APIKeysList (Active keys management)
  - CreateAPIKey (Key generation form)
  - APIUsageMetrics (Usage analytics)
  - APIDocumentation (Interactive docs)
  - TestingConsole (API testing tools)
  - RateLimitSettings (Throttling config)

// Key Integrations
- Key management: POST /api/api-keys
- Usage metrics: GET /api/api-keys/{id}/usage
- Rate limiting: PUT /api/api-keys/{id}/limits
- Documentation: Static documentation with interactive examples
```

### 7. Webhook Management (`/dashboard/webhooks`)

```typescript
// Components Structure
- WebhooksLayout
  - WebhooksList (Configured endpoints)
  - CreateWebhook (Endpoint setup)
  - WebhookLogs (Delivery history)
  - WebhookTesting (Test delivery)
  - RetryConfiguration (Retry policies)
  - EventFilters (Event type selection)

// Key Integrations
- Webhook CRUD: /api/webhooks
- Delivery logs: GET /api/webhooks/{id}/logs
- Test delivery: POST /api/webhooks/{id}/test
- Event configuration: PUT /api/webhooks/{id}/events
```

### 8. Developer Tools (`/dashboard/developer`)

```typescript
// Components Structure
- DeveloperLayout
  - APIDocumentation (Complete API reference)
  - SDKDownloads (Client libraries)
  - CodeExamples (Implementation samples)
  - SandboxEnvironment (Testing tools)
  - IntegrationGuides (Step-by-step tutorials)
  - ChangelogViewer (API version history)

// Key Integrations
- Documentation: Static content with dynamic examples
- SDK generation: Automated client library builds
- Sandbox API: Separate testing environment
- Code examples: Live, executable samples
```

### 9. Settings & Configuration (`/dashboard/settings`)

```typescript
// Components Structure
- SettingsLayout
  - BusinessProfile (Company information)
  - PaymentSettings (Currency preferences)
  - SecuritySettings (2FA, access controls)
  - NotificationSettings (Alert preferences)
  - TeamManagement (User roles)
  - IntegrationSettings (Third-party configs)

// Key Integrations
- Profile management: PUT /api/merchants/profile
- Payment config: PUT /api/merchants/payment-settings
- Security settings: PUT /api/merchants/security
- Team management: /api/merchants/team
- Notification preferences: PUT /api/merchants/notifications
```

## Integration Architecture

### Website Integration Flow

```typescript
// 1. Merchant Website Setup
class StacksPayIntegration {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.stackspay.com'
        : 'https://sandbox-api.stackspay.com';
  }

  // Create payment from website
  async createPayment(paymentData) {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        successUrl: paymentData.successUrl,
        cancelUrl: paymentData.cancelUrl,
        metadata: paymentData.metadata,
      }),
    });

    return response.json();
  }

  // Handle webhook events
  async handleWebhook(request) {
    const signature = request.headers['x-stackspay-signature'];
    const payload = await request.text();

    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(payload);

    // Process different event types
    switch (event.type) {
      case 'payment.completed':
        await this.handlePaymentCompleted(event.data);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(event.data);
        break;
      // Handle other event types...
    }
  }
}
```

### Dashboard Real-Time Integration

```typescript
// Real-time dashboard updates
class DashboardRealtimeService {
  constructor(merchantId, token) {
    this.merchantId = merchantId;
    this.token = token;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    this.socket = new WebSocket(
      `wss://api.stackspay.com/ws/merchant/${this.merchantId}?token=${this.token}`
    );

    this.socket.onopen = () => {
      console.log('Dashboard real-time connection established');
      this.reconnectAttempts = 0;

      // Subscribe to relevant events
      this.subscribe(['payments', 'balances', 'analytics', 'customers']);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealtimeUpdate(data);
    };

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log('Dashboard connection closed cleanly');
      } else {
        console.log('Dashboard connection lost, attempting to reconnect...');
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('Dashboard WebSocket error:', error);
    };
  }

  subscribe(events) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'subscribe',
          events: events,
        })
      );
    }
  }

  handleRealtimeUpdate(data) {
    switch (data.type) {
      case 'payment_created':
      case 'payment_updated':
        this.updatePaymentInDashboard(data.payment);
        this.updateOverviewMetrics();
        break;

      case 'balance_updated':
        this.updateBalanceDisplay(data.balances);
        break;

      case 'new_customer':
        this.updateCustomerList(data.customer);
        break;

      case 'analytics_updated':
        this.updateAnalyticsCharts(data.metrics);
        break;
    }
  }

  // Update specific dashboard components
  updatePaymentInDashboard(payment) {
    // Update payments table/list
    const paymentsStore = usePaymentStore.getState();
    paymentsStore.updatePayment(payment);

    // Show notification for new payments
    if (payment.status === 'completed') {
      showNotification({
        type: 'success',
        title: 'Payment Received',
        message: `${payment.currency} ${payment.amount} payment completed`,
      });
    }
  }

  updateBalanceDisplay(balances) {
    // Update balance cards in conversion dashboard
    const balanceStore = useBalanceStore.getState();
    balanceStore.setBalances(balances);

    // Update overview dashboard balance summary
    const overviewStore = useOverviewStore.getState();
    overviewStore.updateBalances(balances);
  }

  updateAnalyticsCharts(metrics) {
    // Update chart data in analytics dashboard
    const analyticsStore = useAnalyticsStore.getState();
    analyticsStore.updateMetrics(metrics);

    // Update overview dashboard charts
    const overviewStore = useOverviewStore.getState();
    overviewStore.updateChartData(metrics);
  }
}
```

### API Integration Patterns

```typescript
// Centralized API service
class StacksPayAPIService {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new APIError(
          `API request failed: ${response.status}`,
          response.status,
          await response.text()
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network request failed', 0, error.message);
    }
  }

  // Dashboard-specific API methods
  async getDashboardOverview(dateRange) {
    return this.request(`/dashboard/overview?range=${dateRange}`);
  }

  async getPayments(filters) {
    const params = new URLSearchParams(filters);
    return this.request(`/payments?${params}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getAnalytics(metric, dateRange) {
    return this.request(`/analytics/${metric}?range=${dateRange}`);
  }

  async getBalances() {
    return this.request('/balances');
  }

  async executeConversion(conversionData) {
    return this.request('/conversions', {
      method: 'POST',
      body: JSON.stringify(conversionData),
    });
  }

  async getCustomers(filters) {
    const params = new URLSearchParams(filters);
    return this.request(`/customers?${params}`);
  }

  async createAPIKey(keyData) {
    return this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData),
    });
  }

  async createWebhook(webhookData) {
    return this.request('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }
}

class APIError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}
```

## Security Implementation

### Authentication & Authorization

```typescript
// JWT-based authentication
const authenticateRequest = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await getMerchantById(decoded.merchantId);

    if (!merchant || !merchant.isActive) {
      throw new Error('Invalid or inactive merchant');
    }

    return merchant;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
};

// API key validation
const validateAPIKey = async (apiKey) => {
  const key = await getAPIKeyByValue(apiKey);

  if (!key || !key.isActive) {
    throw new Error('Invalid API key');
  }

  // Check rate limits
  const usage = await getAPIKeyUsage(key.id);
  if (usage.exceedsLimits()) {
    throw new Error('API rate limit exceeded');
  }

  return key;
};
```

### Data Protection

```typescript
// Encryption for sensitive data
const encryptSensitiveData = (data) => {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Audit logging
const logAuditEvent = async (merchantId, action, details) => {
  await insertAuditLog({
    merchantId,
    action,
    details: encryptSensitiveData(details),
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
};
```

## Performance Optimization

### Caching Strategy

```typescript
// Redis caching for frequently accessed data
const cacheService = {
  async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  },

  async set(key, data, ttl = 300) {
    await redis.setex(key, ttl, JSON.stringify(data));
  },

  async invalidate(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Dashboard data caching
const getDashboardOverviewCached = async (merchantId, dateRange) => {
  const cacheKey = `dashboard:overview:${merchantId}:${dateRange}`;

  let data = await cacheService.get(cacheKey);
  if (!data) {
    data = await calculateDashboardOverview(merchantId, dateRange);
    await cacheService.set(cacheKey, data, 300); // 5 minutes
  }

  return data;
};
```

### Database Optimization

```typescript
// Optimized queries with proper indexing
const getPaymentsOptimized = async (merchantId, filters) => {
  const query = `
    SELECT p.*, c.name as customer_name
    FROM payments p
    LEFT JOIN customers c ON p.customer_id = c.id
    WHERE p.merchant_id = $1
    ${filters.status ? 'AND p.status = $2' : ''}
    ${filters.dateFrom ? 'AND p.created_at >= $3' : ''}
    ${filters.dateTo ? 'AND p.created_at <= $4' : ''}
    ORDER BY p.created_at DESC
    LIMIT $5 OFFSET $6
  `;

  // Use prepared statements and proper parameter binding
  return await db.query(query, [
    merchantId,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.limit || 50,
    filters.offset || 0,
  ]);
};
```

## Deployment & Monitoring

### Production Deployment

```yaml
# docker-compose.yml for production
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=stackspay
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### Monitoring & Logging

```typescript
// Application monitoring
const monitoringService = {
  trackMetric(name, value, tags = {}) {
    // Send to monitoring service (DataDog, New Relic, etc.)
    monitor.gauge(name, value, tags);
  },

  trackAPICall(endpoint, duration, status) {
    this.trackMetric('api.request.duration', duration, {
      endpoint,
      status,
    });
  },

  trackDashboardPageView(page, merchantId) {
    this.trackMetric('dashboard.page.view', 1, {
      page,
      merchantId,
    });
  },
};

// Error tracking and alerting
const errorHandler = (error, req, res, next) => {
  // Log error with context
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    merchantId: req.merchant?.id,
    timestamp: new Date(),
  });

  // Send to error tracking service
  errorTracker.captureException(error, {
    user: { id: req.merchant?.id },
    request: req,
  });

  // Send appropriate response
  if (error instanceof APIError) {
    res.status(error.status).json({
      error: error.message,
      details: error.details,
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};
```

This technical implementation guide provides developers with the complete architecture and integration patterns needed to work with the StacksPay merchant dashboard effectively.
