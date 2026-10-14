'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Landmark,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import { getBankMaster, updateBankMaster } from '../../services/bankmaster';

const steps = [
  { id: 'bank', label: 'Bank Info', icon: Building2 },
  { id: 'address', label: 'Address Details', icon: MapPin },
  { id: 'accounts', label: 'Account Details', icon: Landmark },
  { id: 'limits', label: 'Limit Details', icon: SlidersHorizontal }
];

const emptyAccount = () => ({ bankName: '', accountType: '', accountNumber: '', micrCode: '', ifscCode: '' });
const emptyForm = () => ({
  bankCode: '', bankName: '', bankType: '', licenseNumber: '', pan: '', gstNumber: '', branchCount: '',
  addressType: '', pincode: '', address: '', addressLine2: '', landmark: '', city: '', state: '',
  accounts: Array.from({ length: 5 }, emptyAccount),
  singlePartyLimit: '', groupExposureLimit: '', sanctionMargin: '', penaltyCharge: '', penaltyRate: ''
});

function firstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function toForm(profile) {
  const form = emptyForm();
  const accountData = firstValue(profile, ['other_bank_details', 'otherBankDetails', 'account_details', 'accountDetails']);
  const accounts = Array.isArray(accountData) ? accountData.map((account) => ({
    bankName: firstValue(account, ['bank_name', 'bankName']),
    accountType: firstValue(account, ['account_type', 'accountType']),
    accountNumber: firstValue(account, ['account_number', 'account_no', 'accountNumber']),
    micrCode: firstValue(account, ['micr_code', 'micrCode']),
    ifscCode: firstValue(account, ['ifsc_code', 'ifscCode'])
  })) : [];

  return {
    ...form,
    bankCode: String(firstValue(profile, ['bank_code', 'bankCode', 'code'])),
    bankName: String(firstValue(profile, ['bank_name', 'bankName', 'name', 'legal_name'])),
    bankType: String(firstValue(profile, ['bank_type', 'bankType', 'type'])),
    licenseNumber: String(firstValue(profile, ['license_number', 'registration_license_number', 'licenseNumber', 'registration_number'])),
    pan: String(firstValue(profile, ['PAN', 'pan', 'pan_number'])),
    gstNumber: String(firstValue(profile, ['gst_number', 'gst_no', 'gstNumber'])),
    branchCount: String(firstValue(profile, ['number_of_branches', 'branch_count', 'numberOfBranches'])),
    addressType: String(firstValue(profile, ['address_type', 'addressType'])),
    pincode: String(firstValue(profile, ['pincode', 'pin_code', 'postal_code'])),
    address: String(firstValue(profile, ['unit_gala_name_and_number', 'address', 'address_line_1'])),
    addressLine2: String(firstValue(profile, ['street_road', 'address_line_2', 'address2'])),
    landmark: String(firstValue(profile, ['landmark', 'landmark_details'])),
    city: String(firstValue(profile, ['city'])),
    state: String(firstValue(profile, ['state', 'state_name'])),
    accounts: accounts.length ? accounts : form.accounts,
    singlePartyLimit: String(firstValue(profile, ['single_party_limit', 'singlePartyLimit'])),
    groupExposureLimit: String(firstValue(profile, ['group_exposure_limit', 'groupExposureLimit'])),
    sanctionMargin: String(firstValue(profile, ['sanction_margin', 'sanction_margin_percent', 'sanctionMargin'])),
    penaltyCharge: String(firstValue(profile, ['penalty_charge', 'penaltyCharge'])),
    penaltyRate: String(firstValue(profile, ['penalty_rate', 'penaltyRate']))
  };
}

