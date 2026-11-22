const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function formatDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function addDays(base, n) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

// Choice: take the first matching weekday strictly after today; if that falls
// within the next 2 days, push it one week further so "next Friday" said on a
// Wednesday means the Friday after the coming one.
function nextWeekday(today, dow) {
  let diff = (dow - today.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  if (diff <= 2) diff += 7;
  return addDays(today, diff);
}

function parseAmount(text) {
  const re = /(?:\$\s?)?\b\d[\d,]*(?:\.\d+)?\b(?!\s*days?\b)/g;
  const m = [...text.matchAll(re)][0];
  if (!m) return null;
  return Number(m[0].replace(/[^\d.]/g, ''));
}

function parseDueDate(text, today) {
  const lower = text.toLowerCase();
  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDays) return formatDate(addDays(today, Number(inDays[1])));
  if (/\btomorrow\b/.test(lower)) return formatDate(addDays(today, 1));
  if (/\btoday\b/.test(lower)) return formatDate(today);
  const wd = lower.match(/\b(?:due|next)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (wd) return formatDate(nextWeekday(today, WEEKDAYS.indexOf(wd[1])));
  return null;
}

// Client is the leading capitalised words after "Billed"/"Invoice"/"for".
// If a lowercase word follows, the project starts there. If every word is
// capitalised, client is the first two words and the rest is the project.
// Project's first letter is capitalised; both are trimmed; null if empty.
function parseClientAndProject(text) {
  const m = text.match(/\b(?:billed|invoice)\s+/i) || text.match(/\bfor\s+/i);
  if (!m) return { client: null, project: null };
  const rest = text.slice(m.index + m[0].length);
  const cut = rest.search(/\$|\d|\bdue\b|\bin\s+\d|\btoday\b|\btomorrow\b/i);
  const segment = (cut === -1 ? rest : rest.slice(0, cut)).trim();
  const words = segment.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < words.length && /^[A-Z]/.test(words[i])) i++;
  if (i === words.length) i = Math.min(i, 2);
  const client = i > 0 ? words.slice(0, i).join(' ') : null;
  const remaining = words.slice(i).join(' ');
  const project = remaining ? remaining[0].toUpperCase() + remaining.slice(1) : null;
  return { client, project };
}

export function parseInvoiceText(text, now = new Date()) {
  const source = String(text ?? '');
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const { client, project } = parseClientAndProject(source);
  return {
    client,
    project,
    amount: parseAmount(source),
    dueDate: parseDueDate(source, today),
  };
}

export default parseInvoiceText;
