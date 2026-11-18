# codeguardian_test/sql_probe.py
def lookup(cursor, user_id):
    cursor.execute("SELECT * FROM t WHERE id = ?", (user_id,))
