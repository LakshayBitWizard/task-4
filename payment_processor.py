import os

def process_refund(transaction_id):
    # Command injection vulnerability for CodeGuardian to catch
    os.system(f"echo Processing refund for transaction: {transaction_id} >> payments.log")

def verify_token(token):
    # Dangerous eval vulnerability for CodeGuardian to catch
    return eval(token)
