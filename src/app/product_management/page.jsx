'use client';

import { useState } from 'react';
import { Check, LoaderCircle, Package, RotateCcw, Save } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { saveProductManagementProduct } from '../../services/productManagement';

const initialForm = {
  productCode: '', productName: '', emi: '', emiType: '', minTenure: '', maxTenure: '',
  minAmount: '', maxAmount: '', penalty: '', penaltyPercent: '', interestFrequency: '', calculationMode: ''
};

const fieldList = [
  ['productCode', 'Product Code'], ['productName', 'Product Name'], ['emi', 'E.M.I.'], ['emiType', 'E.M.I. Type'],
  ['minTenure', 'Min. Tenure'], ['maxTenure', 'Max. Tenure'], ['minAmount', 'Min. Amount'], ['maxAmount', 'Max. Amount'],
  ['penalty', 'Penalty'], ['penaltyPercent', 'Penalty %'], ['interestFrequency', 'Interest Calculation Frequency'], ['calculationMode', 'Interest Calculation Mode']
];

function validate(form) {
  const errors = {};
  const required = ['productCode', 'productName', 'emi', 'emiType', 'minTenure', 'maxTenure', 'minAmount', 'maxAmount', 'penalty', 'penaltyPercent', 'interestFrequency', 'calculationMode'];
  required.forEach((field) => { if (!String(form[field]).trim()) errors[field] = 'This field is required.'; });
  if (form.productCode && !/^[A-Z0-9][A-Z0-9_-]{1,19}$/i.test(form.productCode.trim())) errors.productCode = 'Use 2–20 letters, numbers, hyphens, or underscores.';
  if (form.productName && (form.productName.trim().length < 2 || form.productName.trim().length > 100)) errors.productName = 'Enter a product name between 2 and 100 characters.';
  for (const field of ['emi', 'minAmount', 'maxAmount', 'penalty']) {
    if (form[field] && (!/^\d+(\.\d{1,2})?$/.test(form[field]) || Number(form[field]) < 0)) errors[field] = 'Enter a valid non-negative amount with up to 2 decimal places.';
  }
  for (const field of ['minTenure', 'maxTenure']) {
    if (form[field] && (!/^\d+$/.test(form[field]) || Number(form[field]) < 1 || Number(form[field]) > 480)) errors[field] = 'Enter a whole number of months from 1 to 480.';
  }
  if (form.minTenure && form.maxTenure && Number(form.minTenure) > Number(form.maxTenure)) errors.maxTenure = 'Maximum tenure must be at least the minimum tenure.';
  if (form.minAmount && form.maxAmount && Number(form.minAmount) >= Number(form.maxAmount)) errors.maxAmount = 'Maximum amount must be greater than minimum amount.';
  if (form.penaltyPercent && (!/^\d+(\.\d{1,2})?$/.test(form.penaltyPercent) || Number(form.penaltyPercent) > 100)) errors.penaltyPercent = 'Enter a percentage between 0 and 100.';
  return errors;
}

const styles = `
.pm-wrap{max-width:1320px;margin:0 auto;color:#263b3d}.pm-card{overflow:hidden;border:1px solid #dce6e3;border-radius:8px;background:#fff;box-shadow:0 6px 22px #193a6210}.pm-title{margin:0;padding:16px 22px;border-bottom:1px solid #e5ecea;background:#f8fbfa;color:#1c4847;text-align:center;font:700 19px Georgia,serif;text-decoration:underline}.pm-form{padding:24px 7% 22px}.pm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 24px;align-items:start}.pm-field{display:grid;gap:7px;min-width:0;color:#30494b;font-size:12px;font-weight:700}.pm-field>span{line-height:1.35}.pm-field input,.pm-field select{width:100%;height:40px;padding:0 10px;border:1px solid #b8caca;border-radius:4px;background:#fbfdfc;color:#243c3e;font:400 13px Arial,sans-serif;outline:none}.pm-field input:focus,.pm-field select:focus{border-color:#177e7a;box-shadow:0 0 0 3px #177e7a19}.pm-field [aria-invalid=true]{border-color:#b83b3b;background:#fffafa}.pm-field-error{color:#b33737;font-size:10px;font-weight:500;line-height:1.4}.pm-wide{grid-column:span 2}.pm-name{grid-column:span 2}.pm-actions{display:flex;justify-content:center;gap:12px;margin-top:34px;padding-top:18px;border-top:1px solid #e7eeec}.pm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:39px;padding:0 16px;border:1px solid #d0ddda;border-radius:5px;background:#fff;color:#41585a;font-size:12px;font-weight:700}.pm-btn:hover{background:#f4f8f7}.pm-submit{border-color:#177e7a;background:#177e7a;color:white}.pm-submit:hover{background:#0c6662}.pm-submit:disabled{opacity:.7;cursor:wait}.pm-status{display:flex;align-items:flex-start;gap:8px;margin:0 0 15px;padding:12px 14px;border:1px solid #c0dfd1;border-radius:6px;background:#f0faf5;color:#286c50;font-size:12px;line-height:1.5}.pm-alert{border-color:#e8cbcb;background:#fff7f7;color:#a43838}.pm-spin{animation:pm-rotate .9s linear infinite}@keyframes pm-rotate{to{transform:rotate(360deg)}}
@media(max-width:900px){.pm-form{padding:22px}.pm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pm-name{grid-column:span 2}}
@media(max-width:520px){.pm-form{padding:18px 15px}.pm-grid{grid-template-columns:1fr;gap:14px}.pm-name,.pm-wide{grid-column:auto}.pm-title{font-size:17px}.pm-actions{display:grid;grid-template-columns:1fr 1fr}.pm-btn{padding:0 10px}}
`;

