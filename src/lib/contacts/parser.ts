export interface Contact {
  name: string;
  phone: string;
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "").replace(/^88/, "");
}

export function parseVcf(text: string): Contact[] {
  const contacts: Contact[] = [];
  const blocks = text.split(/(?=\r?\nBEGIN:VCARD|\r?\nVCARD|\bBEGIN:VCARD)/i);
  for (const block of blocks) {
    if (!/TEL/i.test(block)) continue;
    let name = "";
    let phone = "";
    const fnMatch = block.match(/(?:^|\n)\s*FN\s*:\s*(.+?)\s*(?:\n|$)/i);
    if (fnMatch) {
      name = fnMatch[1].trim();
    } else {
      const nMatch = block.match(/(?:^|\n)\s*N\s*:\s*(.+?)\s*(?:\n|$)/i);
      if (nMatch) {
        const parts = nMatch[1].split(";").map(p => p.trim());
        name = [parts[1], parts[0]].filter(Boolean).join(" ");
      }
    }
    const telMatch = block.match(/(?:^|\n)\s*TEL[^:]*:\s*([^\n]+)/i);
    if (telMatch) {
      phone = normalizePhone(telMatch[1]);
    }
    if (phone.length >= 10) {
      contacts.push({ name, phone });
    }
  }
  return contacts;
}

export function parseCsv(text: string): Contact[] {
  const contacts: Contact[] = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const cells = parseCsvLine(line);
    if (cells.length === 0) continue;
    let name = "";
    let phone = "";
    for (const cell of cells) {
      const digits = cell.replace(/[^0-9]/g, "");
      if (digits.length >= 10 && !phone) {
        phone = digits.replace(/^88/, "");
      } else if (!name) {
        name = cell;
      }
    }
    if (!phone && cells.length > 0) {
      const digits = cells[cells.length - 1].replace(/[^0-9]/g, "");
      if (digits.length >= 10) phone = digits.replace(/^88/, "");
    }
    if (phone.length >= 10) {
      contacts.push({ name, phone });
    }
  }
  return contacts;
}

export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

export function parseContactsFile(text: string, fileName: string): Contact[] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".vcf")) return parseVcf(text);
  if (lower.endsWith(".csv")) return parseCsv(text);
  const firstLine = text.split(/\r?\n/).find(l => l.trim()) || "";
  const looksLikeVcf = /^BEGIN:VCARD/i.test(firstLine) || /TEL/i.test(firstLine);
  if (looksLikeVcf) return parseVcf(text);
  return parseCsv(text);
}

export function dedupeContacts(contacts: Contact[]): Contact[] {
  const map = new Map<string, string>();
  for (const c of contacts) {
    const key = normalizePhone(c.phone);
    if (!key) continue;
    if (!map.has(key)) map.set(key, c.name || key);
  }
  return Array.from(map.entries()).map(([phone, name]) => ({ name, phone }));
}

export function chunkContacts(contacts: Contact[], size = 200): Contact[][] {
  const chunks: Contact[][] = [];
  for (let i = 0; i < contacts.length; i += size) {
    chunks.push(contacts.slice(i, i + size));
  }
  return chunks;
}
