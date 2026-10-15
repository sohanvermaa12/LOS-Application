'use client';

import { useEffect, useState } from 'react';
import { CirclePlus, Eye, LoaderCircle, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { saveInterestRateMaster } from '../../services/interestRateMaster';

const emptyBand = (id) => ({ id, upToMonths: '', normalInterest: '', penalRate: '', adhocRate: '' });
const initialForm = () => ({ productCode: '', productName: '', effectiveDate: '', bands: [1, 2, 3, 4, 5].map(emptyBand) });
const STORAGE_KEY = 'los_interest_rate_master_records';

function readMasters() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistMasters(masters) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(masters));
  } catch {
    return false;
  }
  return true;
}

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
.irm-wrap{max-width:1340px;margin:0 auto;color:#263b3d}.irm-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}.irm-create{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 15px;border:1px solid #177e7a;border-radius:5px;background:#177e7a;color:#fff;font-size:12px;font-weight:700}.irm-create:hover{background:#0c6662}.irm-message{display:flex;align-items:flex-start;gap:8px;margin:0 0 14px;padding:11px 13px;border:1px solid #c4dfd1;border-radius:5px;background:#f1faf5;color:#276b4f;font-size:12px;line-height:1.5}.irm-message.error{border-color:#e7cccc;background:#fff7f7;color:#a43838}.irm-message.info{border-color:#d7e4e5;background:#f5f9f9;color:#47666a}.irm-directory{overflow:hidden;border:1px solid #dce6e3;border-radius:7px;background:#fff;box-shadow:0 5px 18px #193a620c}.irm-directory-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #e5ecea}.irm-directory-head h2{margin:0;color:#1d4143;font-size:17px}.irm-count{color:#758789;font-size:12px}.irm-list-wrap{max-width:100%;overflow:auto}.irm-list{width:100%;min-width:740px;border-collapse:collapse}.irm-list th,.irm-list td{height:54px;padding:10px 15px;border-bottom:1px solid #edf1f0;text-align:left;color:#354d4f;font-size:12px}.irm-list th{height:42px;background:#f6f9f8;color:#607577;font-size:10px;font-weight:800;text-transform:uppercase}.irm-list tbody tr:hover{background:#fbfdfc}.irm-list tbody tr:last-child td{border-bottom:0}.irm-code{color:#176e67!important;font-weight:750}.irm-actions{display:flex;justify-content:flex-end;gap:5px}.irm-icon{display:grid;place-items:center;width:33px;height:33px;border:1px solid transparent;border-radius:4px;color:#4c686a}.irm-icon:hover{border-color:#cfdfdc;background:#f2f8f6;color:#176e67}.irm-icon.danger:hover{border-color:#efd0d0;background:#fff5f5;color:#b33737}.irm-empty{padding:48px 18px!important;text-align:center!important;color:#718284!important}.irm-empty strong,.irm-empty span{display:block}.irm-empty strong{color:#355356;font-size:13px}.irm-empty span{margin-top:5px;font-size:11px}.irm-overlay{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:#102d35a6}.irm-dialog{display:flex;flex-direction:column;width:min(980px,100%);max-height:92vh;overflow:hidden;border:1px solid #dce6e3;border-radius:8px;background:#fff;box-shadow:0 24px 70px #0d262d40}.irm-dialog.narrow{width:min(520px,100%)}.irm-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 22px;border-bottom:1px solid #e5ecea;background:#f8fbfa}.irm-dialog-head h2{margin:0;color:#1c4847;font-size:18px}.irm-dialog-head p{margin:4px 0 0;color:#718486;font-size:12px}.irm-close{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border:1px solid #dce6e3;border-radius:5px;color:#526a6c}.irm-close:hover{background:#eef5f3}.irm-form{overflow:auto;padding:22px}.irm-form .ir-top-fields{max-width:none;grid-template-columns:minmax(180px,.65fr) minmax(260px,1.5fr) minmax(180px,.7fr)}.irm-form .ir-table{min-width:700px}.irm-form .ir-table-wrap{max-width:100%}.irm-form .ir-actions{justify-content:flex-end;margin-top:22px}.irm-dialog-footer{display:flex;justify-content:flex-end;gap:10px;padding:13px 20px;border-top:1px solid #e7eeec}.irm-tier-view{padding:18px 22px;overflow:auto}.irm-tier-view h3{margin:0 0 12px;color:#355356;font-size:14px}.irm-tier-table{width:100%;min-width:540px;border-collapse:collapse}.irm-tier-table th,.irm-tier-table td{padding:11px 12px;border-bottom:1px solid #e8efed;text-align:left;color:#354d4f;font-size:12px}.irm-tier-table th{background:#f6f9f8;color:#607577;font-size:10px;text-transform:uppercase}.irm-tier-table td:first-child{font-weight:700}.irm-submit:disabled{cursor:wait}@media(max-width:700px){.irm-heading{align-items:stretch;flex-direction:column}.irm-create{width:100%}.irm-form .ir-top-fields{grid-template-columns:1fr}.irm-form .ir-field:nth-child(2){grid-column:auto;grid-row:auto}.irm-dialog{max-height:96vh}.irm-dialog-head{padding:15px 16px}.irm-form{padding:16px}.irm-dialog-footer{padding:12px 16px}.irm-dialog-footer .ir-btn{flex:1}.irm-directory-head{padding:14px}.irm-tier-view{padding:14px 16px}}
`;

export default function InterestRateMasterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [masters, setMasters] = useState([]);
  const [dialog, setDialog] = useState(null);

  useEffect(() => setMasters(readMasters()), []);

  function storeMasters(nextMasters) {
    setMasters(nextMasters);
    if (!persistMasters(nextMasters)) setMessage({ type: 'info', text: 'Changes are available for this session but could not be saved to browser storage.' });
  }

  function openCreate() {
    setForm(initialForm());
    setErrors({});
    setMessage(null);
    setDialog({ type: 'form' });
  }

  function openEdit(master) {
    setForm({
      productCode: master.productCode,
      productName: master.productName,
      effectiveDate: master.effectiveDate,
      bands: master.bands.map((band, index) => ({ ...band, id: index + 1 }))
    });
    setErrors({});
    setMessage(null);
    setDialog({ type: 'form', master });
  }

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

    const editingMaster = dialog?.master;
    if (masters.some((master) => master.id !== editingMaster?.id && master.productCode.toLowerCase() === form.productCode.trim().toLowerCase())) {
      setErrors((current) => ({ ...current, productCode: 'An interest rate master with this product code already exists.' }));
      document.getElementById('ir-productCode')?.focus();
      return;
    }

    const master = {
      id: editingMaster?.id || (globalThis.crypto?.randomUUID?.() ?? `rate-master-${Date.now()}`),
      productCode: form.productCode.trim().toUpperCase(),
      productName: form.productName.trim(),
      effectiveDate: form.effectiveDate,
      bands: form.bands.filter((band) => band.upToMonths !== '' && band.normalInterest !== '').map((band, index) => ({ ...band, id: index + 1 })),
      updatedAt: new Date().toISOString()
    };

    if (editingMaster) {
      storeMasters(masters.map((item) => item.id === editingMaster.id ? master : item));
      setDialog(null);
      setMessage({ type: 'success', text: 'Interest rate master updated.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_code: master.productCode, product_name: master.productName, effective_date: master.effectiveDate,
        tiers: master.bands.map((band) => ({
          up_to_months: Number(band.upToMonths), normal_interest_rate: Number(band.normalInterest),
          penal_rate: band.penalRate === '' ? null : Number(band.penalRate), adhoc_rate: band.adhocRate === '' ? null : Number(band.adhocRate)
        })).sort((left, right) => left.up_to_months - right.up_to_months)
      };
      const result = await saveInterestRateMaster(payload);
      storeMasters([master, ...masters]);
      setDialog(null);
      setMessage({ type: result.configured ? 'success' : 'info', text: result.configured ? result.result?.message || 'Interest rate master saved successfully.' : 'Interest rate master saved in this browser. The API endpoint is not configured.' });
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
    setDialog(null);
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

  function deleteMaster(master) {
    storeMasters(masters.filter((item) => item.id !== master.id));
    setDialog(null);
    setMessage({ type: 'success', text: `${master.productName} interest rate master deleted.` });
  }

  return (
    <AppShell title="Interest Rate Master">
      <style>{styles}</style>
      <main className="irm-wrap">
        <div className="irm-heading">
          <PageHeader eyebrow="PRICING" title="Interest Rate Master" description="Set effective-dated interest tiers by loan product and tenure." />
          <button className="irm-create" type="button" onClick={openCreate}><Plus size={16} /> Create interest rate master</button>
        </div>
        {message && !dialog && <div className={`irm-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
        <section className="irm-directory" aria-labelledby="irm-directory-title">
          <div className="irm-directory-head"><h2 id="irm-directory-title">Interest rate masters</h2><span className="irm-count">{masters.length} {masters.length === 1 ? 'master' : 'masters'}</span></div>
          <div className="irm-list-wrap">
            <table className="irm-list">
              <thead><tr><th scope="col">Product code</th><th scope="col">Product name</th><th scope="col">Effective date</th><th scope="col">Rate tiers</th><th scope="col">Actions</th></tr></thead>
              <tbody>
                {masters.map((master) => (
                  <tr key={master.id}>
                    <td className="irm-code">{master.productCode}</td>
                    <td>{master.productName}</td>
                    <td>{master.effectiveDate}</td>
                    <td>{master.bands.length}</td>
                    <td><div className="irm-actions">
                      <button className="irm-icon" type="button" onClick={() => setDialog({ type: 'view', master })} aria-label={`View ${master.productName}`} title="View"><Eye size={16} /></button>
                      <button className="irm-icon" type="button" onClick={() => openEdit(master)} aria-label={`Edit ${master.productName}`} title="Edit"><Pencil size={15} /></button>
                      <button className="irm-icon danger" type="button" onClick={() => setDialog({ type: 'delete', master })} aria-label={`Delete ${master.productName}`} title="Delete"><Trash2 size={15} /></button>
                    </div></td>
                  </tr>
                ))}
                {masters.length === 0 && <tr><td className="irm-empty" colSpan="5"><strong>No interest rate masters yet</strong><span>Create a master to manage product rates and tenure tiers.</span></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {dialog?.type === 'form' && (
        <div className="irm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) reset(); }}>
          <section className="irm-dialog" role="dialog" aria-modal="true" aria-labelledby="irm-form-title">
            <header className="irm-dialog-head"><div><h2 id="irm-form-title">{dialog.master ? 'Edit interest rate master' : 'Create interest rate master'}</h2><p>Set product details, effective date, and rate tiers.</p></div><button className="irm-close" type="button" onClick={reset} disabled={saving} aria-label="Close form"><X size={18} /></button></header>
            {message?.type === 'error' && <div className="irm-message error" role="alert">{message.text}</div>}
            <form className="ir-form irm-form" onSubmit={submit} noValidate>
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
              <div className="ir-actions"><button className="ir-btn" type="button" onClick={reset} disabled={saving}>Cancel</button><button className="ir-btn ir-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle className="ir-spin" size={15} /> : <Save size={15} />}{saving ? 'Saving...' : dialog.master ? 'Save changes' : 'Create master'}</button></div>
            </form>
          </section>
        </div>
      )}

      {dialog?.type === 'view' && (
        <div className="irm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>
          <section className="irm-dialog" role="dialog" aria-modal="true" aria-labelledby="irm-view-title">
            <header className="irm-dialog-head"><div><h2 id="irm-view-title">{dialog.master.productName}</h2><p>{dialog.master.productCode} · Effective {dialog.master.effectiveDate}</p></div><button className="irm-close" type="button" onClick={() => setDialog(null)} aria-label="Close details"><X size={18} /></button></header>
            <div className="irm-tier-view"><h3>Rate tiers</h3><table className="irm-tier-table"><thead><tr><th>Up to months</th><th>Normal interest</th><th>Penal rate</th><th>Adhoc rate</th></tr></thead><tbody>{dialog.master.bands.map((band, index) => <tr key={band.id}><td>{band.upToMonths}</td><td>{band.normalInterest}%</td><td>{band.penalRate ? `${band.penalRate}%` : '—'}</td><td>{band.adhocRate ? `${band.adhocRate}%` : '—'}</td></tr>)}</tbody></table></div>
            <footer className="irm-dialog-footer"><button className="ir-btn" type="button" onClick={() => setDialog(null)}>Close</button></footer>
          </section>
        </div>
      )}

      {dialog?.type === 'delete' && (
        <div className="irm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}>
          <section className="irm-dialog narrow" role="alertdialog" aria-modal="true" aria-labelledby="irm-delete-title" aria-describedby="irm-delete-copy">
            <header className="irm-dialog-head"><div><h2 id="irm-delete-title">Delete interest rate master?</h2><p id="irm-delete-copy">This will remove {dialog.master.productName} ({dialog.master.productCode}) and all of its rate tiers.</p></div><button className="irm-close" type="button" onClick={() => setDialog(null)} aria-label="Cancel deletion"><X size={18} /></button></header>
            <footer className="irm-dialog-footer"><button className="ir-btn" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="ir-btn ir-submit" type="button" onClick={() => deleteMaster(dialog.master)}><Trash2 size={15} /> Delete master</button></footer>
          </section>
        </div>
      )}
    </AppShell>
  );
}