"""
Core Dynamic Pricing and Discount Tier Engine.
Applies volume discounts, VIP status reductions, and seasonal promo margins.
"""

from typing import Dict, List, Optional
from decimal import Decimal, ROUND_HALF_UP


class PricingEngine:
    def __init__(self, base_currency: str = "USD"):
        self.base_currency = base_currency
        self.supported_currencies = {"USD": Decimal("1.0"), "EUR": Decimal("0.92"), "GBP": Decimal("0.78")}

    def calculate_final_price(
        self,
        unit_price: Decimal,
        quantity: int,
        customer_tier: str = "STANDARD",
        promo_code: Optional[str] = None,
        target_currency: str = "USD"
    ) -> Decimal:
        """
        Calculates final total price with multi-layered discount rules.
        TEST GAP: Complex branching logic with zero accompanying unit tests.
        """
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")
        if unit_price < Decimal("0.0"):
            raise ValueError("Unit price cannot be negative.")

        subtotal = unit_price * quantity
        discount_multiplier = Decimal("1.0")

        # VIP status tier discounts
        if customer_tier == "PLATINUM":
            discount_multiplier -= Decimal("0.20")
        elif customer_tier == "GOLD":
            discount_multiplier -= Decimal("0.15")
        elif customer_tier == "SILVER":
            discount_multiplier -= Decimal("0.10")

        # Quantity volume pricing tiers
        if quantity >= 100:
            discount_multiplier -= Decimal("0.10")
        elif quantity >= 50:
            discount_multiplier -= Decimal("0.05")

        # Seasonal promo code validation
        if promo_code:
            code = promo_code.upper().strip()
            if code == "SUMMER25":
                discount_multiplier -= Decimal("0.25")
            elif code == "WELCOME10":
                discount_multiplier -= Decimal("0.10")

        # Prevent sub-zero total pricing
        discount_multiplier = max(discount_multiplier, Decimal("0.10"))
        discounted_subtotal = subtotal * discount_multiplier

        # Multi-currency conversion
        fx_rate = self.supported_currencies.get(target_currency, Decimal("1.0"))
        final_total = discounted_subtotal * fx_rate

        return final_total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
