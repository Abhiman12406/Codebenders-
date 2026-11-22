export function parseInvoicePrompt(prompt, clients = []) {
  if (!prompt || typeof prompt !== 'string') {
    return null;
  }

  const text = prompt.trim();

  // 1. Amount extraction: e.g. $3,200, 3200$, $4500, 4500 USD, 3.2k
  let amount = null;
  const kMatch = text.match(/\$?(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    amount = parseFloat(kMatch[1]) * 1000;
  } else {
    const dollarMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/);
    if (dollarMatch) {
      amount = parseFloat(dollarMatch[1].replace(/,/g, ''));
    } else {
      const numMatch = text.match(/\b(\d{3,6})\b/);
      if (numMatch) {
        amount = parseFloat(numMatch[1]);
      }
    }
  }

  // 2. Client matching
  let matchedClient = null;
  const lowerText = text.toLowerCase();

  for (const client of clients) {
    const clientName = client.name.toLowerCase();
    const company = (client.company || '').toLowerCase();
    if (lowerText.includes(clientName) || (company && lowerText.includes(company))) {
      matchedClient = client;
      break;
    }
  }

  // If no known client found, look for "to [Name]" or "for [Name]"
  if (!matchedClient) {
    const nameMatch = text.match(/(?:to|for|billed)\s+([A-Z][a-zA-Z0-9\s&]+?)(?=\s+(?:for|\$|due|amount|net|\d))/i);
    if (nameMatch) {
      const rawName = nameMatch[1].trim();
      matchedClient = {
        name: rawName,
        company: rawName,
        phone: '',
      };
    }
  }

  // 3. Due date calculation
  let dueDate = null;
  const today = new Date();

  if (/tomorrow/i.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    dueDate = d.toISOString().split('T')[0];
  } else if (/next week/i.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    dueDate = d.toISOString().split('T')[0];
  } else if (/next friday/i.test(text)) {
    const d = new Date(today);
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    dueDate = d.toISOString().split('T')[0];
  } else if (/in (\d+)\s*days?/i.test(text)) {
    const match = text.match(/in (\d+)\s*days?/i);
    const days = parseInt(match[1], 10);
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    dueDate = d.toISOString().split('T')[0];
  } else if (/net\s*30/i.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 30);
    dueDate = d.toISOString().split('T')[0];
  } else if (/net\s*15/i.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 15);
    dueDate = d.toISOString().split('T')[0];
  } else {
    // Default 14 days
    const d = new Date(today);
    d.setDate(d.getDate() + 14);
    dueDate = d.toISOString().split('T')[0];
  }

  // 4. Project description
  let projectTitle = 'Design & Consulting Services';
  if (/brand|identity|logo/i.test(text)) {
    projectTitle = 'Brand Identity & Visual System';
  } else if (/figma|ui|ux|mobile|app|sprint/i.test(text)) {
    projectTitle = 'UI/UX Design Sprint & Component Library';
  } else if (/packaging|box/i.test(text)) {
    projectTitle = 'Packaging Design & Print Production';
  } else if (/motion|3d|render/i.test(text)) {
    projectTitle = '3D Motion Graphics & Animation Assets';
  } else if (/retainer|monthly/i.test(text)) {
    projectTitle = 'Monthly Creative Direction Retainer';
  }

  return {
    rawPrompt: prompt,
    client: matchedClient ? matchedClient.name : 'Direct Client',
    client_id: matchedClient?.id || null,
    client_phone: matchedClient?.phone || '',
    amount: amount || 1500,
    dueDate,
    projectTitle,
    items: [
      {
        desc: projectTitle,
        qty: 1,
        rate: amount || 1500,
      },
    ],
  };
}
