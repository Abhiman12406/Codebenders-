import os
import json
import time
from dotenv import load_dotenv

load_dotenv('.env')

from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key=os.getenv('FIRECRAWL_API_KEY'))

queries = [
    {
        "angle": "freelancer_late_payment_stats_impact",
        "query": "freelancer late invoice payment statistics root causes cash flow impact"
    },
    {
        "angle": "tone_escalation_recovery_sequences",
        "query": "invoice reminder email sequence tone escalation polite assertive overdue templates"
    },
    {
        "angle": "debtor_risk_scoring_prediction",
        "query": "accounts receivable late payment prediction credit risk scoring small business models"
    },
    {
        "angle": "ai_agents_accounts_receivable",
        "query": "AI agents autonomous accounts receivable debt collection invoice recovery fintech"
    },
    {
        "angle": "whatsapp_sms_omnichannel_reminders",
        "query": "WhatsApp payment reminders invoice collection conversion rate open rate business"
    },
    {
        "angle": "dynamic_discounting_negotiation",
        "query": "dynamic discounting invoice early payment discount installment plan negotiation freelancer"
    },
    {
        "angle": "legal_guardrails_freelance_protection",
        "query": "Freelance Isn't Free Act late payment interest fees legal rights notice requirements"
    },
    {
        "angle": "ai_debt_collection_risks_limitations",
        "query": "risks of AI in debt collection accounts receivable compliance customer relationship damage"
    }
]

results = []

for q in queries:
    print(f"Searching: {q['query']} (Angle: {q['angle']})")
    try:
        res = app.search(q['query'], limit=3)
        web_items = []
        if hasattr(res, 'web') and res.web:
            for item in res.web:
                web_items.append({
                    "title": getattr(item, 'title', ''),
                    "url": getattr(item, 'url', ''),
                    "description": getattr(item, 'description', '')
                })
        results.append({
            "angle": q["angle"],
            "query": q["query"],
            "items": web_items
        })
        time.sleep(1)
    except Exception as e:
        print(f"Error searching {q['query']}: {e}")
        results.append({
            "angle": q["angle"],
            "query": q["query"],
            "error": str(e)
        })

os.makedirs("scratch", exist_ok=True)
with open("scratch/firecrawl_research_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Completed {len(results)} search angles. Saved to scratch/firecrawl_research_results.json")
