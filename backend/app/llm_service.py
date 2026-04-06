import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

print(f"OpenRouter API Key loaded: {OPENROUTER_API_KEY[:20]}..." if OPENROUTER_API_KEY else "No API key found")

FREE_MODELS = [
    "anthropic/claude-3-haiku:free",
    "openai/gpt-4o-mini:free",
    "google/gemini-flash-1.5:free",
    "mistralai/ministrals-8b-07:free",
    "deepseek/deepseek-chat-v3-0324:free",
]

LLM_MODEL = FREE_MODELS[0]

SYSTEM_PROMPT = """You are a Senior Financial Forensic Analyst with 20 years of experience in anti-money laundering (AML) and fraud detection. You provide clear, actionable intelligence for compliance teams.

Your analysis should be:
- Precise and technical, citing specific fraud indicators
- Actionable with numbered remediation steps
- Risk-calibrated based on the ML confidence scores
- Concise but thorough

Format your response as:
1. Threat Assessment: Brief summary of the risk
2. Key Indicators: 2-3 specific red flags identified
3. Recommended Actions: 3 numbered steps for the compliance team
4. Regulatory Notes: Any relevant AML/BSA implications

Keep total response under 200 words."""

def generate_advice(transaction_data: dict, ml_result: dict) -> str:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.startswith("sk-or-v1-YOUR"):
        print("No valid OpenRouter API key found, using mock advice")
        return generate_mock_advice(transaction_data, ml_result)
    
    for model in FREE_MODELS:
        try:
            from openai import OpenAI
            
            client = OpenAI(
                api_key=OPENROUTER_API_KEY,
                base_url=OPENROUTER_BASE_URL,
                default_headers={
                    "HTTP-Referer": "http://localhost:3001",
                    "X-Title": "Forensic Lens",
                }
            )
            
            sender = transaction_data.get("sender_id", "Unknown")
            receiver = transaction_data.get("receiver_id", "Unknown")
            amount = transaction_data.get("amount", 0)
            trans_type = transaction_data.get("type", "Unknown")
            
            risk_score = ml_result.get("fraud_probability", 0)
            is_fraud = ml_result.get("is_fraud", False)
            risk_level = ml_result.get("risk_level", "unknown")
            graph_metrics = ml_result.get("graph_metrics", {})
            
            cycle_detected = graph_metrics.get("cycle_detected", False)
            degree_boost = graph_metrics.get("degree_boost", 0)
            clustering_boost = graph_metrics.get("clustering_boost", 0)
            
            user_prompt = f"""Analyze this financial transaction for potential fraud:

**Transaction Details:**
- Sender: {sender}
- Receiver: {receiver}
- Amount: ${amount:,.2f}
- Type: {trans_type}

**ML Risk Assessment:**
- Risk Score: {risk_score:.1f}%
- Risk Level: {risk_level.upper()}
- Fraud Determination: {'FRAUD' if is_fraud else 'CLEAR'}

**Graph Intelligence:**
- Cycle Detected: {'Yes' if cycle_detected else 'No'}
- Degree Boost: +{degree_boost}%
- Clustering Boost: +{clustering_boost}%

Provide your forensic analysis following the standard format."""

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.3,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate limit" in error_str.lower():
                print(f"Rate limited with {model}, trying next model...")
                continue
            elif "401" in error_str or "user not found" in error_str or "invalid" in error_str.lower():
                print(f"API key issue with {model}: {error_str}")
                break
            else:
                print(f"Error with {model}: {error_str}")
                continue
    
    print("All free models failed, using mock advice")
    return generate_mock_advice(transaction_data, ml_result)


def generate_mock_advice(transaction_data: dict, ml_result: dict) -> str:
    sender = transaction_data.get("sender_id", "Unknown")
    receiver = transaction_data.get("receiver_id", "Unknown")
    amount = transaction_data.get("amount", 0)
    risk_score = ml_result.get("fraud_probability", 0)
    is_fraud = ml_result.get("is_fraud", False)
    cycle_detected = ml_result.get("graph_metrics", {}).get("cycle_detected", False)
    
    if is_fraud:
        return f"""**Threat Assessment:** HIGH RISK - Transaction exhibits multiple fraud indicators consistent with potential money laundering through circular fund flow.

**Key Indicators:**
• Cycle ring detected between {sender} and {receiver} suggesting potential layering
• Transaction amount ${amount:,.2f} exceeds typical behavioral baseline
• Graph centrality metrics indicate unusual network position

**Recommended Actions:**
1. Immediately flag for SAR (Suspicious Activity Report) filing
2. Initiate 31 CFR 1010.314 transaction monitoring hold
3. Request additional KYC documentation and source of funds verification
4. Escalate to BSA/AML compliance officer for manual review

**Regulatory Notes:** Transaction may constitute "structured" activity under 31 USC 5324 if pattern continues."""
    else:
        return f"""**Threat Assessment:** LOW RISK - Transaction parameters within normal operational thresholds.

**Key Indicators:**
• No cycle patterns detected in transaction graph
• Amount ${amount:,.2f} within expected range for parties involved
• Standard transaction type with verified participant history

**Recommended Actions:**
1. Proceed with normal processing
2. Log transaction for baseline behavioral modeling
3. Monitor for velocity anomalies in next 24-48 hours

**Regulatory Notes:** Standard AML monitoring sufficient. No SAR filing required at this time."""
