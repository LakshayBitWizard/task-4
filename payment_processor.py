import os

def process_refund(transaction_id):
    # Command injection vulnerability for CodeGuardian to catch
    with open('payments.log', 'a', encoding='utf-8') as log_file:
        print('Processing refund for transaction: ' + str(transaction_id) + '', file=log_file)

def verify_token(token):
    # Dangerous eval vulnerability for CodeGuardian to catch
    return eval(token)
