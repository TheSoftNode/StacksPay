# sBTC Gateway Python SDK

Official Python SDK for the sBTC Payment Gateway. Accept Bitcoin and STX payments with ease.

## Installation

```bash
pip install sbtc-gateway
```

## Quick Start

```python
import sbtc_gateway

# Initialize the client
client = sbtc_gateway.SBTCGateway('sk_live_your_api_key_here')

# Create a payment
payment = client.payments.create(sbtc_gateway.PaymentRequest(
    amount=50000,  # 50,000 satoshis
    currency='sbtc',
    description='Premium subscription',
    customer=sbtc_gateway.Customer(
        email='customer@example.com',
        name='John Doe'
    )
))

print(f"Payment URL: {payment.payment_url}")
```

## API Reference

### Initialize Client

```python
import sbtc_gateway

client = sbtc_gateway.SBTCGateway(
    api_key='sk_live_your_api_key_here',
    base_url='https://api.sbtc-gateway.com',  # optional
    timeout=30,  # optional, seconds
    retries=3   # optional, retry attempts
)
```

### Payments API

#### Create Payment

```python
from sbtc_gateway import PaymentRequest, Customer

payment = client.payments.create(PaymentRequest(
    amount=50000,  # Amount in satoshis
    currency='sbtc',  # 'sbtc', 'btc', or 'stx'
    description='Payment description',
    customer=Customer(
        email='customer@example.com',
        name='John Doe'
    ),
    metadata={
        'order_id': 'order_12345',
        'user_id': 'user_67890'
    },
    webhook_url='https://yourapp.com/webhooks/payment',
    redirect_url='https://yourapp.com/success'
))
```

#### Retrieve Payment

```python
payment = client.payments.retrieve('pay_1234567890')
```

#### List Payments

```python
result = client.payments.list(
    page=1,
    limit=20,
    status='completed',
    customer_email='customer@example.com'
)

payments = result.payments
pagination = result.pagination
```

#### Cancel Payment

```python
payment = client.payments.cancel('pay_1234567890')
```

### Merchant API

#### Get Current Merchant

```python
merchant = client.merchant.get_current()
```

#### Update Merchant

```python
merchant = client.merchant.update(
    name='New Business Name',
    website='https://newwebsite.com'
)
```

### Webhook Utilities

#### Verify Webhook Signature

```python
from flask import Flask, request
import sbtc_gateway

app = Flask(__name__)

@app.route('/webhooks/sbtc', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-SBTC-Signature')
    payload = request.get_data(as_text=True)
    secret = 'your_webhook_secret'

    try:
        event = sbtc_gateway.WebhookUtils.verify_and_parse_event(
            payload, signature, secret
        )

        if event.type == 'payment.completed':
            print(f'Payment completed: {event.data.payment.id}')
        elif event.type == 'payment.failed':
            print(f'Payment failed: {event.data.payment.id}')

        return 'OK', 200
    except sbtc_gateway.ValidationError as e:
        print(f'Webhook verification failed: {e}')
        return 'Invalid signature', 400
```

## Error Handling

```python
import sbtc_gateway

try:
    payment = client.payments.create(sbtc_gateway.PaymentRequest(
        amount=50000,
        currency='sbtc',
        description='Test payment'
    ))
except sbtc_gateway.AuthenticationError as e:
    print(f'Authentication error: {e.message}')
except sbtc_gateway.ValidationError as e:
    print(f'Validation error: {e.message}')
except sbtc_gateway.APIError as e:
    print(f'API error: {e.message}')
    print(f'Error code: {e.code}')
    print(f'Details: {e.details}')
except sbtc_gateway.NetworkError as e:
    print(f'Network error: {e.message}')
```

## Webhooks

Handle real-time payment updates:

