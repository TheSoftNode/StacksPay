"""
sBTC Gateway Python SDK

Official Python SDK for the sBTC Payment Gateway.
Accept Bitcoin and STX payments with ease.
"""

from .client import SBTCGateway
from .exceptions import SBTCGatewayError, APIError, AuthenticationError, ValidationError
from .types import Payment, PaymentRequest, Merchant, WebhookEvent
from .webhooks import WebhookUtils

__version__ = "1.0.0"
__author__ = "sBTC Gateway Team"
__email__ = "developers@sbtc-gateway.com"

__all__ = [
    "SBTCGateway",
    "SBTCGatewayError",
    "APIError", 
    "AuthenticationError",
    "ValidationError",
    "Payment",
    "PaymentRequest",
    "Merchant",
    "WebhookEvent",
    "WebhookUtils",
]
