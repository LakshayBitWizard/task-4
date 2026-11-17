# codeguardian_test/sql_probe.py
def lookup(cursor, user_id):
    cursor.execute(f"SELECT * FROM users WHERE id={user_id}")