export default function ProductManagementPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: field === 'productCode' ? value.toUpperCase() : value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setStatus(null);
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    const invalid = Object.keys(nextErrors)[0];
    if (invalid) {
      document.getElementById(`pm-${invalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const result = await saveProductManagementProduct({
        product_code: form.productCode.trim(), product_name: form.productName.trim(), emi: Number(form.emi), emi_type: form.emiType,
        min_tenure_months: Number(form.minTenure), max_tenure_months: Number(form.maxTenure), min_amount: Number(form.minAmount),
        max_amount: Number(form.maxAmount), penalty: Number(form.penalty), penalty_percent: Number(form.penaltyPercent),
        interest_calculation_frequency: form.interestFrequency, interest_calculation_mode: form.calculationMode
      });
      setStatus({ type: result.configured ? 'success' : 'info', text: result.configured ? result.result?.message || 'Product saved successfully.' : 'All fields are valid. The Java product API endpoint is not configured yet.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Unable to save product.' });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm(initialForm);
    setErrors({});
    setStatus(null);
  }

  return (
    <AppShell title="Product Management">
      <style>{styles}</style>
      <main className="pm-wrap">
        <PageHeader eyebrow="PRODUCTS" title="Product Management" description="Configure loan product terms, charges, and repayment calculations." />
        {status && <div className={`pm-status${status.type === 'error' ? ' pm-alert' : ''}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.type === 'success' ? <Check size={16} /> : null}{status.text}</div>}
        <section className="pm-card" aria-labelledby="pm-heading">
          <h2 className="pm-title" id="pm-heading">Product Management</h2>
          <form className="pm-form" onSubmit={submit} noValidate>
            <div className="pm-grid">
              {fieldList.map(([field, label]) => {
                const choices = field === 'emiType'
                  ? [['Fixed', 'Fixed'], ['Floating', 'Floating']]
                  : field === 'interestFrequency'
                    ? [['Monthly', 'Monthly'], ['Quarterly', 'Quarterly'], ['Half-yearly', 'Half-yearly'], ['Yearly', 'Yearly']]
                    : field === 'calculationMode'
                      ? [['Reducing balance', 'Reducing balance'], ['Flat rate', 'Flat rate']]
                      : null;
                const numeric = ['emi', 'minTenure', 'maxTenure', 'minAmount', 'maxAmount', 'penalty', 'penaltyPercent'].includes(field);
                const wide = ['productName', 'interestFrequency', 'calculationMode'].includes(field);
                return (
                  <label className={`pm-field${wide ? ' pm-wide' : ''}${field === 'productName' ? ' pm-name' : ''}`} key={field} htmlFor={`pm-${field}`}>
                    <span>{label} <em aria-hidden="true">*</em></span>
                    {choices ? (
                      <select id={`pm-${field}`} value={form[field]} onChange={(event) => change(field, event.target.value)} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `pm-${field}-error` : undefined}>
                        <option value="">Select {label.toLowerCase()}</option>
                        {choices.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                      </select>
                    ) : (
                      <input id={`pm-${field}`} name={field} value={form[field]} onChange={(event) => change(field, event.target.value)} type={numeric ? 'number' : 'text'} min={numeric ? '0' : undefined} step={['minTenure', 'maxTenure'].includes(field) ? '1' : '0.01'} max={field === 'penaltyPercent' ? '100' : undefined} maxLength={!numeric ? (field === 'productCode' ? 20 : 100) : undefined} inputMode={numeric ? 'decimal' : undefined} autoComplete="off" aria-required="true" aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `pm-${field}-error` : undefined} />
                    )}
                    {errors[field] && <small className="pm-field-error" id={`pm-${field}-error`}>{errors[field]}</small>}
                  </label>
                );
              })}
            </div>
            <div className="pm-actions">
              <button className="pm-btn" type="button" onClick={reset}><RotateCcw size={15} /> Cancel</button>
              <button className="pm-btn pm-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle className="pm-spin" size={15} /> : <Save size={15} />}{saving ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </section>
      </main>
    </AppShell>
  );
}