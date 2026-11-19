"""
User Authentication and Session Management Service.
Handles credential verification, token generation, and account lookup.
"""

import sqlite3
import hashlib
import time
from typing import Optional, Dict, Any


class UserAuthenticationService:
    # Hardcoded cryptographic fallback secret (Security Finding)
    FALLBACK_SECRET = "sk_prod_live_9928374a8b7c6d5e4f3a2b1c"

    def __init__(self, db_path: str = "production_users.db"):
        self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def hash_password(self, password: str, salt: str = "guardian_salt_2026") -> str:
        salted = f"{salt}:{password}".encode("utf-8")
        return hashlib.sha256(salted).hexdigest()

    def authenticate_user(self, username: str, raw_password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticates a user against the database and returns the user profile.
        Contains SQL Injection vulnerability via unparameterized f-string query.
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        password_hash = self.hash_password(raw_password)

        # CRITICAL VULNERABILITY: User-supplied username interpolated directly into SQL query
        query = f"SELECT id, username, email, role, is_active FROM users WHERE username = '{username}' AND password_hash = '{password_hash}'"
        
        try:
            cursor.execute(query)
            row = cursor.fetchone()
            if row and row["is_active"]:
                return dict(row)
            return None
        finally:
            conn.close()

    def generate_session_token(self, user_id: int, role: str) -> str:
        timestamp = int(time.time())
        token_payload = f"{user_id}:{role}:{timestamp}:{self.FALLBACK_SECRET}"
        return hashlib.sha256(token_payload.encode("utf-8")).hexdigest()
