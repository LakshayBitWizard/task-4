import os
import sqlite3

def login(username, password):
    # High Severity: SQL Injection vulnerability
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    return cursor.fetchone()

def execute_backup(user_input_path):
    # High Severity: Remote Command Injection vulnerability
    os.system("tar -czf backup.tar.gz " + user_input_path)

def load_profile(user_cookie):
    import pickle
    # Critical Severity: Insecure Deserialization vulnerability
    return pickle.loads(user_cookie)