function validateStep(stepIndex, values) {
  const errors = {};
  const add = (field, message) => { errors[field] = message; };
  const required = (field, label, minLength = 1) => {
    const value = String(values[field] || '').trim();
    if (value.length < minLength) add(field, `${label} must be at least ${minLength} characters.`);
  };
  const validAmount = (field, label, max = Number.MAX_SAFE_INTEGER) => {
    const value = String(values[field] || '').trim();
    if (value && (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) > max)) {
      add(field, `${label} must be a non-negative amount${max < Number.MAX_SAFE_INTEGER ? ` not over ${max}` : ''}.`);
    }
  };

  if (stepIndex === 0) {
    required('bankCode', 'Bank code', 2);
    if (values.bankCode.trim() && !/^[A-Z0-9][A-Z0-9-]{1,19}$/i.test(values.bankCode.trim())) {
      add('bankCode', 'Use 2–20 letters, numbers, or hyphens.');
    }
    required('bankName', 'Bank name', 2);
    if (values.bankName.trim().length > 120) add('bankName', 'Bank name cannot exceed 120 characters.');
    required('bankType', 'Bank type', 2);
    if (values.licenseNumber.trim() && !/^[A-Z0-9/-]{3,30}$/i.test(values.licenseNumber.trim())) {
      add('licenseNumber', 'Use 3–30 letters, numbers, /, or hyphens.');
    }
    if (values.pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(values.pan.trim())) add('pan', 'Enter a valid 10-character PAN.');
    if (values.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(values.gstNumber.trim())) {
      add('gstNumber', 'Enter a valid 15-character GSTIN.');
    }
    if (values.branchCount && (!/^\d+$/.test(values.branchCount) || Number(values.branchCount) < 1 || Number(values.branchCount) > 100000)) {
      add('branchCount', 'Enter a whole number between 1 and 100,000.');
    }
  }

  if (stepIndex === 1) {
    required('addressType', 'Address type', 2);
    required('address', 'Address', 3);
    required('city', 'City', 2);
    required('state', 'State', 2);
    if (!/^\d{6}$/.test(values.pincode.trim())) add('pincode', 'Enter a valid 6-digit Indian PIN code.');
    for (const field of ['address', 'addressLine2', 'landmark', 'city', 'state']) {
      if (values[field].trim().length > 120) add(field, 'This field cannot exceed 120 characters.');
    }
  }

  if (stepIndex === 2) {
    values.accounts.forEach((account, index) => {
      const prefix = `account-${index}-`;
      const hasValue = Object.values(account).some((value) => String(value).trim());
      if (!hasValue) return;
      for (const [key, label] of [['bankName', 'Bank name'], ['accountType', 'Account type'], ['accountNumber', 'Account number']]) {
        if (!String(account[key]).trim()) add(prefix + key, `${label} is required when entering account details.`);
      }
      if (account.accountNumber && !/^[A-Z0-9 -]{4,34}$/i.test(account.accountNumber.trim())) {
        add(prefix + 'accountNumber', 'Use 4–34 letters, numbers, spaces, or hyphens.');
      }
      if (account.micrCode && !/^\d{9}$/.test(account.micrCode.trim())) add(prefix + 'micrCode', 'MICR code must contain 9 digits.');
      if (account.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(account.ifscCode.trim())) add(prefix + 'ifscCode', 'Enter a valid 11-character IFSC code.');
    });
  }

  if (stepIndex === 3) {
    validAmount('singlePartyLimit', 'Single party limit');
    validAmount('groupExposureLimit', 'Group exposure limit');
    validAmount('penaltyCharge', 'Penalty charge');
    for (const field of ['sanctionMargin', 'penaltyRate']) {
      const value = String(values[field] || '').trim();
      if (value && (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) > 100)) {
        add(field, `${field === 'sanctionMargin' ? 'Sanction margin' : 'Penalty rate'} must be between 0 and 100.`);
      }
    }
  }
  return errors;
}

function TextField({ label, field, value, onChange, error, required = false, type = 'text', ...props }) {
  const errorId = `bank-master-${field}-error`;
  return (
    <label className="bank-master-field">
      <span>{label}{required && <em aria-hidden="true"> *</em>}</span>
      <input
        id={`bank-master-${field}`}
        name={field}
        type={type}
        value={value}
        onChange={onChange}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <small className="bank-master-field-error" id={errorId}>{error}</small>}
    </label>
  );
}

