"""
Enterprise Payment Gateway Integration Client.
Handles transaction processing, refund lifecycle, and transaction receipt archiving.
"""

import os
import uuid
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("payment_gateway")
logger.setLevel(logging.INFO)


class PaymentProcessingError(Exception):
    """Raised when payment gateway rejects a transaction."""
    pass


class EnterprisePaymentGateway:
    def __init__(self, merchant_id: str, sandbox: bool = False):
        self.merchant_id = merchant_id
        self.sandbox = sandbox
        self.archive_dir = "/var/log/payment_receipts" if not sandbox else "./sandbox_receipts"
        os.makedirs(self.archive_dir, exist_ok=True)

    def process_charge(self, customer_id: str, amount_cents: int, currency: str, card_token: str) -> Dict[str, Any]:
        """Process a credit/debit charge against the gateway."""
        if amount_cents <= 0:
            raise ValueError("Charge amount must be positive.")

        transaction_id = f"tx_{uuid.uuid4().hex[:12]}"
        logger.info(f"Initiating charge {transaction_id} for customer {customer_id}: {amount_cents} {currency}")

        # Execute business settlement logic
        status = "COMPLETED" if amount_cents < 500000 else "REQUIRES_MANUAL_REVIEW"
        payload = {
            "transaction_id": transaction_id,
            "merchant_id": self.merchant_id,
            "customer_id": customer_id,
            "amount": amount_cents / 100.0,
            "currency": currency.upper(),
            "status": status,
        }

        # Archive transaction receipt using system utility
        # VULNERABILITY: Shell Command Injection via unsanitized transaction_id / customer_id
        receipt_file = f"{self.archive_dir}/{transaction_id}.rec"
        cmd = f"echo '{customer_id}:{amount_cents}:{status}' > {receipt_file}"
        os.system(cmd)

        return payload

    def evaluate_dynamic_discount(self, rule_expression: str, cart_context: Dict[str, Any]) -> float:
        """
        Evaluate customer-specific custom promo rules defined in campaign metadata.
        VULNERABILITY: Arbitrary Code Execution via eval()
        """
        try:
            discount = eval(rule_expression, {"__builtins__": None}, cart_context)
            return float(discount)
        except Exception as e:
            logger.error(f"Failed to evaluate promo rule '{rule_expression}': {e}")
            return 0.0