```python
from flask import Flask, request
import sbtc_gateway

app = Flask(__name__)

@app.route('/webhooks/sbtc', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-SBTC-Signature')
    payload = request.get_data(as_text=True)

    try:
        event = sbtc_gateway.WebhookUtils.verify_and_parse_event(
            payload,
            signature,
            'your_webhook_secret'
        )

        if event.type == 'payment.created':
            # Payment initiated
            pass
        elif event.type == 'payment.paid':
            # Payment received (but not confirmed)
            pass
        elif event.type == 'payment.completed':
            # Payment confirmed and completed
            fulfill_order(event.data.payment)
        elif event.type == 'payment.failed':
            # Payment failed
            notify_customer(event.data.payment)
        elif event.type == 'payment.expired':
            # Payment expired
            cleanup_order(event.data.payment)

        return {'status': 'success'}, 200

    except sbtc_gateway.ValidationError:
        return {'error': 'Invalid signature'}, 400

def fulfill_order(payment):
    print(f'Fulfilling order for payment: {payment.id}')

def notify_customer(payment):
    print(f'Notifying customer about failed payment: {payment.id}')

def cleanup_order(payment):
    print(f'Cleaning up expired payment: {payment.id}')
```

## Testing

Use test API keys for development:

```python
# Test API key (starts with sk_test_)
client = sbtc_gateway.SBTCGateway('sk_test_your_test_key_here')

# All payments will use Bitcoin testnet and Stacks testnet
payment = client.payments.create(sbtc_gateway.PaymentRequest(
    amount=10000,  # 0.0001 BTC
    currency='sbtc',
    description='Test payment'
))
```

## Environment Variables

Create a `.env` file:

```bash
# Production
SBTC_API_KEY=sk_live_your_live_key_here
SBTC_WEBHOOK_SECRET=whsec_your_webhook_secret

# Development
SBTC_API_KEY=sk_test_your_test_key_here
SBTC_WEBHOOK_SECRET=whsec_your_test_webhook_secret
```

Use with python-dotenv:

```python
import os
from dotenv import load_dotenv
import sbtc_gateway

load_dotenv()

client = sbtc_gateway.SBTCGateway(os.getenv('SBTC_API_KEY'))
```

## Django Integration

```python
# settings.py
SBTC_API_KEY = os.getenv('SBTC_API_KEY')
SBTC_WEBHOOK_SECRET = os.getenv('SBTC_WEBHOOK_SECRET')

# views.py
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import sbtc_gateway

client = sbtc_gateway.SBTCGateway(settings.SBTC_API_KEY)

@csrf_exempt
@require_http_methods(["POST"])
def webhook_handler(request):
    signature = request.META.get('HTTP_X_SBTC_SIGNATURE')
    payload = request.body.decode('utf-8')

    try:
        event = sbtc_gateway.WebhookUtils.verify_and_parse_event(
            payload, signature, settings.SBTC_WEBHOOK_SECRET
        )

        # Handle the event
        handle_payment_event(event)

        return JsonResponse({'status': 'success'})
    except sbtc_gateway.ValidationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
```

## FastAPI Integration

```python
from fastapi import FastAPI, HTTPException, Header, Request
import sbtc_gateway

app = FastAPI()
client = sbtc_gateway.SBTCGateway('sk_live_your_api_key_here')

@app.post("/webhooks/sbtc")
async def webhook_handler(
    request: Request,
    x_sbtc_signature: str = Header(None)
):
    payload = await request.body()

    try:
        event = sbtc_gateway.WebhookUtils.verify_and_parse_event(
            payload.decode('utf-8'),
            x_sbtc_signature,
            'your_webhook_secret'
        )

        # Handle the event
        await handle_payment_event(event)

        return {"status": "success"}
    except sbtc_gateway.ValidationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
```

## Support

- **Documentation**: https://docs.sbtc-gateway.com
- **API Reference**: https://docs.sbtc-gateway.com/api
- **GitHub Issues**: https://github.com/TheSoftNode/sbtc-payment-gateway/issues
- **Email Support**: developers@sbtc-gateway.com

## License

MIT License. See [LICENSE](LICENSE) for details.
