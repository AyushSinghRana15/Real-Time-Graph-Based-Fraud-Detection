import os
import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "fraud_detection.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                risk_score REAL DEFAULT 50.0,
                user_type TEXT DEFAULT 'User',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                amount REAL NOT NULL,
                transaction_type TEXT DEFAULT 'TRANSFER',
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                is_flagged INTEGER DEFAULT 0,
                fraud_probability REAL,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp)
        """)

def generate_hex_id() -> str:
    import secrets
    return f"0x{secrets.token_hex(16)}"

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 0:
            print("Database already seeded, skipping...")
            return
        
        entities = [
            ("Aditya Sharma", "User", 75.0),
            ("Ayush Singh", "User", 15.0),
            ("Bipin Kumar", "User", 92.0),
            ("Ashutosh Mishra", "User", 45.0),
            ("GFX Exchange Hub", "Exchange", 60.0),
            ("CryptoVault Services", "Exchange", 35.0),
            ("QuickPay Merchant", "Merchant", 28.0),
            ("Global Trade Corp", "Merchant", 55.0),
            ("匿名钱包 Alpha", "User", 88.0),
            ("匿名钱包 Beta", "User", 82.0),
        ]
        
        entity_ids = {}
        for username, user_type, risk in entities:
            user_id = generate_hex_id()
            entity_ids[username] = user_id
            cursor.execute(
                "INSERT INTO users (id, username, risk_score, user_type) VALUES (?, ?, ?, ?)",
                (user_id, username, risk, user_type)
            )
        
        import random
        base_time = datetime.now()
        
        transactions = [
            ("Aditya Sharma", "GFX Exchange Hub", 15000, "CASH_IN"),
            ("GFX Exchange Hub", "Bipin Kumar", 14500, "CASH_OUT"),
            ("Aditya Sharma", "Ayush Singh", 5000, "TRANSFER"),
            ("Ayush Singh", "QuickPay Merchant", 2000, "PAYMENT"),
            ("Bipin Kumar", "匿名钱包 Alpha", 8000, "TRANSFER"),
            ("匿名钱包 Alpha", "匿名钱包 Beta", 7500, "TRANSFER"),
            ("匿名钱包 Beta", "Bipin Kumar", 7200, "TRANSFER"),
            ("Ashutosh Mishra", "Global Trade Corp", 25000, "TRANSFER"),
            ("Global Trade Corp", "CryptoVault Services", 24000, "CASH_OUT"),
            ("CryptoVault Services", "Ayush Singh", 10000, "CASH_OUT"),
        ]
        
        for i, (sender, receiver, amount, tx_type) in enumerate(transactions):
            tx_id = generate_hex_id()
            timestamp = (base_time - timedelta(hours=len(transactions)-i)).isoformat()
            cursor.execute(
                """INSERT INTO transactions (id, sender_id, receiver_id, amount, transaction_type, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (tx_id, entity_ids[sender], entity_ids[receiver], amount, tx_type, timestamp)
            )
        
        conn.commit()
        print(f"Database seeded with {len(entities)} users and {len(transactions)} transactions")
        return entity_ids

from datetime import timedelta

class UserRepository:
    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
            return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    @staticmethod
    def update_risk_score(user_id: str, risk_score: float):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET risk_score = ?, updated_at = ? WHERE id = ?",
                (risk_score, datetime.now().isoformat(), user_id)
            )
    
    @staticmethod
    def create(username: str, user_type: str = "User", risk_score: float = 50.0) -> str:
        user_id = generate_hex_id()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (id, username, risk_score, user_type) VALUES (?, ?, ?, ?)",
                (user_id, username, risk_score, user_type)
            )
        return user_id

class TransactionRepository:
    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions ORDER BY timestamp DESC")
            return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_by_sender(sender_id: str) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions WHERE sender_id = ?", (sender_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def get_by_receiver(receiver_id: str) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM transactions WHERE receiver_id = ?", (receiver_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    @staticmethod
    def create(
        sender_id: str,
        receiver_id: str,
        amount: float,
        transaction_type: str = "TRANSFER",
        is_flagged: bool = False,
        fraud_probability: float = None
    ) -> str:
        tx_id = generate_hex_id()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO transactions 
                   (id, sender_id, receiver_id, amount, transaction_type, is_flagged, fraud_probability)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (tx_id, sender_id, receiver_id, amount, transaction_type, 1 if is_flagged else 0, fraud_probability)
            )
            
            cursor.execute(
                "SELECT SUM(amount) FROM transactions WHERE sender_id = ?",
                (sender_id,)
            )
            total_sent = cursor.fetchone()[0] or 0
            
            cursor.execute(
                "SELECT COUNT(*) FROM transactions WHERE sender_id = ?",
                (sender_id,)
            )
            tx_count = cursor.fetchone()[0]
            
            velocity_risk = min(100, (tx_count * 5) + (total_sent / 10000))
            
            cursor.execute(
                "SELECT risk_score FROM users WHERE id = ?",
                (sender_id,)
            )
            result = cursor.fetchone()
            current_risk = result[0] if result else 50
            
            if is_flagged and fraud_probability:
                new_risk = min(100, current_risk + (fraud_probability * 0.3))
                cursor.execute(
                    "UPDATE users SET risk_score = ?, updated_at = ? WHERE id = ?",
                    (new_risk, datetime.now().isoformat(), sender_id)
                )
        return tx_id
    
    @staticmethod
    def get_graph_data() -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT u.id, u.username, u.risk_score, u.user_type
                FROM users u
            """)
            users = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute("""
                SELECT t.sender_id as source, t.receiver_id as target, 
                       t.amount, t.timestamp, t.is_flagged
                FROM transactions t
            """)
            transactions = [dict(row) for row in cursor.fetchall()]
            
            return {"users": users, "transactions": transactions}
    
    @staticmethod
    def get_recent_transactions(limit: int = 50) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            return [dict(row) for row in cursor.fetchall()]
