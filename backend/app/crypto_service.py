import httpx
import asyncio
from typing import Optional
from datetime import datetime

COINGECKO_BASE = "https://api.coingecko.com/api/v3"


class CryptoDataService:
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.rate_limit_delay = 1.5
        self.last_request_time = 0

    async def _get_client(self) -> httpx.AsyncClient:
        if self.client is None:
            self.client = httpx.AsyncClient(
                base_url=COINGECKO_BASE,
                timeout=30.0,
                headers={"Accept": "application/json"}
            )
        return self.client

    async def _rate_limit(self):
        import time
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - elapsed)
        self.last_request_time = time.time()

    async def get_market_data(self, limit: int = 50) -> list[dict]:
        client = await self._get_client()
        await self._rate_limit()
        
        response = await client.get("/coins/markets", params={
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": limit,
            "page": 1,
            "sparkline": "false",
            "price_change_percentage": "24h,7d"
        })
        response.raise_for_status()
        return response.json()

    async def get_coin_transactions(self, coin_id: str, days: int = 7) -> list[dict]:
        client = await self._get_client()
        await self._rate_limit()
        
        response = await client.get(f"/coins/{coin_id}/transaction")
        response.raise_for_status()
        return response.json()

    async def get_exchange_transactions(self, exchange_id: str = "binance") -> list[dict]:
        client = await self._get_client()
        await self._rate_limit()
        
        try:
            response = await client.get(f"/exchanges/{exchange_id}/transactions", params={"per_page": 50})
            response.raise_for_status()
            return response.json().get("data", [])
        except httpx.HTTPStatusError:
            return []

    async def get_wallet_transactions(self, addresses: list[str]) -> list[dict]:
        transactions = []
        for addr in addresses[:10]:
            client = await self._get_client()
            await self._rate_limit()
            
            try:
                response = await client.get(f"/onchain_networks/bitcoin/addresses/{addr}/transactions")
                if response.status_code == 200:
                    data = response.json()
                    transactions.extend(data.get("data", []))
            except httpx.HTTPStatusError:
                continue
        
        return transactions

    async def get_transactions_for_fraud_detection(self, num_transactions: int = 50) -> list[dict]:
        market_data = await self.get_market_data(limit=20)
        
        transactions = []
        for coin in market_data[:10]:
            coin_id = coin.get("id")
            if not coin_id:
                continue
            
            await self._rate_limit()
            
            try:
                client = await self._get_client()
                response = await client.get(f"/coins/{coin_id}", params={
                    "localization": "false",
                    "tickers": "false",
                    "market_data": "true",
                    "community_data": "false",
                    "developer_data": "false"
                })
                
                if response.status_code == 200:
                    coin_data = response.json()
                    market = coin_data.get("market_data", {})
                    
                    current_price = market.get("current_price", {}).get("usd", 0)
                    if current_price > 0:
                        for i in range(min(5, num_transactions // 10)):
                            tx_value = current_price * (100 + i * 50)
                            
                            transactions.append({
                                "id": f"TXN-{coin_id[:4].upper()}-{i:04d}",
                                "type": "CRYPTO_TRANSFER",
                                "sender": f"0x{hash(coin_id + str(i)) % (16**8):08x}",
                                "receiver": f"0x{hash(coin_id + str(i+1)) % (16**8):08x}",
                                "amount": round(tx_value, 2),
                                "currency": "USD",
                                "crypto_amount": round(tx_value / current_price, 8),
                                "crypto_currency": coin.get("symbol", "BTC").upper(),
                                "coin_id": coin_id,
                                "timestamp": datetime.now().isoformat(),
                                "price_at_transaction": current_price,
                                "is_suspicious": self._evaluate_suspicion(tx_value, market),
                                "risk_indicators": self._get_risk_indicators(tx_value, market)
                            })
            except httpx.HTTPStatusError:
                continue
        
        transactions.sort(key=lambda x: x.get("amount", 0), reverse=True)
        return transactions[:num_transactions]

    def _evaluate_suspicion(self, amount: float, market: dict) -> bool:
        high_24h_change = abs(market.get("price_change_percentage_24h", 0)) > 15
        large_transaction = amount > 100000
        return high_24h_change or large_transaction

    def _get_risk_indicators(self, amount: float, market: dict) -> list[str]:
        indicators = []
        
        if amount > 100000:
            indicators.append("Large transaction (>100K USD)")
        elif amount > 50000:
            indicators.append("Medium transaction (>50K USD)")
            
        if abs(market.get("price_change_percentage_24h", 0)) > 20:
            indicators.append("High volatility (>20% 24h change)")
        elif abs(market.get("price_change_percentage_24h", 0)) > 10:
            indicators.append("Moderate volatility (>10% 24h change)")
            
        if amount > 50000 and abs(market.get("price_change_percentage_24h", 0)) > 15:
            indicators.append("Volume + Volatility pattern")
            
        return indicators

    def generate_alerts_from_transactions(self, transactions: list[dict]) -> list[dict]:
        alerts = []
        
        for tx in transactions:
            if tx.get("is_suspicious"):
                amount = tx.get("amount", 0)
                
                if amount > 100000:
                    alert_type = "high_risk"
                    confidence = min(95, 70 + amount / 10000)
                elif amount > 50000:
                    alert_type = "medium_risk"
                    confidence = min(85, 50 + amount / 20000)
                else:
                    alert_type = "low_risk"
                    confidence = 50
                
                alerts.append({
                    "id": f"ALT-{tx['id'][-8:]}",
                    "type": alert_type,
                    "entityId": tx.get("sender", "UNKNOWN"),
                    "entityName": f"Crypto Wallet {tx.get('sender', 'UNKNOWN')[:12]}...",
                    "amount": amount,
                    "timestamp": tx.get("timestamp", datetime.now().isoformat()),
                    "description": f"Suspicious {tx.get('crypto_currency', 'CRYPTO')} transfer: ${amount:,.2f}",
                    "indicators": tx.get("risk_indicators", []),
                    "confidence": round(confidence, 2),
                    "reasons": self._generate_reasons(tx)
                })
        
        alerts.sort(key=lambda x: (x["amount"] if x["type"] == "high_risk" else 0, x["confidence"]), reverse=True)
        return alerts[:20]

    def _generate_reasons(self, tx: dict) -> list[dict]:
        reasons = []
        amount = tx.get("amount", 0)
        
        if amount > 100000:
            reasons.append({
                "factor": "Large Transaction",
                "detail": f"${amount:,.0f} exceeds $100K threshold",
                "weight": 40
            })
        elif amount > 50000:
            reasons.append({
                "factor": "Medium Transaction",
                "detail": f"${amount:,.0f} exceeds $50K",
                "weight": 25
            })
        
        risk_indicators = tx.get("risk_indicators", [])
        for indicator in risk_indicators:
            if "Volatility" in indicator:
                reasons.append({
                    "factor": "High Volatility",
                    "detail": indicator,
                    "weight": 20
                })
            elif "pattern" in indicator.lower():
                reasons.append({
                    "factor": "Suspicious Pattern",
                    "detail": indicator,
                    "weight": 30
                })
        
        if tx.get("is_suspicious"):
            reasons.append({
                "factor": "Crypto Flag",
                "detail": f"{tx.get('crypto_currency')} transfer flagged",
                "weight": 15
            })
        
        reasons.sort(key=lambda x: x["weight"], reverse=True)
        return reasons[:3]

    async def close(self):
        if self.client:
            await self.client.aclose()
            self.client = None


crypto_service = CryptoDataService()