export default function BankMaster() {
  const [form, setForm] = useState(emptyForm);
  const [originalForm, setOriginalForm] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadBank() {
    setLoading(true);
    setPageError('');
    try {
      const response = await getBankMaster();
      const loadedForm = toForm(response?.data || response || {});
      setForm(loadedForm);
      setOriginalForm(loadedForm);
    } catch (error) {
      setPageError(error.message || 'Unable to load bank details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBank();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setNotice('');
  }

  function updateAccount(index, field, value) {
    setForm((current) => ({
      ...current,
      accounts: current.accounts.map((account, accountIndex) => accountIndex === index ? { ...account, [field]: value } : account)
    }));
    setErrors((current) => ({ ...current, [`account-${index}-${field}`]: '' }));
    setNotice('');
  }

  function validateCurrentStep() {
    const nextErrors = validateStep(activeStep, form);
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      const input = document.getElementById(`bank-master-${firstInvalidField}`);
      input?.focus();
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    setErrors({});
  }

  function cancelChanges() {
    if (originalForm) setForm({ ...originalForm, accounts: originalForm.accounts.map((account) => ({ ...account })) });
    setErrors({});
    setActiveStep(0);
    setNotice('Changes discarded.');
  }

  async function submitForm(event) {
    event.preventDefault();
    const allErrors = steps.reduce((collected, _step, index) => ({ ...collected, ...validateStep(index, form) }), {});
    setErrors(allErrors);
    const firstInvalidField = Object.keys(allErrors)[0];
    if (firstInvalidField) {
      const stepIndex = firstInvalidField.startsWith('account-') ? 2 : ['addressType', 'pincode', 'address', 'addressLine2', 'landmark', 'city', 'state'].includes(firstInvalidField) ? 1 : ['singlePartyLimit', 'groupExposureLimit', 'sanctionMargin', 'penaltyCharge', 'penaltyRate'].includes(firstInvalidField) ? 3 : 0;
      setActiveStep(stepIndex);
      window.setTimeout(() => document.getElementById(`bank-master-${firstInvalidField}`)?.focus(), 0);
      return;
    }

    setSaving(true);
    setPageError('');
    setNotice('');
    try {
      const response = await updateBankMaster(form);
      setOriginalForm({ ...form, accounts: form.accounts.map((account) => ({ ...account })) });
      setNotice(response?.message || 'Bank details updated successfully.');
      setActiveStep(0);
    } catch (error) {
      setPageError(error.message || 'Unable to update bank details.');
    } finally {
      setSaving(false);
    }
  }

  function addAccount() {
    setForm((current) => ({ ...current, accounts: [...current.accounts, emptyAccount()] }));
  }

  function removeAccount(index) {
    setForm((current) => ({ ...current, accounts: current.accounts.filter((_account, accountIndex) => accountIndex !== index) }));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`account-${index}-`))));
  }

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <AppShell title="Bank Master">
      <div className="bank-master-page">
        <PageHeader eyebrow="ADMINISTRATION" title="Bank Master" description="Review and update your bank's registered, account and lending details." />

        {pageError && (
          <div className="bank-master-alert" role="alert">
            <span>{pageError}</span>
            {!loading && <button type="button" onClick={loadBank}>Try again</button>}
          </div>
        )}
        {notice && <p className="bank-master-success" role="status"><Check size={16} />{notice}</p>}

        <section className="bank-master-card" aria-label="Bank master editor">
          {loading ? (
            <div className="bank-master-loading"><LoaderCircle size={22} /> Loading bank details...</div>
          ) : !originalForm ? (
            <div className="bank-master-empty">Bank details could not be loaded. Try again to continue.</div>
          ) : (
            <form onSubmit={submitForm} noValidate>
              <div className="bank-master-layout">
                <nav className="bank-master-steps" aria-label="Bank details sections">
                  {steps.map(({ id, label, icon: Icon }, index) => (
                    <button
                      className={`bank-master-step${activeStep === index ? ' active' : ''}${activeStep > index ? ' visited' : ''}`}
                      type="button"
                      key={id}
                      aria-current={activeStep === index ? 'step' : undefined}
                      onClick={() => index < activeStep && setActiveStep(index)}
                      disabled={index > activeStep}
                    >
                      <span className="bank-master-step-icon"><Icon size={17} /></span>
                      <span>{label}</span>
                      {activeStep > index && <Check className="bank-master-step-check" size={15} />}
                    </button>
                  ))}
                </nav>

                <div className="bank-master-panel" key={currentStep.id}>
                  <header className="bank-master-panel-heading">
                    <span className="bank-master-panel-icon"><StepIcon size={19} /></span>
                    <div>
                      <span>STEP {activeStep + 1} OF {steps.length}</span>
                      <h2>{currentStep.label}</h2>
                    </div>
                  </header>

                  {activeStep === 0 && (
                    <div className="bank-master-fields">
                      <TextField label="Bank Code" field="bankCode" value={form.bankCode} onChange={(event) => updateField('bankCode', event.target.value.toUpperCase())} error={errors.bankCode} required maxLength={20} autoComplete="off" />
                      <TextField label="Bank Name" field="bankName" value={form.bankName} onChange={(event) => updateField('bankName', event.target.value)} error={errors.bankName} required maxLength={120} autoComplete="organization" />
                      <TextField label="Bank Type" field="bankType" value={form.bankType} onChange={(event) => updateField('bankType', event.target.value)} error={errors.bankType} required maxLength={80} />
                      <TextField label="Registration License No." field="licenseNumber" value={form.licenseNumber} onChange={(event) => updateField('licenseNumber', event.target.value.toUpperCase())} error={errors.licenseNumber} maxLength={30} />
                      <TextField label="PAN No." field="pan" value={form.pan} onChange={(event) => updateField('pan', event.target.value.toUpperCase())} error={errors.pan} maxLength={10} autoComplete="off" />
                      <TextField label="G.S.T. No." field="gstNumber" value={form.gstNumber} onChange={(event) => updateField('gstNumber', event.target.value.toUpperCase())} error={errors.gstNumber} maxLength={15} autoComplete="off" />
                      <TextField label="No. of Branches" field="branchCount" value={form.branchCount} onChange={(event) => updateField('branchCount', event.target.value)} error={errors.branchCount} type="number" min="1" max="100000" step="1" />
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="bank-master-fields">
                      <TextField label="Address Type" field="addressType" value={form.addressType} onChange={(event) => updateField('addressType', event.target.value)} error={errors.addressType} required maxLength={40} placeholder="Registered / Corporate" />
                      <TextField label="Pincode" field="pincode" value={form.pincode} onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} error={errors.pincode} required inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                      <TextField label="Address" field="address" value={form.address} onChange={(event) => updateField('address', event.target.value)} error={errors.address} required maxLength={120} className="wide" autoComplete="address-line1" />
                      <TextField label="Address 2" field="addressLine2" value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} error={errors.addressLine2} maxLength={120} className="wide" autoComplete="address-line2" />
                      <TextField label="Landmark" field="landmark" value={form.landmark} onChange={(event) => updateField('landmark', event.target.value)} error={errors.landmark} maxLength={120} className="wide" />
                      <TextField label="City" field="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} error={errors.city} required maxLength={120} autoComplete="address-level2" />
                      <TextField label="State" field="state" value={form.state} onChange={(event) => updateField('state', event.target.value)} error={errors.state} required maxLength={120} autoComplete="address-level1" />
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="bank-master-accounts">
                      <div className="bank-master-table-heading">
                        <div><h3>Other Bank Details</h3><p>Add the bank accounts used for settlement and clearing.</p></div>
                        <button className="bank-master-add-row" type="button" onClick={addAccount}><Plus size={16} /> Add account</button>
                      </div>
                      <div className="bank-master-table-wrap">
                        <table className="bank-master-table">
                          <thead><tr><th>Particulars</th><th>Bank Name</th><th>Account Type</th><th>Account No.</th><th>MICR Code</th><th>IFSC Code</th><th><span className="sr-only">Actions</span></th></tr></thead>
                          <tbody>
                            {form.accounts.map((account, index) => (
                              <tr key={index}>
                                <td>Account {index + 1}</td>
                                {[
                                  ['bankName', 'Bank name'], ['accountType', 'Account type'], ['accountNumber', 'Account number'], ['micrCode', 'MICR code'], ['ifscCode', 'IFSC code']
                                ].map(([field, label]) => {
                                  const errorKey = `account-${index}-${field}`;
                                  return (
                                    <td key={field}>
                                      <input
                                        id={`bank-master-${errorKey}`}
                                        aria-label={`${label}, account ${index + 1}`}
                                        aria-invalid={Boolean(errors[errorKey])}
                                        aria-describedby={errors[errorKey] ? `bank-master-${errorKey}-error` : undefined}
                                        value={account[field]}
                                        onChange={(event) => updateAccount(index, field, ['ifscCode', 'micrCode'].includes(field) ? event.target.value.toUpperCase() : event.target.value)}
                                        maxLength={field === 'ifscCode' ? 11 : field === 'micrCode' ? 9 : field === 'accountNumber' ? 34 : 80}
                                        inputMode={field === 'micrCode' ? 'numeric' : undefined}
                                      />
                                      {errors[errorKey] && <small className="bank-master-field-error" id={`bank-master-${errorKey}-error`}>{errors[errorKey]}</small>}
                                    </td>
                                  );
                                })}
                                <td><button className="bank-master-remove-row" type="button" onClick={() => removeAccount(index)} aria-label={`Remove account ${index + 1}`} title="Remove account"><Trash2 size={15} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="bank-master-fields">
                      <TextField label="Single Party Limit" field="singlePartyLimit" value={form.singlePartyLimit} onChange={(event) => updateField('singlePartyLimit', event.target.value)} error={errors.singlePartyLimit} type="number" min="0" step="0.01" inputMode="decimal" />
                      <TextField label="Group Exposure Limit" field="groupExposureLimit" value={form.groupExposureLimit} onChange={(event) => updateField('groupExposureLimit', event.target.value)} error={errors.groupExposureLimit} type="number" min="0" step="0.01" inputMode="decimal" />
                      <TextField label="Sanction Margin %" field="sanctionMargin" value={form.sanctionMargin} onChange={(event) => updateField('sanctionMargin', event.target.value)} error={errors.sanctionMargin} type="number" min="0" max="100" step="0.01" inputMode="decimal" />
                      <TextField label="Penalty Charge" field="penaltyCharge" value={form.penaltyCharge} onChange={(event) => updateField('penaltyCharge', event.target.value)} error={errors.penaltyCharge} type="number" min="0" step="0.01" inputMode="decimal" />
                      <TextField label="Penalty Rate %" field="penaltyRate" value={form.penaltyRate} onChange={(event) => updateField('penaltyRate', event.target.value)} error={errors.penaltyRate} type="number" min="0" max="100" step="0.01" inputMode="decimal" />
                    </div>
                  )}

                  <footer className="bank-master-actions">
                    <button className="bank-master-cancel" type="button" onClick={cancelChanges}><RotateCcw size={16} /> Cancel</button>
                    <div>
                      {activeStep > 0 && <button className="bank-master-previous" type="button" onClick={() => { setActiveStep((step) => step - 1); setErrors({}); }}><ChevronLeft size={17} /> Previous</button>}
                      {activeStep < steps.length - 1 ? (
                        <button className="bank-master-next" type="button" onClick={goNext}>Next <ChevronRight size={17} /></button>
                      ) : (
                        <button className="bank-master-next" type="submit" disabled={saving}>{saving ? <LoaderCircle className="bank-master-spinner" size={16} /> : <Save size={16} />}{saving ? 'Saving...' : 'Submit'}</button>
                      )}
                    </div>
                  </footer>
                </div>
              </div>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}