'use client';

import { useState } from 'react';
import { AlertTriangle, Check, CirclePlus, ClipboardCheck, LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { assessLoanEligibility } from '../../services/loanEligibility';

const makeRow = (id, type, source, amount = '') => ({ id, type, source, amount });
const initialForm = () => ({
  customerNumber: '', initials: '', name: '', loanType: 'Personal loan', requestedAmount: '', collateralValue: '',
  annualInterestRate: '12', tenureMonths: '60', monthlyDebtService: '0', cibilScore: '',
  rows: [makeRow(1, 'Income', 'Salary'), makeRow(2, 'Expense', 'Others', '0')]
});

function money(value) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function calculateEmi(principal, annualRate, tenureMonths) {
  if (!(principal > 0) || !(tenureMonths > 0)) return 0;
  const monthlyRate = annualRate / 1200;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = (1 + monthlyRate) ** tenureMonths;
  return principal * monthlyRate * factor / (factor - 1);
}

function calculatePrincipal(emi, annualRate, tenureMonths) {
  if (!(emi > 0) || !(tenureMonths > 0)) return 0;
  const monthlyRate = annualRate / 1200;
  if (monthlyRate === 0) return emi * tenureMonths;
  return emi * (1 - (1 + monthlyRate) ** -tenureMonths) / monthlyRate;
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
  for (const field of ['requestedAmount', 'monthlyDebtService', 'annualInterestRate', 'tenureMonths']) {
    if (!form[field] || !/^\d+(\.\d{1,2})?$/.test(form[field]) || Number(form[field]) < 0) errors[field] = 'Enter a valid non-negative amount.';
  }
  if (Number(form.requestedAmount) <= 0) errors.requestedAmount = 'Enter a loan amount greater than zero.';
  if (Number(form.annualInterestRate) <= 0 || Number(form.annualInterestRate) > 60) errors.annualInterestRate = 'Enter an annual rate above 0% and no more than 60%.';
  if (!/^\d+$/.test(form.tenureMonths) || Number(form.tenureMonths) < 6 || Number(form.tenureMonths) > 480) errors.tenureMonths = 'Choose a term between 6 and 480 months.';
  if (form.loanType === 'Home loan' && (!form.collateralValue || Number(form.collateralValue) <= 0)) errors.collateralValue = 'Property value is required for a home-loan LTV check.';
  if (form.collateralValue && (!/^\d+(\.\d{1,2})?$/.test(form.collateralValue) || Number(form.collateralValue) <= 0)) errors.collateralValue = 'Enter a valid amount greater than zero.';
  if (!/^\d{3}$/.test(form.cibilScore) || Number(form.cibilScore) < 300 || Number(form.cibilScore) > 900) errors.cibilScore = 'CIBIL score must be between 300 and 900.';
  return errors;
}

const styles = `
.le-wrap{max-width:1440px;margin:0 auto;color:#243b3d}.le-card{overflow:hidden;border:1px solid #dbe5e2;border-radius:8px;background:#fff;box-shadow:0 6px 22px #193a6210}.le-heading{margin:0;padding:14px 20px;border-bottom:1px solid #e4ece9;color:#1d4947;text-align:center;font:700 18px Georgia,serif;text-decoration:underline}.le-form{padding:18px 3.5% 22px}.le-customer{display:grid;grid-template-columns:minmax(210px,.75fr) minmax(300px,1.2fr);gap:18px 30px;margin-bottom:17px}.le-name-fields{display:grid;grid-template-columns:78px minmax(0,1fr);gap:9px;align-items:end}.le-field{display:grid;gap:6px;min-width:0;color:#334d4f;font-size:11px;font-weight:700}.le-field input,.le-field select{width:100%;min-width:0;height:37px;padding:0 9px;border:1px solid #b9cbca;border-radius:4px;background:#fbfdfc;color:#273e40;font:400 12px Arial,sans-serif;outline:none}.le-field input:focus,.le-field select:focus{border-color:#177e7a;box-shadow:0 0 0 3px #177e7a19}.le-field input[aria-invalid=true]{border-color:#b83b3b;background:#fffafa}.le-error{color:#b33737;font-size:10px;font-weight:500;line-height:1.4}.le-table-wrap{overflow-x:auto;border:1px solid #becbc9;border-radius:3px}.le-table{width:100%;min-width:720px;border-collapse:collapse;table-layout:fixed}.le-table th,.le-table td{height:40px;padding:6px 10px;border-right:1px solid #cbd4d3;border-bottom:1px solid #cbd4d3;text-align:center;color:#30474a;font-size:11px}.le-table th{height:36px;background:#f1f5f4;font-weight:700}.le-table tr:last-child td{border-bottom:0}.le-table th:last-child,.le-table td:last-child{border-right:0}.le-table td input,.le-table td select{width:100%;height:31px;padding:0 7px;border:1px solid #c6d3d1;border-radius:3px;background:#fff;color:#2d4648;font-size:11px}.le-row-source{text-align:left!important}.le-remove{display:inline-grid;place-items:center;width:30px;height:29px;border-radius:4px;color:#845656}.le-remove:hover{background:#fbefef;color:#a02e2e}.le-add{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:7px 10px;border:1px solid #ccddda;border-radius:4px;background:#f8fbfa;color:#176e67;font-size:11px;font-weight:700}.le-subheading{margin:21px 0 11px;color:#365357;font-size:12px;font-weight:700}.le-input-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 18px}.le-metrics{display:grid;grid-template-columns:repeat(7,minmax(92px,1fr));gap:11px;margin-top:17px}.le-metric{display:grid;gap:6px;color:#334d4f;font-size:10px;font-weight:700}.le-metric input{width:100%;height:36px;padding:0 8px;border:1px solid #9cb6c1;border-radius:3px;background:#f8fbfc;color:#24464e;font-size:12px;text-align:center}.le-metric input[readonly]{background:#f2f7f7}.le-decision{display:flex;align-items:center;justify-content:center;gap:10px;margin:15px auto 0;color:#307e51;font-size:12px;font-weight:700}.le-decision input{width:min(200px,48vw);height:35px;border:1px solid #91bd9b;border-radius:3px;background:#f7fbf7;color:#3d764b;text-align:center;font-weight:700}.le-decision.pending{color:#8b6822}.le-decision.pending input{border-color:#d8c492;background:#fffdf7;color:#80621e}.le-actions{display:flex;justify-content:center;gap:12px;margin-top:20px}.le-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 16px;border:1px solid #d1ddda;border-radius:5px;background:white;color:#435a5c;font-size:12px;font-weight:700}.le-btn:hover{background:#f4f8f7}.le-submit{border-color:#177e7a;background:#177e7a;color:white}.le-submit:hover{background:#0c6662}.le-btn:disabled{opacity:.7;cursor:wait}.le-message{margin:0 0 13px;padding:11px 13px;border:1px solid #c6dfd2;border-radius:5px;background:#f1faf5;color:#276b4f;font-size:11px;line-height:1.5}.le-message.error{border-color:#e7cccc;background:#fff7f7;color:#a43838}.le-spin{animation:le-spin 1s linear infinite}@keyframes le-spin{to{transform:rotate(360deg)}}
@media(max-width:920px){.le-customer{grid-template-columns:1fr 1.4fr}.le-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:620px){.le-form{padding:15px}.le-customer{grid-template-columns:1fr;gap:14px}.le-input-grid{grid-template-columns:1fr}.le-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.le-actions{display:grid;grid-template-columns:1fr 1fr}.le-btn{padding:0 10px}.le-name-fields{grid-template-columns:68px minmax(0,1fr)}}
`;

const assessmentStyles = `
.le-wrap{max-width:1420px;padding:0 20px 32px;color:#1f3436;font-family:Manrope,Arial,sans-serif}
.le-intro{margin:0 0 14px;padding:12px 15px;border-left:3px solid #177e7a;background:#f1f7f5;color:#52696b;font-size:12px;line-height:1.6}
.le-assessment-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(320px,.78fr);align-items:start;gap:18px}
.le-form-panel,.le-results-panel{min-width:0;border:1px solid #dbe5e2;border-radius:7px;background:#fff;box-shadow:0 5px 18px rgba(24,51,58,.035)}
.le-form-panel{overflow:hidden;padding:0}
.le-section{padding:20px 22px;border-bottom:1px solid #e7eeec}
.le-section:last-of-type{border-bottom:0}
.le-section-heading{display:flex;align-items:flex-start;gap:11px;margin-bottom:16px}
.le-section-index{display:grid;place-items:center;flex:0 0 29px;width:29px;height:29px;border:1px solid #d1e3df;border-radius:5px;background:#eef6f4;color:#176e67;font-size:11px;font-weight:800}
.le-section-heading h2{margin:0;color:#20464a;font-size:14px;font-weight:750}
.le-section-heading p{margin:4px 0 0;color:#718487;font-size:11px;line-height:1.5}
.le-form-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}
.le-form-fields .le-field{font-size:11px}
.le-form-fields .le-field input,.le-form-fields .le-field select{height:40px;border-color:#cbd8d6;border-radius:5px;background:#fff;font-family:inherit;font-size:12px}
.le-field small{font-weight:500}
.le-table-wrap{border-color:#dce6e4;border-radius:5px}
.le-table{min-width:600px}
.le-table th,.le-table td{height:43px;border-color:#e0e8e6;font-size:11px}
.le-table th{height:38px;background:#f4f8f7;color:#52696b}
.le-table td input,.le-table td select{height:34px;border-color:#ccd9d7;border-radius:4px;font-family:inherit;font-size:11px}
.le-row-source{text-align:left!important}
.le-row-source input{text-align:left}
.le-remove{width:30px;height:30px}
.le-add{margin-top:11px;padding:8px 11px;border-color:#cfdfdc;border-radius:5px;background:#f7faf9;color:#176e67;font-family:inherit;font-size:11px;cursor:pointer}
.le-add:hover{background:#eaf4f1}
.le-total-row th,.le-total-row td{height:38px;background:#fafcfb;font-weight:700}
.le-form-actions{display:flex;justify-content:flex-end;gap:9px;padding:16px 22px;background:#fafcfb}
.le-btn{min-height:39px;border-radius:5px;font-family:inherit;font-size:11px;cursor:pointer}
.le-submit{border-color:#177e7a;background:#177e7a;color:#fff}
.le-submit:hover{background:#0c6662}
.le-results-panel{position:sticky;top:16px;overflow:hidden}
.le-results-head{padding:18px 19px 15px;border-bottom:1px solid #e7eeec}
.le-results-kicker{color:#758789;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.le-results-head h2{margin:5px 0 0;color:#20464a;font-size:17px}
.le-decision-banner{display:flex;align-items:flex-start;gap:10px;margin:15px 16px 0;padding:12px;border:1px solid #d4e6dd;border-radius:5px;background:#f2faf5;color:#286c4c}
.le-decision-banner.review{border-color:#e9dfbd;background:#fffaf0;color:#83631f}
.le-decision-banner.outside{border-color:#eed1d1;background:#fff6f6;color:#9b3a3a}
.le-decision-banner svg{flex:none;margin-top:1px}
.le-decision-banner strong{display:block;font-size:12px}
.le-decision-banner span{display:block;margin-top:3px;font-size:10px;line-height:1.45}
.le-emi-block{padding:18px 17px 14px;border-bottom:1px solid #e7eeec}
.le-emi-label{color:#6d8082;font-size:10px;font-weight:700}
.le-emi-value{display:block;margin-top:4px;color:#1d4d4c;font-size:25px;font-variant-numeric:tabular-nums;font-weight:800}
.le-emi-footnote{margin-top:4px;color:#77888a;font-size:10px;line-height:1.45}
.le-metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:13px 15px}
.le-metric-card{display:grid;gap:5px;min-width:0;padding:10px;border:1px solid #e1e9e7;border-radius:5px;background:#fff}
.le-metric-card span{color:#6f8183;font-size:9px;font-weight:700}
.le-metric-card strong{overflow-wrap:anywhere;color:#24494c;font-size:16px;font-variant-numeric:tabular-nums}
.le-metric-card small{color:#829193;font-size:9px;line-height:1.4}
.le-capacity{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 15px 15px}
.le-capacity-item{padding:10px;border-left:2px solid #8bb9aa;background:#f6faf8}
.le-capacity-item span{display:block;color:#708284;font-size:9px;font-weight:700}
.le-capacity-item strong{display:block;margin-top:4px;color:#24534f;font-size:13px;overflow-wrap:anywhere}
.le-review-list{display:grid;gap:7px;margin:0;padding:13px 16px;border-top:1px solid #e7eeec;list-style:none}
.le-review-list li{display:flex;align-items:flex-start;gap:7px;color:#6d5b35;font-size:10px;line-height:1.45}
.le-review-list svg{flex:none;color:#a37c2c}
.le-guidance{border-top:1px solid #e7eeec}
.le-guidance summary{padding:13px 16px;color:#35575a;font-size:10px;font-weight:750;cursor:pointer}
.le-guidance-content{display:grid;gap:8px;padding:0 16px 15px;color:#647779;font-size:10px;line-height:1.5}
.le-guidance-content p{margin:0}
.le-disclaimer{margin:0;padding:11px 16px;border-top:1px solid #e7eeec;background:#fafcfb;color:#7a898a;font-size:9px;line-height:1.5}
.le-inline-error{margin:10px 0 0}
.le-score-hint{margin:0;color:#748688;font-size:10px;font-weight:500}
@media(max-width:980px){.le-assessment-layout{grid-template-columns:minmax(0,1fr)}.le-results-panel{position:static}.le-results-panel{display:grid;grid-template-columns:1fr 1fr}.le-results-head,.le-guidance,.le-disclaimer{grid-column:1/-1}.le-results-head{border-bottom:1px solid #e7eeec}.le-emi-block{border-right:1px solid #e7eeec}.le-review-list{grid-column:1/-1}.le-capacity{align-content:center}}
@media(max-width:620px){.le-wrap{padding:0 12px 24px}.le-section{padding:17px 14px}.le-form-fields{grid-template-columns:1fr;gap:12px}.le-form-actions{padding:13px 14px}.le-results-panel{display:block}.le-emi-block{border-right:0}.le-results-head,.le-guidance,.le-disclaimer,.le-review-list{grid-column:auto}.le-metric-grid{gap:7px;padding:11px 12px}.le-capacity{padding:0 12px 13px}.le-customer{margin-bottom:0}.le-name-fields{grid-template-columns:66px minmax(0,1fr)}}
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
  const existingDebt = Number(form.monthlyDebtService) || 0;
  const requestedAmount = Number(form.requestedAmount) || 0;
  const collateralValue = Number(form.collateralValue) || 0;
  const annualInterestRate = Number(form.annualInterestRate) || 0;
  const tenureMonths = Number(form.tenureMonths) || 0;
  const proposedEmi = calculateEmi(requestedAmount, annualInterestRate, tenureMonths);
  const totalDebtService = existingDebt + proposedEmi;
  const dtiValue = totalIncome > 0 ? totalDebtService / totalIncome * 100 : null;
  const foirValue = netIncome > 0 ? totalDebtService / netIncome * 100 : null;
  const ltvValue = collateralValue > 0 ? requestedAmount / collateralValue * 100 : null;
  const dscrValue = totalDebtService > 0 ? netIncome / totalDebtService : null;
  const ndirValue = totalIncome > 0 ? (netIncome - totalDebtService) / totalIncome * 100 : null;
  const maxAffordableEmi = Math.max(0, netIncome * 0.5 - existingDebt);
  const maxAffordableLoan = calculatePrincipal(maxAffordableEmi, annualInterestRate, tenureMonths);
  const homeLtvLimit = requestedAmount <= 3000000 ? 90 : requestedAmount <= 7500000 ? 80 : 75;
  const screeningFlags = [];
  if (foirValue !== null && foirValue > 50) screeningFlags.push('Proposed repayments exceed the 50% indicative FOIR ceiling.');
  if (ndirValue !== null && ndirValue < 0) screeningFlags.push('Monthly income does not cover declared expenses and loan repayments.');
  if (Number(form.cibilScore) > 0 && Number(form.cibilScore) < 650) screeningFlags.push('Credit score is below the indicative 650 screening floor.');
  if (form.loanType === 'Home loan' && ltvValue !== null && ltvValue > homeLtvLimit) screeningFlags.push(`Requested home-loan LTV exceeds the ${homeLtvLimit}% RBI benchmark for this loan amount.`);
  const reviewFlags = [];
  if (foirValue !== null && foirValue > 40 && foirValue <= 50) reviewFlags.push('FOIR is above the preferred 40% screening band.');
  if (Number(form.cibilScore) >= 650 && Number(form.cibilScore) < 750) reviewFlags.push('Credit score is below the commonly preferred 750 range.');
  if (dscrValue !== null && dscrValue < 1.25) reviewFlags.push('Estimated debt-service coverage is below 1.25x.');
  if (form.loanType === 'Home loan' && ltvValue !== null && ltvValue > homeLtvLimit - 5 && ltvValue <= homeLtvLimit) reviewFlags.push('Home-loan LTV is close to the RBI benchmark limit.');
  const localDecision = screeningFlags.length ? 'Outside indicative range' : reviewFlags.length ? 'Manual review recommended' : 'Within indicative range';
  const metric = (value, suffix = '%') => value !== null && Number.isFinite(value) ? `${value.toFixed(2)}${suffix}` : '—';
  const dti = metric(dtiValue);
  const ltv = metric(ltvValue);
  const dscr = metric(dscrValue, 'x');
  const ndir = metric(ndirValue);
  const foir = metric(foirValue);

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
    setDecision(localDecision);
    try {
      const result = await assessLoanEligibility({
        customer_number: form.customerNumber.trim(), customer_name: `${form.initials.trim()} ${form.name.trim()}`.trim(),
        requested_amount: requestedAmount, collateral_value: form.collateralValue ? collateralValue : null,
        loan_type: form.loanType, annual_interest_rate: annualInterestRate, tenure_months: tenureMonths,
        estimated_emi: proposedEmi, monthly_debt_service: existingDebt,
        income_expenses: form.rows.map((row) => ({ type: row.type.toLowerCase(), source: row.source.trim(), amount: Number(row.amount) })),
        cibil_score: Number(form.cibilScore), calculated_metrics: {
          total_income: totalIncome, total_expense: totalExpense, net_income: netIncome,
          existing_monthly_debt: existingDebt, proposed_emi: proposedEmi, total_monthly_debt_service: totalDebtService,
          max_affordable_emi: maxAffordableEmi, max_affordable_loan: maxAffordableLoan,
          foir: foir === '—' ? null : foir, dti: dti === '—' ? null : dti,
          ltv: ltv === '—' ? null : ltv, dscr: dscr === '—' ? null : dscr, ndir: ndir === '—' ? null : ndir
        }
      });
      if (result.configured) {
        const resultDecision = result.result?.data?.decision ?? result.result?.decision ?? result.result?.data?.eligible;
        setDecision(resultDecision === undefined ? localDecision : typeof resultDecision === 'boolean' ? (resultDecision ? 'Eligible' : 'Not eligible') : String(resultDecision));
        setMessage({ type: 'success', text: result.result?.message || 'Eligibility assessment completed.' });
      } else {
        setDecision(localDecision);
        setMessage({ type: 'info', text: 'This is an indicative screening only. Final eligibility, pricing and terms depend on the lender’s credit policy and document verification.' });
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

  const decisionTone = decision.includes('Outside') ? 'outside' : decision.includes('review') ? 'review' : '';
  const cibilBand = !form.cibilScore ? 'Not entered' : Number(form.cibilScore) >= 750 ? 'Strong range' : Number(form.cibilScore) >= 650 ? 'Review range' : 'Below screening floor';
  const monthlySurplus = netIncome - totalDebtService;

  return (
    <AppShell title="Loan Eligibility">
      <style>{styles}</style>
      <style>{assessmentStyles}</style>
      <main className="le-wrap">
        <PageHeader eyebrow="CREDIT ASSESSMENT" title="Loan Eligibility" description="Estimate repayment capacity using income, obligations, proposed EMI and collateral." />
        <p className="le-intro">Enter monthly take-home income and expenses, existing loan payments, requested amount, rate and term. The assessment is indicative; each lender applies its own credit policy.</p>
        {message && <div className={`le-message${message.type === 'error' ? ' error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
        <div className="le-assessment-layout">
          <form className="le-form-panel" onSubmit={submit} noValidate>
            <section className="le-section" aria-labelledby="le-applicant-heading">
              <header className="le-section-heading"><span className="le-section-index">01</span><div><h2 id="le-applicant-heading">Applicant & loan request</h2><p>Identify the applicant and set the proposed loan terms.</p></div></header>
              <div className="le-form-fields">
                <label className="le-field" htmlFor="le-customerNumber">Customer number *<input id="le-customerNumber" value={form.customerNumber} onChange={(event) => update('customerNumber', event.target.value.toUpperCase())} maxLength={24} autoComplete="off" aria-invalid={Boolean(errors.customerNumber)} />{errors.customerNumber && <small className="le-error">{errors.customerNumber}</small>}</label>
                <label className="le-field" htmlFor="le-name">Applicant name *<input id="le-name" value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={100} autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="le-error">{errors.name}</small>}</label>
                <label className="le-field" htmlFor="le-loanType">Loan product *<select id="le-loanType" value={form.loanType} onChange={(event) => update('loanType', event.target.value)}><option>Personal loan</option><option>Home loan</option><option>Vehicle loan</option><option>Business loan</option><option>Other secured loan</option></select></label>
                <label className="le-field" htmlFor="le-requestedAmount">Requested amount (₹) *<input id="le-requestedAmount" type="number" min="1" step="1000" inputMode="decimal" value={form.requestedAmount} onChange={(event) => update('requestedAmount', event.target.value)} aria-invalid={Boolean(errors.requestedAmount)} />{errors.requestedAmount && <small className="le-error">{errors.requestedAmount}</small>}</label>
                <label className="le-field" htmlFor="le-annualInterestRate">Expected annual interest rate (%) *<input id="le-annualInterestRate" type="number" min="0.01" max="60" step="0.01" inputMode="decimal" value={form.annualInterestRate} onChange={(event) => update('annualInterestRate', event.target.value)} aria-invalid={Boolean(errors.annualInterestRate)} />{errors.annualInterestRate && <small className="le-error">{errors.annualInterestRate}</small>}</label>
                <label className="le-field" htmlFor="le-tenureMonths">Loan term (months) *<input id="le-tenureMonths" type="number" min="6" max="480" step="1" value={form.tenureMonths} onChange={(event) => update('tenureMonths', event.target.value)} aria-invalid={Boolean(errors.tenureMonths)} />{errors.tenureMonths && <small className="le-error">{errors.tenureMonths}</small>}</label>
              </div>
            </section>

            <section className="le-section" aria-labelledby="le-cashflow-heading">
              <header className="le-section-heading"><span className="le-section-index">02</span><div><h2 id="le-cashflow-heading">Monthly income & expenses</h2><p>Use recurring monthly amounts. Keep existing loan EMIs in the debt field below, not as household expenses.</p></div></header>
              <div className="le-table-wrap">
                <table className="le-table">
                  <thead><tr><th>Type</th><th>Source</th><th>Monthly amount (₹)</th><th>Action</th></tr></thead>
                  <tbody>
                    {form.rows.map((row) => (
                      <tr key={row.id}>
                        <td><select id={`le-row-${row.id}-type`} aria-label={`Type for row ${row.id}`} value={row.type} onChange={(event) => updateRow(row.id, 'type', event.target.value)}><option>Income</option><option>Expense</option></select></td>
                        <td className="le-row-source"><input id={`le-row-${row.id}-source`} aria-label={`Source for row ${row.id}`} value={row.source} onChange={(event) => updateRow(row.id, 'source', event.target.value)} maxLength={60} aria-invalid={Boolean(errors[`row-${row.id}-source`])} />{errors[`row-${row.id}-source`] && <small className="le-error">{errors[`row-${row.id}-source`]}</small>}</td>
                        <td><input id={`le-row-${row.id}-amount`} aria-label={`${row.type} amount for row ${row.id}`} type="number" min="0" step="0.01" inputMode="decimal" value={row.amount} onChange={(event) => updateRow(row.id, 'amount', event.target.value)} aria-invalid={Boolean(errors[`row-${row.id}-amount`])} />{errors[`row-${row.id}-amount`] && <small className="le-error">{errors[`row-${row.id}-amount`]}</small>}</td>
                        <td><button className="le-remove" type="button" onClick={() => removeRow(row.id)} aria-label={`Remove ${row.type.toLowerCase()} row ${row.id}`} title="Remove row"><Trash2 size={15} /></button></td>
                      </tr>
                    ))}
                    <tr className="le-total-row"><th scope="row">Totals</th><td></td><td>Income ₹{money(totalIncome)}<br />Expenses ₹{money(totalExpense)}</td><td></td></tr>
                  </tbody>
                </table>
              </div>
              {errors.income && <p className="le-error le-inline-error" role="alert">{errors.income}</p>}
              {Object.keys(errors).some((key) => key.endsWith('-amount')) && <p className="le-error le-inline-error" role="alert">Check each monthly amount; use a non-negative value with up to two decimal places.</p>}
              <button className="le-add" type="button" onClick={addRow}><CirclePlus size={15} /> Add income or expense</button>
            </section>

            <section className="le-section" aria-labelledby="le-obligations-heading">
              <header className="le-section-heading"><span className="le-section-index">03</span><div><h2 id="le-obligations-heading">Obligations & collateral</h2><p>Include current EMIs and credit repayments; add collateral data for secured lending.</p></div></header>
              <div className="le-form-fields">
                <label className="le-field" htmlFor="le-monthlyDebtService">Existing monthly debt payments (₹) *<input id="le-monthlyDebtService" type="number" min="0" step="0.01" inputMode="decimal" value={form.monthlyDebtService} onChange={(event) => update('monthlyDebtService', event.target.value)} aria-invalid={Boolean(errors.monthlyDebtService)} />{errors.monthlyDebtService && <small className="le-error">{errors.monthlyDebtService}</small>}</label>
                <label className="le-field" htmlFor="le-cibilScore">CIBIL score (300–900) *<input id="le-cibilScore" type="number" min="300" max="900" step="1" value={form.cibilScore} onChange={(event) => update('cibilScore', event.target.value)} aria-invalid={Boolean(errors.cibilScore)} />{errors.cibilScore ? <small className="le-error">{errors.cibilScore}</small> : <small className="le-score-hint">Current entered range: {cibilBand}</small>}</label>
                <label className="le-field" htmlFor="le-collateralValue">{form.loanType === 'Home loan' ? 'Property market value (₹) *' : 'Collateral value (₹, optional)'}<input id="le-collateralValue" type="number" min="0" step="1000" inputMode="decimal" value={form.collateralValue} onChange={(event) => update('collateralValue', event.target.value)} aria-invalid={Boolean(errors.collateralValue)} />{errors.collateralValue && <small className="le-error">{errors.collateralValue}</small>}</label>
              </div>
            </section>

            <footer className="le-form-actions">
              <button className="le-btn" type="button" onClick={reset}><RotateCcw size={15} /> Reset</button>
              <button className="le-btn le-submit" type="submit" disabled={saving}>{saving ? <LoaderCircle className="le-spin" size={15} /> : <ClipboardCheck size={15} />}{saving ? 'Assessing...' : 'Run assessment'}</button>
            </footer>
          </form>

          <aside className="le-results-panel" aria-label="Live eligibility estimate">
            <header className="le-results-head"><span className="le-results-kicker">Live estimate</span><h2>Affordability summary</h2></header>
            <div className={`le-decision-banner ${decisionTone}`} role="status">
              {decisionTone ? <AlertTriangle size={17} /> : <ClipboardCheck size={17} />}
              <div><strong>{decision || 'Indicative estimate'}</strong><span>{decision ? 'Based on entered data and screening rules shown below.' : 'Complete the form and run assessment for a screening result.'}</span></div>
            </div>
            <div className="le-emi-block"><span className="le-emi-label">Estimated monthly EMI</span><strong className="le-emi-value">₹{money(proposedEmi)}</strong><p className="le-emi-footnote">Principal ₹{money(requestedAmount)} · {form.annualInterestRate || 0}% p.a. · {tenureMonths || 0} months</p></div>
            <div className="le-metric-grid" aria-label="Calculated financial ratios">
              <div className="le-metric-card"><span>DTI · gross income</span><strong>{dti}</strong><small>Total debt payments ÷ gross monthly income</small></div>
              <div className="le-metric-card"><span>FOIR · take-home</span><strong>{foir}</strong><small>Total EMIs ÷ income after listed expenses</small></div>
              <div className="le-metric-card"><span>LTV</span><strong>{ltv}</strong><small>{form.loanType === 'Home loan' ? `RBI benchmark cap: ${homeLtvLimit}%` : 'Loan amount ÷ collateral value'}</small></div>
              <div className="le-metric-card"><span>DSCR estimate</span><strong>{dscr}</strong><small>Monthly net income ÷ total debt service</small></div>
              <div className="le-metric-card"><span>Net disposable ratio</span><strong>{ndir}</strong><small>Available after expenses and EMIs ÷ gross income</small></div>
              <div className="le-metric-card"><span>CIBIL score</span><strong>{form.cibilScore || '—'}</strong><small>{cibilBand}</small></div>
            </div>
            <div className="le-capacity">
              <div className="le-capacity-item"><span>Estimated max loan at 50% FOIR</span><strong>{totalIncome > 0 && tenureMonths > 0 ? `₹${money(maxAffordableLoan)}` : '—'}</strong></div>
              <div className="le-capacity-item"><span>Monthly balance after proposed EMI</span><strong>{totalIncome > 0 ? `₹${money(monthlySurplus)}` : '—'}</strong></div>
            </div>
            <ul className="le-review-list" aria-label="Screening considerations">
              {decision ? [...screeningFlags, ...reviewFlags].length ? [...screeningFlags, ...reviewFlags].map((flag) => <li key={flag}><AlertTriangle size={13} />{flag}</li>) : <li><Check size={13} />No screening flags from the entered information.</li> : <li><AlertTriangle size={13} />Submit the completed inputs to run the screening checks.</li>}
            </ul>
            <details className="le-guidance">
              <summary>Formula & screening references</summary>
              <div className="le-guidance-content">
                <p><strong>EMI:</strong> reducing-balance payment based on requested principal, annual rate and tenure.</p>
                <p><strong>DTI:</strong> (existing monthly debt + proposed EMI) ÷ gross monthly income × 100.</p>
                <p><strong>FOIR:</strong> total monthly EMIs ÷ income remaining after listed expenses × 100. The 40% review and 50% ceiling are indicative lender-screening assumptions.</p>
                <p><strong>Home-loan LTV:</strong> requested loan ÷ property value. RBI benchmark ceilings are 90% up to ₹30 lakh, 80% above ₹30 lakh to ₹75 lakh, and 75% above ₹75 lakh.</p>
                <p><strong>DSCR / net disposable:</strong> monthly net income ÷ debt service; and (net income − debt service) ÷ gross income × 100.</p>
                <p><strong>Credit score:</strong> 750+ is treated as a preferred screening range and below 650 as a review flag, not an RBI-mandated cutoff.</p>
              </div>
            </details>
            <p className="le-disclaimer">This calculator is a preliminary estimate, not an approval, offer, or credit decision. RBI LTV limits apply to housing finance; lender rules, verified income, obligations, property valuation and applicable regulations determine the final result.</p>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}