'use client';

import { useState } from 'react';
import { CirclePlus, LoaderCircle, Save, Trash2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { saveInterestRateMaster } from '../../services/interestRateMaster';

const emptyBand = (id) => ({ id, upToMonths: '', normalInterest: '', penalRate: '', adhocRate: '' });
const initialForm = () => ({ productCode: '', productName: '', effectiveDate: '', bands: [1, 2, 3, 4, 5].map(emptyBand) });

function validate(form) {
  const errors = {};
  if (!/^[A-Z0-9][A-Z0-9_-]{1,19}$/i.test(form.productCode.trim())) errors.productCode = 'Use 2–20 letters, numbers, hyphens, or underscores.';
  if (form.productName.trim().length < 2 || form.productName.trim().length > 100) errors.productName = 'Enter a product name between 2 and 100 characters.';
  if (!form.effectiveDate) errors.effectiveDate = 'Select an effective date.';
  else if (form.effectiveDate < new Date().toISOString().slice(0, 10)) errors.effectiveDate = 'Effective date cannot be in the past.';

  const completedBands = [];
  form.bands.forEach((band) => {
    const populated = Object.values(band).some((value, index) => index > 0 && String(value).trim());
    if (!populated) return;
    if (!/^\d+$/.test(band.upToMonths) || Number(band.upToMonths) < 1 || Number(band.upToMonths) > 480) {
      errors[`band-${band.id}-upToMonths`] = 'Enter a whole number of months from 1 to 480.';
    }
    for (const [field, label, required] of [['normalInterest', 'Normal interest', true], ['penalRate', 'Penal rate', false], ['adhocRate', 'Adhoc rate', false]]) {
      if (required && !band[field].trim()) errors[`band-${band.id}-${field}`] = `${label} is required for each rate tier.`;
      if (band[field] && (!/^\d+(\.\d{1,2})?$/.test(band[field]) || Number(band[field]) > 100)) {
        errors[`band-${band.id}-${field}`] = `${label} must be between 0 and 100%.`;
      }
    }
    if (/^\d+$/.test(band.upToMonths)) completedBands.push({ id: band.id, months: Number(band.upToMonths) });
  });
  if (completedBands.length === 0) errors.bands = 'Add at least one rate tier with an upper tenure and normal interest rate.';
  for (let index = 1; index < completedBands.length; index += 1) {
    if (completedBands[index].months <= completedBands[index - 1].months) {
      errors[`band-${completedBands[index].id}-upToMonths`] = 'Each tenure tier must increase beyond the previous upper limit.';
    }
  }
  return errors;
}

const styles = `
.ir-wrap{max-width:1340px;margin:0 auto;color:#263b3d}.ir-card{overflow:hidden;border:1px solid #dce6e3;border-radius:8px;background:#fff;box-shadow:0 6px 22px #193a6210}.ir-title{margin:0;padding:15px 20px;border-bottom:1px solid #e5ecea;background:#f8fbfa;color:#1c4847;text-align:center;font:700 18px Georgia,serif;text-decoration:underline}.ir-form{padding:22px 5% 24px}.ir-top-fields{display:grid;grid-template-columns:minmax(180px,.65fr) minmax(300px,1.5fr) minmax(180px,.7fr);gap:18px 26px;align-items:start;margin:0 auto 22px;max-width:1100px}.ir-field{display:grid;gap:7px;min-width:0;color:#344d4f;font-size:12px;font-weight:700}.ir-field input{width:100%;height:40px;padding:0 10px;border:1px solid #b9cbca;border-radius:4px;background:#fbfdfc;color:#263d3f;font:400 13px Arial,sans-serif;outline:none}.ir-field input:focus,.ir-cell input:focus{border-color:#177e7a;box-shadow:0 0 0 3px #177e7a19}.ir-field input[aria-invalid=true],.ir-cell input[aria-invalid=true]{border-color:#b83b3b;background:#fffafa}.ir-error{color:#b33737;font-size:10px;font-weight:500;line-height:1.4}.ir-table-wrap{overflow-x:auto;border:1px solid #c1cdcb;border-radius:3px}.ir-table{width:100%;min-width:700px;border-collapse:collapse;table-layout:fixed}.ir-table th,.ir-table td{height:49px;padding:7px 10px;border-right:1px solid #cbd4d3;border-bottom:1px solid #cbd4d3;text-align:center;color:#30474a;font-size:11px}.ir-table th{height:38px;background:#f1f5f4;font-weight:700}.ir-table tbody tr:last-child td{border-bottom:0}.ir-table th:last-child,.ir-table td:last-child{width:45px;border-right:0}.ir-table th:first-child,.ir-table td:first-child{width:65px}.ir-cell input{width:100%;height:34px;padding:0 8px;border:1px solid #c6d3d1;border-radius:3px;background:#fff;color:#2d4648;font-size:12px;text-align:center;outline:none}.ir-cell .ir-error{display:block;margin-top:4px}.ir-tools{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px}.ir-add{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 10px;border:1px solid #ccddda;border-radius:4px;background:#f8fbfa;color:#176e67;font-size:11px;font-weight:700}.ir-add:hover{background:#eff7f5}.ir-remove{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:4px;color:#865959}.ir-remove:hover{background:#fbefef;color:#a02e2e}.ir-actions{display:flex;justify-content:center;gap:12px;margin-top:28px;padding-top:17px;border-top:1px solid #e7eeec}.ir-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:39px;padding:0 16px;border:1px solid #d0ddda;border-radius:5px;background:#fff;color:#41585a;font-size:12px;font-weight:700}.ir-btn:hover{background:#f4f8f7}.ir-submit{border-color:#177e7a;background:#177e7a;color:white}.ir-submit:hover{background:#0c6662}.ir-btn:disabled{opacity:.7;cursor:wait}.ir-message{margin:0 0 14px;padding:11px 13px;border:1px solid #c4dfd1;border-radius:5px;background:#f1faf5;color:#276b4f;font-size:12px;line-height:1.5}.ir-message.error{border-color:#e7cccc;background:#fff7f7;color:#a43838}.ir-spin{animation:ir-spin 1s linear infinite}@keyframes ir-spin{to{transform:rotate(360deg)}}
@media(max-width:850px){.ir-top-fields{grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.ir-field:nth-child(2){grid-column:1/-1;grid-row:2}}
@media(max-width:520px){.ir-form{padding:17px 14px}.ir-top-fields{grid-template-columns:1fr;gap:14px}.ir-field:nth-child(2){grid-column:auto;grid-row:auto}.ir-actions{display:grid;grid-template-columns:1fr 1fr}.ir-btn{padding:0 10px}.ir-title{font-size:16px}}
`;

export default function InterestRateMasterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  function updateHeader(field, value) {
    setForm((current) => ({ ...current, [field]: field === 'productCode' ? value.toUpperCase() : value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setMessage(null);
  }

  function updateBand(id, field, value) {
    setForm((current) => ({ ...current, bands: current.bands.map((band) => band.id === id ? { ...band, [field]: value } : band) }));
    setErrors((current) => ({ ...current, [`band-${id}-${field}`]: '', bands: '' }));
    setMessage(null);
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    const invalid = Object.keys(nextErrors)[0];
    if (invalid) {
      document.getElementById(`ir-${invalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        product_code: form.productCode.trim(), product_name: form.productName.trim(), effective_date: form.effectiveDate,
        tiers: form.bands.filter((band) => band.upToMonths !== '' && band.normalInterest !== '').map((band) => ({
          up_to_months: Number(band.upToMonths), normal_interest_rate: Number(band.normalInterest),
          penal_rate: band.penalRate === '' ? null : Number(band.penalRate), adhoc_rate: band.adhocRate === '' ? null : Number(band.adhocRate)
        })).sort((left, right) => left.up_to_months - right.up_to_months)
      };
      const result = await saveInterestRateMaster(payload);
      setMessage({ type: result.configured ? 'success' : 'info', text: result.configured ? result.result?.message || 'Interest rate tiers saved successfully.' : 'All fields are valid. The Java interest-rate API endpoint is not configured yet.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to save interest rates.' });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm(initialForm());
    setErrors({});
    setMessage(null);
  }

  function addBand() {
    const id = Math.max(0, ...form.bands.map((band) => band.id)) + 1;
    setForm((current) => ({ ...current, bands: [...current.bands, emptyBand(id)] }));
  }

  function removeBand(id) {
    setForm((current) => ({ ...current, bands: current.bands.filter((band) => band.id !== id) }));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`band-${id}-`))));
    setMessage(null);
  }

  return (
    <AppShell title="Interest Rate Master">
      <style>{styles}</style>
      <main className="ir-wrap">
        <PageHeader eyebrow="PRICING" title="Interest Rate Master" description="Set effective-dated interest tiers by loan product and tenure." />
        {message && <div className={`ir-message${message.type === 'error' ? ' error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
        <section className="ir-card" aria-labelledby="ir-title">
          <h2 className="ir-title" id="ir-title">Interest Rate Master</h2>
          <form className="ir-form" onSubmit={submit} noValidate>
            <div className="ir-top-fields">
              {[
                ['productCode', 'Product Code', 'text'], ['productName', 'Product Name', 'text'], ['effectiveDate', 'Effective Date', 'date']
              ].map(([field, label, type]) => (
                <label className="ir-field" key={field} htmlFor={`ir-${field}`}>
                  {label} *
                  <input id={`ir-${field}`} value={form[field]} onChange={(event) => updateHeader(field, event.target.value)} type={type} maxLength={field === 'productCode' ? 20 : field === 'productName' ? 100 : undefined} min={field === 'effectiveDate' ? new Date().toISOString().slice(0, 10) : undefined} autoComplete="off" aria-required="true" aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `ir-${field}-error` : undefined} />
                  {errors[field] && <small className="ir-error" id={`ir-${field}-error`}>{errors[field]}</small>}
                </label>
              ))}
            </div>

            <div className="ir-table-wrap">
              <table className="ir-table">
                <thead><tr><th>Sr.</th><th>Up to Months</th><th>Normal Int. %</th><th>Penal Rate %</th><th>Adhoc Rate %</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {form.bands.map((band, index) => (
                    <tr key={band.id}>
                      <td>{index + 1}</td>
                      {[
                        ['upToMonths', 'Tenure upper limit in months'], ['normalInterest', 'Normal interest rate'], ['penalRate', 'Penal rate'], ['adhocRate', 'Adhoc rate']
                      ].map(([field, label]) => {
                        const errorKey = `band-${band.id}-${field}`;
                        return (
                          <td className="ir-cell" key={field}>
                            <input id={`ir-${errorKey}`} aria-label={`${label}, tier ${index + 1}`} type="number" min="0" max={field === 'upToMonths' ? '480' : '100'} step={field === 'upToMonths' ? '1' : '0.01'} inputMode={field === 'upToMonths' ? 'numeric' : 'decimal'} value={band[field]} onChange={(event) => updateBand(band.id, field, event.target.value)} aria-invalid={Boolean(errors[errorKey])} aria-describedby={errors[errorKey] ? `ir-${errorKey}-error` : undefined} />
                            {errors[errorKey] && <small className="ir-error" id={`ir-${errorKey}-error`}>{errors[errorKey]}</small>}
                          </td>
                        );
                      })}
                      <td><button className="ir-remove" type="button" onClick={() => removeBand(band.id)} aria-label={`Remove rate tier ${index + 1}`} title="Remove tier"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.bands && <p className="ir-error" role="alert">{errors.bands}</p>}
            <div className="ir-tools"><button className="ir-add" type="button" onClick={addBand}><CirclePlus size={15} /> Add rate tier</button><span className="ir-error">Enter non-overlapping upper-tenure limits in ascending order.</span></div>
            <div className="ir-actions">
              <button className="ir-btn" type="button" onClick={reset}>Cancel</button>
              <button className="ir-btn ir-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle className="ir-spin" size={15} /> : <Save size={15} />}{saving ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </section>
      </main>
    </AppShell>
  );
}