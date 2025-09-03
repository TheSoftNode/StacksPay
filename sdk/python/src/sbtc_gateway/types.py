"""Type definitions for the sBTC Gateway SDK."""

from typing import Dict, List, Optional, Any, Literal
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Customer:
    """Customer information for payments."""
    email: Optional[str] = None
    name: Optional[str] = None
    id: Optional[str] = None


@dataclass 
class PaymentRequest:
    """Request data for creating a payment."""
    amount: int  # Amount in satoshis
    currency: Literal["sbtc", "btc", "stx"]
    description: str
    customer: Optional[Customer] = None
    metadata: Optional[Dict[str, Any]] = None
    webhook_url: Optional[str] = None
    redirect_url: Optional[str] = None
    expires_in: Optional[int] = None  # Seconds until payment expires


@dataclass
class WalletAddresses:
    """Wallet addresses for payment."""
    bitcoin: Optional[str] = None
    stacks: Optional[str] = None


@dataclass
class PaymentCustomer:
    """Customer information in payment response."""
    email: Optional[str] = None
    name: Optional[str] = None
    wallet_address: Optional[str] = None


@dataclass
class PaymentEvent:
    """Payment timeline event."""
    status: str
    timestamp: str
    transaction_hash: Optional[str] = None
    confirmations: Optional[int] = None


@dataclass
class Payment:
    """Payment object."""
    id: str
    amount: int
    currency: str
    status: Literal["pending", "paid", "completed", "failed", "expired"]
    description: str
    payment_url: str
    qr_code: str
    wallet_addresses: WalletAddresses
    expires_at: str
    created_at: str
    updated_at: str
    customer: Optional[PaymentCustomer] = None
    confirmations: Optional[int] = None
    transaction_hash: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timeline: Optional[List[PaymentEvent]] = None


@dataclass
class PaginationInfo:
    """Pagination information."""
    page: int
    limit: int
    total: int
    has_more: bool


@dataclass
class PaymentList:
    """List of payments with pagination."""
    payments: List[Payment]
    pagination: PaginationInfo


@dataclass
class Merchant:
    """Merchant information."""
    id: str
    name: str
    email: str
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    stacks_address: Optional[str] = None
    bitcoin_address: Optional[str] = None
    email_verified: bool = False
    verification_level: str = "none"
    created_at: Optional[str] = None


@dataclass
class WebhookEventData:
    """Webhook event data."""
    payment: Payment


@dataclass
class WebhookEvent:
    """Webhook event."""
    id: str
    type: Literal[
        "payment.created",
        "payment.paid", 
        "payment.completed",
        "payment.failed",
        "payment.expired"
    ]
    created: int
    data: WebhookEventData
    livemode: bool


# API Response types
class APIResponse:
    """Base API response."""
    success: bool


class PaymentResponse(APIResponse):
    """Payment API response."""
    payment: Payment


class PaymentListResponse(APIResponse):
    """Payment list API response."""
    payments: List[Payment]
    pagination: PaginationInfo


class MerchantResponse(APIResponse):
    """Merchant API response."""
    merchant: Merchant
