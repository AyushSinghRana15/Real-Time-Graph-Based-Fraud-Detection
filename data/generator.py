import random
import uuid
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional
import math

ACCOUNT_TYPES = ['checking', 'savings', 'business', 'corporate']
MERCHANT_CATEGORIES = [
    'retail', 'electronics', 'travel', 'restaurants', 'utilities',
    'healthcare', 'education', 'entertainment', 'groceries', 'services'
]
COUNTRIES = ['US', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU', 'BR', 'IN', 'SG']


@dataclass
class Account:
    id: str
    type: str
    balance: float
    is_verified: bool
    risk_score: float = 0.0
    created_days_ago: int = 365
    avg_transaction_amount: float = 500.0
    transaction_count: int = 0


@dataclass
class Transaction:
    id: str
    sender_id: str
    receiver_id: str
    amount: float
    timestamp: datetime
    merchant_category: Optional[str]
    country: str
    is_flagged: bool = False
    is_fraud: bool = False
    step: int = 0


class TransactionDataGenerator:
    def __init__(self, num_accounts: int = 500, num_transactions: int = 10000):
        self.num_accounts = num_accounts
        self.num_transactions = num_transactions
        self.accounts: dict[str, Account] = {}
        self.transactions: list[Transaction] = []
        self.fraud_rings: list[list[str]] = []
        
    def generate_accounts(self):
        for i in range(self.num_accounts):
            acc_id = f"ACC-{uuid.uuid4().hex[:8].upper()}"
            acc_type = random.choice(ACCOUNT_TYPES)
            
            if random.random() < 0.1:
                balance = random.uniform(10000, 500000)
                risk_score = random.uniform(60, 95)
                is_verified = random.random() < 0.5
            else:
                balance = random.uniform(100, 50000)
                risk_score = random.uniform(0, 30)
                is_verified = random.random() < 0.9
            
            self.accounts[acc_id] = Account(
                id=acc_id,
                type=acc_type,
                balance=balance,
                is_verified=is_verified,
                risk_score=risk_score,
                created_days_ago=random.randint(1, 1825),
                avg_transaction_amount=random.uniform(50, 2000)
            )
        
        self._create_fraud_rings()
        return self
    
    def _create_fraud_rings(self):
        num_rings = max(3, self.num_accounts // 100)
        for _ in range(num_rings):
            ring_size = random.randint(3, 6)
            ring = random.sample(list(self.accounts.keys()), ring_size)
            self.fraud_rings.append(ring)
            
            for acc_id in ring:
                self.accounts[acc_id].risk_score = random.uniform(75, 98)
    
    def generate_transactions(self):
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(self.num_transactions):
            sender, receiver = self._select_sender_receiver()
            amount = self._generate_amount(sender, receiver)
            
            is_fraud = random.random() < (sender.risk_score + receiver.risk_score) / 200
            is_flagged = self._should_flag(sender, receiver, amount)
            
            step_offset = i * 360  
            timestamp = base_time + timedelta(seconds=step_offset)
            
            transaction = Transaction(
                id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                sender_id=sender.id,
                receiver_id=receiver.id,
                amount=amount,
                timestamp=timestamp,
                merchant_category=random.choice(MERCHANT_CATEGORIES) if random.random() < 0.7 else None,
                country=random.choice(COUNTRIES),
                is_flagged=is_flagged,
                is_fraud=is_fraud,
                step=(i % 744) + 1
            )
            
            self.transactions.append(transaction)
            sender.balance -= amount
            receiver.balance += amount
            sender.transaction_count += 1
            receiver.transaction_count += 1
        
        return self
    
    def _select_sender_receiver(self):
        accounts = list(self.accounts.values())
        
        if random.random() < 0.15 and self.fraud_rings:
            ring = random.choice(self.fraud_rings)
            ring_accounts = [self.accounts[acc_id] for acc_id in ring if acc_id in self.accounts]
            if len(ring_accounts) >= 2:
                sender, receiver = random.sample(ring_accounts, 2)
                return sender, receiver
        
        sender = random.choice(accounts)
        receiver = random.choice([a for a in accounts if a.id != sender.id])
        
        return sender, receiver
    
    def _generate_amount(self, sender: Account, receiver: Account) -> float:
        if sender.risk_score > 70:
            if random.random() < 0.3:
                return random.uniform(100000, 500000)
            elif random.random() < 0.5:
                return random.uniform(50000, 100000)
        
        if sender.avg_transaction_amount < 100:
            return random.uniform(10, 200)
        elif sender.avg_transaction_amount < 500:
            return random.uniform(100, 1000)
        elif sender.avg_transaction_amount < 2000:
            return random.uniform(500, 5000)
        else:
            return random.uniform(1000, 20000)
    
    def _should_flag(self, sender: Account, receiver: Account, amount: float) -> bool:
        if amount > 200000:
            return True
        if sender.risk_score > 80:
            return True
        if not sender.is_verified:
            return True
        if sender.created_days_ago < 7 and amount > 10000:
            return True
        return False
    
    def to_csv(self, filepath: str, limit: Optional[int] = None):
        import csv
        
        transactions = self.transactions[:limit] if limit else self.transactions
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'transaction_id', 'sender_id', 'receiver_id', 'amount',
                'timestamp', 'merchant_category', 'country', 'is_flagged', 'is_fraud', 'step'
            ])
            
            for tx in transactions:
                writer.writerow([
                    tx.id, tx.sender_id, tx.receiver_id, f"{tx.amount:.2f}",
                    tx.timestamp.isoformat(), tx.merchant_category or '',
                    tx.country, 1 if tx.is_flagged else 0, 1 if tx.is_fraud else 0, tx.step
                ])
        
        return filepath
    
    def get_alerts(self, limit: int = 20):
        flagged = [tx for tx in self.transactions if tx.is_flagged or tx.is_fraud]
        flagged.sort(key=lambda x: (x.amount if x.is_fraud else 0, x.amount), reverse=True)
        
        alerts = []
        for tx in flagged[:limit]:
            sender = self.accounts.get(tx.sender_id)
            
            if tx.is_fraud:
                alert_type = 'high_risk'
                confidence = min(95, 70 + tx.amount / 10000)
            elif tx.is_flagged:
                alert_type = 'medium_risk'
                confidence = min(85, 50 + tx.amount / 20000)
            else:
                alert_type = 'low_risk'
                confidence = 40 + random.uniform(0, 20)
            
            indicators = []
            if tx.amount > 100000:
                indicators.append('Large transaction amount')
            if sender and sender.risk_score > 70:
                indicators.append('High-risk sender account')
            if sender and sender.created_days_ago < 30:
                indicators.append('New account activity')
            if not sender or not sender.is_verified:
                indicators.append('Unverified account')
            if tx.is_fraud:
                indicators.append('Confirmed fraudulent activity')
            
            alerts.append({
                'id': f"ALT-{uuid.uuid4().hex[:8].upper()}",
                'type': alert_type,
                'entityId': tx.sender_id,
                'entityName': f"Account {tx.sender_id.split('-')[1]}",
                'amount': tx.amount,
                'timestamp': tx.timestamp.isoformat(),
                'description': f"Suspicious transaction: ${tx.amount:,.2f} to {tx.receiver_id}",
                'indicators': indicators,
                'confidence': round(confidence, 2),
                'reasons': self._generate_reasons(tx)
            })
        
        return alerts
    
    def _generate_reasons(self, tx: Transaction):
        reasons = []
        sender = self.accounts.get(tx.sender_id)
        
        if tx.amount > 100000:
            reasons.append({
                'factor': 'Amount Anomaly',
                'detail': f'${tx.amount:,.0f} exceeds $100K threshold',
                'weight': min(40, tx.amount / 10000)
            })
        
        if sender and sender.risk_score > 70:
            reasons.append({
                'factor': 'High Risk Account',
                'detail': f'Risk score {sender.risk_score:.0f}% - elevated concern',
                'weight': sender.risk_score
            })
        
        if sender and sender.created_days_ago < 30:
            reasons.append({
                'factor': 'New Account',
                'detail': f'Account age: {sender.created_days_ago} days',
                'weight': 25
            })
        
        if tx.is_fraud:
            reasons.append({
                'factor': 'Confirmed Fraud',
                'detail': 'Transaction matches fraud pattern',
                'weight': 50
            })
        
        reasons.sort(key=lambda x: x['weight'], reverse=True)
        return reasons[:3]


def generate_dataset(num_accounts: int = 500, num_transactions: int = 10000, output_dir: str = 'data'):
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Generating {num_accounts} accounts and {num_transactions} transactions...")
    
    data = TransactionDataGenerator(num_accounts, num_transactions)
    data.generate_accounts().generate_transactions()
    
    csv_path = os.path.join(output_dir, 'transactions.csv')
    data.to_csv(csv_path)
    
    print(f"Generated {len(data.transactions)} transactions")
    print(f"Flagged: {sum(1 for t in data.transactions if t.is_flagged)}")
    print(f"Fraud: {sum(1 for t in data.transactions if t.is_fraud)}")
    print(f"Saved to: {csv_path}")
    
    return data


if __name__ == '__main__':
    data = generate_dataset(500, 10000)
    alerts = data.get_alerts(20)
    print(f"\nGenerated {len(alerts)} alerts")
