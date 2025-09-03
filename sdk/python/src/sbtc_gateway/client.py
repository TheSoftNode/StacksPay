"""Main client for the sBTC Gateway SDK."""

from typing import Optional

from .payments import PaymentsAPI
from .merchant import MerchantAPI
from .webhooks import WebhookUtils


class SBTCGateway:
    """Main sBTC Gateway client."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.sbtc-gateway.com",
        timeout: int = 30,
        retries: int = 3
    ):
        """Initialize the sBTC Gateway client.
        
        Args:
            api_key: Your API key (starts with sk_test_ or sk_live_)
            base_url: API base URL (default: https://api.sbtc-gateway.com)
            timeout: Request timeout in seconds (default: 30)
            retries: Number of retry attempts (default: 3)
        """
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.retries = retries
        
        # Initialize API clients
        self.payments = PaymentsAPI(api_key, base_url, timeout, retries)
        self.merchant = MerchantAPI(api_key, base_url, timeout, retries)
        
        # Webhook utilities (static methods)
        self.webhooks = WebhookUtils
