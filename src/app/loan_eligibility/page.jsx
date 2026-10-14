'use client';

import { useState } from 'react';
import { Check, CirclePlus, LoaderCircle, Trash2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { assessLoanEligibility } from '../../services/loanEligibility';

const makeRow = (id, type, source, amount = '') => ({ id, type, source, amount });
const initialForm = () => ({
  customerNumber: '', initials: '', name: '', requestedAmount: '', collateralValue: '', monthlyDebtService: '0', cibilScore: '',
  rows: [makeRow(1, 'Income', 'Salary'), makeRow(2, 'Expense', 'Others', '0')]
});

function money(value) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function validate(form) {
  const errors = {};
  if (!/^[A-Z0-9-]{4,24}$/i.test(form.customerNumber.trim())) errors.customerNumber = 'Enter a valid customer number (4–24 letters, numbers, or hyphens).';
  if (form.initials && !/^[A-Z.]{1,5}$/i.test(form.initials.trim())) errors.initials = 'Use up to 5 letters or periods.';
  if (form.name.trim().length < 2 || form.name.trim().length > 100) errors.name = 'Enter a full name between 2 and 100 characters.';
  if (!form.rows.some((row) => row.type === 'Income' && Number(row.amount) > 0)) errors.income = 'Add at least one income amount greater than zero.';
  form.rows.forEach((row) => {
    if (!row.source.trim()) errors[`row-${row.id}-source`] = 'Enter an income or expense source.';
    if (row.amount === '' || !/^\d+(\.\d{1,2})?$/.test(String(row.amount)) || Number(row.amount) < 0) errors[`row-${row.id}-amount`] = 'Enter a non-negative amount with up to 2 decimal places.';
  });
  for (const field of ['requestedAmount', 'monthlyDebtService']) {
    if (!form[field] || !/^\d+(\.\d{1,2})?$/.test(form[field]) || Number(form[field]) < 0) errors[field] = 'Enter a valid non-negative amount.';
  }
  if (form.collateralValue && (!/^\d+(\.\d{1,2})?$/.test(form.collateralValue) || Number(form.collateralValue) <= 0)) errors.collateralValue = 'Enter a valid amount greater than zero.';
  if (!/^\d{3}$/.test(form.cibilScore) || Number(form.cibilScore) < 300 || Number(form.cibilScore) > 900) errors.cibilScore = 'CIBIL score must be between 300 and 900.';
  return errors;
}

const styles = `
.le-wrap{max-width:1440px;margin:0 auto;color:#243b3d}.le-card{overflow:hidden;border:1px solid #dbe5e2;border-radius:8px;background:#fff;box-shadow:0 6px 22px #193a6210}.le-heading{margin:0;padding:14px 20px;border-bottom:1px solid #e4ece9;color:#1d4947;text-align:center;font:700 18px Georgia,serif;text-decoration:underline}.le-form{padding:18px 3.5% 22px}.le-customer{display:grid;grid-template-columns:minmax(210px,.75fr) minmax(300px,1.2fr);gap:18px 30px;margin-bottom:17px}.le-name-fields{display:grid;grid-template-columns:78px minmax(0,1fr);gap:9px;align-items:end}.le-field{display:grid;gap:6px;min-width:0;color:#334d4f;font-size:11px;font-weight:700}.le-field input,.le-field select{width:100%;min-width:0;height:37px;padding:0 9px;border:1px solid #b9cbca;border-radius:4px;background:#fbfdfc;color:#273e40;font:400 12px Arial,sans-serif;outline:none}.le-field input:focus,.le-field select:focus{border-color:#177e7a;box-shadow:0 0 0 3px #177e7a19}.le-field input[aria-invalid=true]{border-color:#b83b3b;background:#fffafa}.le-error{color:#b33737;font-size:10px;font-weight:500;line-height:1.4}.le-table-wrap{overflow-x:auto;border:1px solid #becbc9;border-radius:3px}.le-table{width:100%;min-width:720px;border-collapse:collapse;table-layout:fixed}.le-table th,.le-table td{height:40px;padding:6px 10px;border-right:1px solid #cbd4d3;border-bottom:1px solid #cbd4d3;text-align:center;color:#30474a;font-size:11px}.le-table th{height:36px;background:#f1f5f4;font-weight:700}.le-table tr:last-child td{border-bottom:0}.le-table th:last-child,.le-table td:last-child{border-right:0}.le-table td input,.le-table td select{width:100%;height:31px;padding:0 7px;border:1px solid #c6d3d1;border-radius:3px;background:#fff;color:#2d4648;font-size:11px}.le-row-source{text-align:left!important}.le-remove{display:inline-grid;place-items:center;width:30px;height:29px;border-radius:4px;color:#845656}.le-remove:hover{background:#fbefef;color:#a02e2e}.le-add{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:7px 10px;border:1px solid #ccddda;border-radius:4px;background:#f8fbfa;color:#176e67;font-size:11px;font-weight:700}.le-subheading{margin:21px 0 11px;color:#365357;font-size:12px;font-weight:700}.le-input-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 18px}.le-metrics{display:grid;grid-template-columns:repeat(7,minmax(92px,1fr));gap:11px;margin-top:17px}.le-metric{display:grid;gap:6px;color:#334d4f;font-size:10px;font-weight:700}.le-metric input{width:100%;height:36px;padding:0 8px;border:1px solid #9cb6c1;border-radius:3px;background:#f8fbfc;color:#24464e;font-size:12px;text-align:center}.le-metric input[readonly]{background:#f2f7f7}.le-decision{display:flex;align-items:center;justify-content:center;gap:10px;margin:15px auto 0;color:#307e51;font-size:12px;font-weight:700}.le-decision input{width:min(200px,48vw);height:35px;border:1px solid #91bd9b;border-radius:3px;background:#f7fbf7;color:#3d764b;text-align:center;font-weight:700}.le-decision.pending{color:#8b6822}.le-decision.pending input{border-color:#d8c492;background:#fffdf7;color:#80621e}.le-actions{display:flex;justify-content:center;gap:12px;margin-top:20px}.le-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 16px;border:1px solid #d1ddda;border-radius:5px;background:white;color:#435a5c;font-size:12px;font-weight:700}.le-btn:hover{background:#f4f8f7}.le-submit{border-color:#177e7a;background:#177e7a;color:white}.le-submit:hover{background:#0c6662}.le-btn:disabled{opacity:.7;cursor:wait}.le-message{margin:0 0 13px;padding:11px 13px;border:1px solid #c6dfd2;border-radius:5px;background:#f1faf5;color:#276b4f;font-size:11px;line-height:1.5}.le-message.error{border-color:#e7cccc;background:#fff7f7;color:#a43838}.le-spin{animation:le-spin 1s linear infinite}@keyframes le-spin{to{transform:rotate(360deg)}}
@media(max-width:920px){.le-customer{grid-template-columns:1fr 1.4fr}.le-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:620px){.le-form{padding:15px}.le-customer{grid-template-columns:1fr;gap:14px}.le-input-grid{grid-template-columns:1fr}.le-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.le-actions{display:grid;grid-template-columns:1fr 1fr}.le-btn{padding:0 10px}.le-name-fields{grid-template-columns:68px minmax(0,1fr)}}
`;

export default function LoanEligibilityPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [decision, setDecision] = useState('');

  const totalIncome = form.rows.filter((row) => row.type === 'Income').reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const totalExpense = form.rows.filter((row) => row.type === 'Expense').reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const netIncome = totalIncome - totalExpense;
  const debtService = Number(form.monthlyDebtService) || 0;
  const metric = (value, suffix = '%') => totalIncome > 0 && Number.isFinite(value) ? `${value.toFixed(2)}${suffix}` : '';
  const foir = metric((debtService / (totalIncome || 1)) * 100);
  const dti = metric(((totalExpense + debtService) / (totalIncome || 1)) * 100);
  const ltv = Number(form.collateralValue) > 0 && Number(form.requestedAmount) >= 0 ? `${((Number(form.requestedAmount) / Number(form.collateralValue)) * 100).toFixed(2)}%` : '';
  const dscr = debtService > 0 ? `${(netIncome / debtService).toFixed(2)}x` : '';
  const ndir = metric((netIncome / (totalIncome || 1)) * 100);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setMessage(null);
    setDecision('');
  }

  function updateRow(id, field, value) {
    setForm((current) => ({ ...current, rows: current.rows.map((row) => row.id === id ? { ...row, [field]: value } : row) }));
    setErrors((current) => ({ ...current, [`row-${id}-${field}`]: '' }));
    setMessage(null);
    setDecision('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    const invalid = Object.keys(nextErrors)[0];
    if (invalid) {
      const field = invalid.startsWith('row-') ? `le-${invalid}` : `le-${invalid}`;
      document.getElementById(field)?.focus();
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const result = await assessLoanEligibility({
        customer_number: form.customerNumber.trim(), customer_name: `${form.initials.trim()} ${form.name.trim()}`.trim(),
        requested_amount: Number(form.requestedAmount), collateral_value: form.collateralValue ? Number(form.collateralValue) : null,
        monthly_debt_service: debtService,
        income_expenses: form.rows.map((row) => ({ type: row.type.toLowerCase(), source: row.source.trim(), amount: Number(row.amount) })),
        cibil_score: Number(form.cibilScore), calculated_metrics: { total_income: totalIncome, total_expense: totalExpense, net_income: netIncome, foir: foir || null, dti: dti || null, ltv: ltv || null, dscr: dscr || null, ndir: ndir || null }
      });
      if (result.configured) {
        const resultDecision = result.result?.data?.decision ?? result.result?.decision ?? result.result?.data?.eligible;
        setDecision(resultDecision === undefined ? 'Assessment received' : typeof resultDecision === 'boolean' ? (resultDecision ? 'Eligible' : 'Not eligible') : String(resultDecision));
        setMessage({ type: 'success', text: result.result?.message || 'Eligibility assessment completed.' });
      } else {
        setDecision('Pending Java policy review');
        setMessage({ type: 'info', text: 'Financial metrics are calculated from the entered data. Final eligibility is not determined until the Java policy API is configured.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to assess eligibility.' });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm(initialForm());
    setErrors({});
    setMessage(null);
    setDecision('');
  }

  function addRow() {
    const id = Math.max(0, ...form.rows.map((row) => row.id)) + 1;
    setForm((current) => ({ ...current, rows: [...current.rows, makeRow(id, 'Income', '')] }));
  }

  function removeRow(id) {
    setForm((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`row-${id}-`))));
  }

  return (
    <AppShell title="Loan Eligibility">
      <style>{styles}</style>
      <main className="le-wrap">
        <PageHeader eyebrow="CREDIT ASSESSMENT" title="Loan Eligibility" description="Review declared income, obligations, and credit inputs before policy assessment." />
        {message && <div className={`le-message${message.type === 'error' ? ' error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
        <section className="le-card" aria-labelledby="le-heading">
          <h2 className="le-heading" id="le-heading">Loan Eligibility</h2>
          <form className="le-form" onSubmit={submit} noValidate>
            <div className="le-customer">
              <label className="le-field" htmlFor="le-customerNumber">Customer Number *<input id="le-customerNumber" value={form.customerNumber} onChange={(event) => update('customerNumber', event.target.value.toUpperCase())} maxLength={24} autoComplete="off" aria-invalid={Boolean(errors.customerNumber)} /></label>
              {errors.customerNumber && <small className="le-error">{errors.customerNumber}</small>}
              <div className="le-name-fields">
                <label className="le-field" htmlFor="le-initials">Initials<input id="le-initials" value={form.initials} onChange={(event) => update('initials', event.target.value.toUpperCase())} maxLength={5} aria-invalid={Boolean(errors.initials)} /></label>
                <label className="le-field" htmlFor="le-name">Name *<input id="le-name" value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={100} autoComplete="name" aria-invalid={Boolean(errors.name)} /></label>
              </div>
              {(errors.initials || errors.name) && <small className="le-error">{errors.initials || errors.name}</small>}
            </div>

            <div className="le-table-wrap">
              <table className="le-table">
                <thead><tr><th>Type</th><th>Source</th><th>Income Amount (₹ / month)</th><th>Expense Amount (₹ / month)</th><th>Action</th></tr></thead>
                <tbody>
                  {form.rows.map((row) => (
                    <tr key={row.id}>
                      <td><select id={`le-row-${row.id}-type`} aria-label={`Type for row ${row.id}`} value={row.type} onChange={(event) => updateRow(row.id, 'type', event.target.value)}><option>Income</option><option>Expense</option></select></td>
                      <td className="le-row-source"><input id={`le-row-${row.id}-source`} aria-label={`Source for row ${row.id}`} value={row.source} onChange={(event) => updateRow(row.id, 'source', event.target.value)} maxLength={60} aria-invalid={Boolean(errors[`row-${row.id}-source`])} />{errors[`row-${row.id}-source`] && <small className="le-error">{errors[`row-${row.id}-source`]}</small>}</td>
                      <td>{row.type === 'Income' ? <><input id={`le-row-${row.id}-amount`} aria-label={`Income amount for row ${row.id}`} type="number" min="0" step="0.01" inputMode="decimal" value={row.amount} onChange={(event) => updateRow(row.id, 'amount', event.target.value)} aria-invalid={Boolean(errors[`row-${row.id}-amount`])} />{errors[`row-${row.id}-amount`] && <small className="le-error">{errors[`row-${row.id}-amount`]}</small>}</> : '—'}</td>
                      <td>{row.type === 'Expense' ? <><input id={`le-row-${row.id}-amount`} aria-label={`Expense amount for row ${row.id}`} type="number" min="0" step="0.01" inputMode="decimal" value={row.amount} onChange={(event) => updateRow(row.id, 'amount', event.target.value)} aria-invalid={Boolean(errors[`row-${row.id}-amount`])} />{errors[`row-${row.id}-amount`] && <small className="le-error">{errors[`row-${row.id}-amount`]}</small>}</> : '—'}</td>
                      <td><button className="le-remove" type="button" onClick={() => removeRow(row.id)} aria-label={`Remove ${row.type.toLowerCase()} row ${row.id}`} title="Remove row"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  <tr><th scope="row">Total</th><td></td><td>₹ {money(totalIncome)}</td><td>₹ {money(totalExpense)}</td><td></td></tr>
                </tbody>
              </table>
            </div>
            {errors.income && <p className="le-error" role="alert">{errors.income}</p>}
            {Object.keys(errors).some((key) => key.endsWith('-amount')) && <p className="le-error" role="alert">Check income and expense amount fields.</p>}
            <button className="le-add" type="button" onClick={addRow}><CirclePlus size={15} /> Add income or expense</button>

            <h3 className="le-subheading">Assessment inputs</h3>
            <div className="le-input-grid">
              {[
                ['requestedAmount', 'Requested Loan Amount (₹)', true], ['collateralValue', 'Collateral Value (₹)', false], ['monthlyDebtService', 'Monthly Debt Service (₹)', true], ['cibilScore', 'CIBIL Score (300–900)', true]
              ].map(([field, label, required]) => (
                <label className="le-field" htmlFor={`le-${field}`} key={field}>{label}{required ? ' *' : ''}<input id={`le-${field}`} type={field === 'cibilScore' ? 'number' : 'number'} min={field === 'cibilScore' ? '300' : '0'} max={field === 'cibilScore' ? '900' : undefined} step={field === 'cibilScore' ? '1' : '0.01'} inputMode={field === 'cibilScore' ? 'numeric' : 'decimal'} value={form[field]} onChange={(event) => update(field, event.target.value)} aria-invalid={Boolean(errors[field])} />{errors[field] && <small className="le-error">{errors[field]}</small>}</label>
              ))}
            </div>

            <div className="le-metrics" aria-label="Calculated financial metrics">
              {[
                ['Net Income', netIncome >= 0 ? `₹ ${money(netIncome)}` : `-₹ ${money(Math.abs(netIncome))}`], ['FOIR', foir], ['DTI', dti], ['LTV', ltv], ['DSCR', dscr], ['NDIR', ndir], ['CIBIL Score', form.cibilScore]
              ].map(([label, value]) => <label className="le-metric" key={label}>{label}<input aria-label={label} value={value} readOnly={label !== 'CIBIL Score'} onChange={label === 'CIBIL Score' ? (event) => update('cibilScore', event.target.value) : undefined} /></label>)}
            </div>
            <label className={`le-decision${decision.includes('Pending') ? ' pending' : ''}`} htmlFor="le-decision">Loan Eligibility<input id="le-decision" value={decision} readOnly placeholder="Submit for assessment" /></label>
            <div className="le-actions">
              <button className="le-btn" type="button" onClick={reset}>Cancel</button>
              <button className="le-btn le-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle className="le-spin" size={15} /> : <Check size={15} />}{saving ? 'Assessing...' : 'Submit'}</button>
            </div>
          </form>
        </section>
      </main>
    </AppShell>
  );
}