'use strict';

const pdfParse = require('pdf-parse');

// Matches "8 Mar 2025" or "15 Jan 2025" at the START of a line
const DATE_RE   = /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i;
// Matches every AU$ amount on a line — captures the AU$ prefix so we can strip it cleanly
const AMOUNT_RE = /AU\$[\d,]+\.?\d*/g;

const MONTHS = {
  jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
  jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
};

// "8 Mar 2025" → "2025-03-08"   "15 Jan 2025" → "2025-01-15"
function parseRevolutDate(str) {
  const m = str.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})/i);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const mo  = String(MONTHS[m[2].toLowerCase()]).padStart(2, '0');
  return `${m[3]}-${mo}-${day}`;
}

// "AU$4.99" → 4.99   "AU$1,234.56" → 1234.56
function parseAUD(str) {
  return parseFloat(str.replace(/^AU\$/, '').replace(/,/g, ''));
}

function parseRevolutText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let inSection = false;
  const rawTxns = [];
  let current   = null;

  for (const line of lines) {
    // Section gate — only parse "Account transactions from ..." block
    if (/^Account transactions from/i.test(line)) {
      inSection = true;
      continue;
    }
    // Pending and Reverted sections must be excluded entirely
    if (/^(Pending from|Reverted from)/i.test(line)) {
      inSection = false;
      if (current) { rawTxns.push(current); current = null; }
      continue;
    }
    if (!inSection) continue;

    // Skip the column header row
    if (/^Date\s+Description/i.test(line)) continue;

    if (DATE_RE.test(line)) {
      // New transaction starts
      if (current) rawTxns.push(current);
      const dateMatch = line.match(DATE_RE)[0];
      const amounts   = line.match(AMOUNT_RE) || [];
      // Strip date prefix and all AU$ amounts to get the bare description text
      let mainText = line.slice(dateMatch.length);
      amounts.forEach(a => { mainText = mainText.replace(a, ''); });
      mainText = mainText.replace(/[-–—\s]+$/, '').replace(/^[-–—\s]+/, '').trim();
      current = { dateStr: dateMatch, mainText, amounts, extras: [] };
    } else if (current) {
      // Continuation line (description detail, "To: ...", "From: ...", "Card: ..." etc.)
      current.extras.push(line);
    }
  }
  if (current) rawTxns.push(current);

  const rows = [];
  let prevBalance = null;

  for (const txn of rawTxns) {
    const date = parseRevolutDate(txn.dateStr);
    if (!date) continue;

    const allAmounts = txn.amounts.map(parseAUD);
    // Need at least transaction amount + balance; skip malformed rows
    if (allAmounts.length < 2) continue;

    const balance   = allAmounts[allAmounts.length - 1];  // rightmost = Balance column
    const txnAmount = allAmounts[allAmounts.length - 2];  // second-to-last = Money in/out

    // Sign detection — three-tier priority:
    // 1. Continuation line prefix ("From:" = income, "To:" = expense)
    // 2. Balance delta (reliable if prevBalance is available and amounts are on the main line)
    // 3. Default negative (first row with no To:/From: — almost always a fee or expense)
    const fromLine = txn.extras.find(e => /^From:/i.test(e));
    const toLine   = txn.extras.find(e => /^To:/i.test(e));

    let signedAmount;
    let signSource;

    if (fromLine) {
      signedAmount = txnAmount;
      signSource   = 'from_line';
    } else if (toLine) {
      signedAmount = -txnAmount;
      signSource   = 'to_line';
    } else if (prevBalance !== null) {
      // Balance delta: if balance fell, money went out (negative); if rose, money came in (positive)
      const delta  = balance - prevBalance;
      signedAmount = delta >= 0 ? txnAmount : -txnAmount;
      signSource   = 'balance_delta';
    } else {
      // No prior balance and no directional line — default expense
      signedAmount = -txnAmount;
      signSource   = 'default_negative';
    }

    // Join main description with the first continuation line for context
    const description = [txn.mainText, txn.extras[0] || '']
      .filter(Boolean)
      .join(' · ');

    rows.push({
      date,
      description,
      amount:      Math.round(signedAmount * 100) / 100,
      raw_section: 'Account transactions',
      _sign_source: signSource,  // debug field — stripped in 5c before DB write
    });

    prevBalance = balance;
  }

  return rows;
}

exports.parseAndPreview = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Magic-byte check — all valid PDFs start with %PDF regardless of browser MIME
  if (req.file.buffer.slice(0, 4).toString('ascii') !== '%PDF') {
    return res.status(400).json({ error: 'File must be a PDF' });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const rows = parseRevolutText(data.text);
    res.json({ count: rows.length, rows });
  } catch (err) {
    console.error('PDF parse error:', err);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
};
