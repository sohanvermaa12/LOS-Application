const STORAGE_KEY = 'los_lead_records';

const defaultLeads = [
  { id: 'LD000123', name: 'Neha Patil', mobile: '9876543210', email: 'neha.patil@gmail.com', source: 'Website', date: '26-09-2026', status: 'New', statusKey: 'new', branch: 'Pune - FC Road', product: 'Home Loan', amount: '25,00,000', remarks: 'Interested in home loan, please contact me.' },
  { id: 'LD000122', name: 'Rohit Sharma', mobile: '8765432109', email: 'rohit.sharma@gmail.com', source: 'Mobile App', date: '25-09-2026', status: 'In Progress', statusKey: 'progress', branch: 'Koramangala', product: 'Personal Loan', amount: '12,00,000', remarks: 'Looking for quick processing.' },
  { id: 'LD000121', name: 'Pooja Deshmukh', mobile: '9123456780', email: 'pooja.deshmukh@gmail.com', source: 'Branch Office', date: '25-09-2026', status: 'Contacted', statusKey: 'contacted', branch: 'Andheri West', product: 'Business Loan', amount: '18,50,000', remarks: 'Waiting for discussion callback.' },
  { id: 'LD000120', name: 'Amit Joshi', mobile: '9988776655', email: 'amit.joshi@gmail.com', source: 'Partner Network', date: '24-09-2026', status: 'New', statusKey: 'new', branch: 'Pimpri', product: 'Home Loan', amount: '30,00,000', remarks: 'Family property loan inquiry.' },
  { id: 'LD000119', name: 'Sneha Kulkarni', mobile: '9098765432', email: 'sneha.kulkarni@gmail.com', source: 'Sales Team', date: '24-09-2026', status: 'Qualified', statusKey: 'qualified', branch: 'Salt Lake', product: 'Personal Loan', amount: '9,50,000', remarks: 'Documents uploaded and pending review.' },
];

export function getLeads() {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fall back to the existing lead records.
    }
  }

  return defaultLeads;
}

export function saveLeads(leads) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // Keep the in-memory lead list available when browser storage is unavailable.
    }
  }

  return leads;
}
