import sqlite3

def login_user(username, password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # SQL injection vulnerability for CodeGuardian to catch
    query = 'SELECT * FROM users WHERE username = ? AND password = ?'
    cursor.execute(query, (username, password))
    return cursor.fetchone()
