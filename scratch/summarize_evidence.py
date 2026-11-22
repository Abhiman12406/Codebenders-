import json

data = json.load(open('scratch/firecrawl_research_results.json', encoding='utf-8'))

for d in data:
    print("=" * 80)
    print(f"ANGLE: {d['angle']}")
    print(f"QUERY: {d['query']}")
    print("=" * 80)
    for i, item in enumerate(d.get('items', []), 1):
        print(f"\n[{i}] {item.get('title')}")
        print(f"URL: {item.get('url')}")
        desc = item.get('description') or ''
        clean_desc = ' '.join(desc.split())
        print(f"SUMMARY: {clean_desc[:400]}...")
