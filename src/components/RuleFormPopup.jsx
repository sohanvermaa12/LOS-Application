'use client';

import { useState } from 'react';

const ruleTypes = ['Eligibility', 'Validation', 'Calculation', 'Document', 'Workflow'];
const emptyRule = {
  loanType: 'Business Loan',
  type: 'Eligibility',
  name: '',
  field: '',
  operator: 'Less than',
  value: '',
  action: 'Fail validation',
  errorMessage: '',
  active: true
};

export default function RuleFormPopup({ rule, onCancel, onSave, embedded = false }) {
  const [form, setForm] = useState(() => rule ? { ...rule } : { ...emptyRule });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  const content = (
    <form className="rule-form" onSubmit={submit}>
      {!embedded && <div className="rule-form-heading">
        <h2 id="rule-form-title">{rule ? 'Edit rule' : 'Add rule'}</h2>
        <p>Select a loan type, then fill in the rule details below.</p>
      </div>}
      <label className="rule-form-field">
        <span>Loan type</span>
        <select value={form.loanType} onChange={(event) => update('loanType', event.target.value)}>
          <option>Business Loan</option>
          <option>Gold Loan</option>
          <option>Personal Loan</option>
          <option>Home Loan</option>
          <option>Vehicle Loan</option>
        </select>
      </label>
      <div className="rule-form-type">
        <span>Rule type</span>
        <div className="rule-type-options">
          {ruleTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={form.type === type ? 'selected' : ''}
              aria-pressed={form.type === type}
              onClick={() => update('type', type)}
            >{type}</button>
          ))}
        </div>
      </div>
      <label className="rule-form-field">
        <span>Rule name</span>
        <input required maxLength={100} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Enter rule name" />
      </label>
      <div className="rule-form-condition">
        <label className="rule-form-field">
          <span>Field</span>
          <input required maxLength={100} value={form.field} onChange={(event) => update('field', event.target.value)} placeholder="e.g. Applicant Age" />
        </label>
        <label className="rule-form-field">
          <span>Operator</span>
          <select value={form.operator} onChange={(event) => update('operator', event.target.value)}>
            <option>Less than</option>
            <option>Less than or equal to</option>
            <option>Equal to</option>
            <option>Not equal to</option>
            <option>Greater than</option>
            <option>Greater than or equal to</option>
          </select>
        </label>
        <label className="rule-form-field">
          <span>Value</span>
          <input required maxLength={100} value={form.value} onChange={(event) => update('value', event.target.value)} placeholder="Enter value" />
        </label>
      </div>
      <label className="rule-form-field">
        <span>Action when condition matches</span>
        <select value={form.action} onChange={(event) => update('action', event.target.value)}>
          <option>Fail validation</option>
          <option>Manual review</option>
          <option>Block application</option>
          <option>Request additional documents</option>
        </select>
      </label>
      <label className="rule-form-field">
        <span>Error message</span>
        <input required maxLength={240} value={form.errorMessage} onChange={(event) => update('errorMessage', event.target.value)} placeholder="Message shown when this rule matches" />
      </label>
      <label className="rule-form-active"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /> Active after saving</label>
      <div className="rule-form-actions">
        <button type="button" className="rule-button secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="rule-button primary">{rule ? 'Save Changes' : 'Save Rule'}</button>
      </div>
    </form>
  );

  if (embedded) return content;
  return (
    <div className="rule-form-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="rule-form-dialog" role="dialog" aria-modal="true" aria-labelledby="rule-form-title">
        {content}
      </section>
    </div>
  );
}
