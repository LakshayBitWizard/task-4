import os

def process_refund(transaction_id):
    # Critical Command Injection
    os.system(f"echo Processing refund for {transaction_id} >> /var/log/refunds.log")

def debug_token(token):
    # Dangerous eval
    return eval(token)
