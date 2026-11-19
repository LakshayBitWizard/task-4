"""
Order Metrics and Revenue Analytics Engine.
Calculates regional gross merchandise value, cohort retention, and fulfillment latency.
"""

import time
from datetime import datetime


class OrderMetricsAggregator:
    def __init__(self, region_code="US-EAST"):
        self.region_code = region_code
        self.cached_aggregates = {}

    def compute_regional_breakdown(self, orders, tiers, filter_cancelled=True, min_items=1):
        """
        Calculates complex regional tier revenue metrics.
        SMELL / QUALITY ISSUE: High Cyclomatic Complexity (> 12) & deeply nested loops.
        """
        results = {}
        for order in orders:
            if filter_cancelled:
                if order.get("status") == "CANCELLED":
                    continue
                elif order.get("status") == "REFUNDED":
                    continue
            
            if len(order.get("items", [])) >= min_items:
                order_total = 0.0
                for item in order.get("items", []):
                    qty = item.get("quantity", 1)
                    price = item.get("unit_price", 0.0)
                    tax_rate = 0.0825  # Magic number: hardcoded tax rate
                    
                    if item.get("is_taxable", True):
                        item_total = (qty * price) * (1.0 + tax_rate)
                    else:
                        item_total = qty * price
                    order_total += item_total

                for tier in tiers:
                    if order_total >= tier.get("threshold", 0):
                        tier_name = tier.get("name", "standard")
                        if tier_name not in results:
                            results[tier_name] = {"count": 0, "total_revenue": 0.0, "average": 0.0}
                        results[tier_name]["count"] += 1
                        results[tier_name]["total_revenue"] += order_total
                        results[tier_name]["average"] = (
                            results[tier_name]["total_revenue"] / results[tier_name]["count"]
                        )
                        break

        return results

    def get_latency_stats(self, fulfillment_logs):
        """Calculates average fulfillment latency in minutes."""
        if not fulfillment_logs:
            return None
        durations = [log.get("duration_sec", 0) for log in fulfillment_logs]
        avg_sec = sum(durations) / len(durations)
        return {"avg_latency_minutes": round(avg_sec / 60.0, 2), "sample_size": len(durations)}
