# Chainhook Setup for STX Payment Monitoring

## Overview
Chainhook monitors the Stacks blockchain for events (like STX transfers) and triggers webhooks to your backend when those events occur. This allows automatic payment status updates.

## Installation

### Option 1: Using Homebrew (macOS - Recommended)
```bash
brew install chainhook
```

### Option 2: Using Cargo (Rust)
```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Chainhook
cargo install chainhook
```

### Option 3: Download Binary
Download from: https://github.com/hirosystems/chainhook/releases

## Configuration

### 1. Create Chainhook Configuration File

Create `chainhook-config.toml` in your project root:

```toml
[storage]
working_dir = "chainhook-data"

[network]
mode = "testnet"
# For testnet, Chainhook will use Hiro's API by default
stacks_node_rpc_url = "https://api.testnet.hiro.so"

[http_api]
http_port = 20456
database_uri = "chainhook.sqlite"

[limits]
max_number_of_predicates = 100
max_caching_duration_in_seconds = 300
```

### 2. Create STX Transfer Predicate

Create `predicates/stx-transfers.json`:

```json
{
  "chain": "stacks",
  "uuid": "stx-payment-monitor",
  "name": "STX Payment Monitor",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "stx_event",
        "actions": ["transfer"]
      },
      "then_that": {
        "http_post": {
          "url": "http://localhost:4000/api/chainhook/stx/transfers",
          "authorization_header": "Bearer YOUR_SECRET_TOKEN_HERE"
        }
      }
    }
  }
}
```

### 3. Update Backend Environment Variables

Add to `backend/.env`:

```bash
# Chainhook Configuration
CHAINHOOK_SECRET=your-secure-secret-token-here
CHAINHOOK_ENABLED=true
```

## Running Chainhook

### Start Chainhook Service

```bash
# Navigate to project root
cd /Users/apple/Desktop/Hackathons/Stacks_hacks/sbtc-payment-gateway

# Start Chainhook (this will scan from recent blocks)
chainhook service start --config-path=./chainhook-config.toml --predicate-path=./predicates
```

### Register the Predicate

In a new terminal:

```bash
# Register the STX transfer predicate
chainhook predicates apply predicates/stx-transfers.json --config-path=./chainhook-config.toml
```

## Testing

### 1. Create a test payment (already done - you have a payment waiting)

### 2. Send STX to the payment address
```
Address: ST3Y6F2QBFC125SXK9KZTM4XGVNGYDT2QJ1BP82HH
Amount: 1 STX
```

### 3. Check Chainhook logs
```bash
# Chainhook should detect the transfer and call your webhook
# Check backend logs for webhook processing
```

### 4. Verify payment status updated
- Check the payments dashboard
- Status should change from "pending" → "confirmed" → "settled"

## Alternative: Manual Payment Verification (Quick Fix)

If you don't want to set up Chainhook right now, you can manually check payment status:

### Add a "Check Status" Button

The backend already has an endpoint to check payment status. You can poll the Stacks API directly:

```typescript
// In your frontend, add a button that calls:
GET /api/payments/stx/{paymentId}

// This will fetch the latest blockchain data and update the payment
```

## Production Setup

For production, you should:

1. **Run Chainhook as a Service**
   ```bash
   # Use systemd, pm2, or Docker to keep Chainhook running
   pm2 start chainhook -- service start --config-path=./chainhook-config.toml
   ```

2. **Use HTTPS for Webhooks**
   - Update predicate URL to your production domain
   - Use proper SSL certificates

3. **Secure the Webhook Endpoint**
   - Verify the authorization header
   - Validate webhook signatures

4. **Monitor Chainhook Health**
   - Set up health checks
   - Monitor logs for errors
   - Have alerts for missed events

## Troubleshooting

### Chainhook not detecting transfers
- Check if Chainhook is running: `ps aux | grep chainhook`
- Check Chainhook logs for errors
- Verify predicate is registered: `chainhook predicates list`
- Ensure your backend webhook endpoint is accessible

### Webhook not being called
- Check backend logs
- Verify the webhook URL in predicate matches your backend
- Test webhook endpoint manually with curl

### Payment status not updating
- Check if webhook is being received in backend logs
- Verify the STXWebhookController is processing events correctly
- Check database to see if payment record exists

## Quick Start (TL;DR)

```bash
# 1. Install
brew install chainhook

# 2. Create config files (see above)

# 3. Start Chainhook
chainhook service start --config-path=./chainhook-config.toml --predicate-path=./predicates

# 4. In new terminal, register predicate
chainhook predicates apply predicates/stx-transfers.json --config-path=./chainhook-config.toml

# 5. Make a test payment
# Your existing payment should be detected automatically!
```

## Next Steps

After setup:
1. ✅ Chainhook monitors all STX transfers
2. ✅ When someone sends STX to a payment address, webhook fires
3. ✅ Backend updates payment status automatically
4. ✅ Frontend shows updated status in real-time
