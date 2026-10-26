'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Building2,
  CheckCircle2,
  FilePlus2,
  Search,
  UserRound,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import { api } from '../../services/api';
import { getLoanProducts } from '../../services/loanProducts';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

function getApplicationId(application) {
  return application.id || application.applicationId || 'Not available';
}

function getCustomerName(application) {
  const borrower = application.borrower || application.customerDetails || {};
  return (
    application.customer ||
    application.customerName ||
    borrower.fullName ||
    borrower.name ||
    [borrower.firstName, borrower.lastName].filter(Boolean).join(' ') ||
    'Not available'
  );
}

function getCustomerCategory(application, customers) {
  const customer = customers.find(
    (record) => record.id === application.customerId,
  );
  const category =
    application.customerCategory ||
    application.category ||
    customer?.type ||
    '';
  const normalizedCategory = String(category).trim().toLowerCase();

  if (
    ['retail', 'individual', 'person'].some((value) =>
      normalizedCategory.includes(value),
    )
  ) {
    return 'Retail';
  }

  if (
    ['corporate', 'company', 'business', 'proprietorship', 'partnership'].some(
      (value) => normalizedCategory.includes(value),
    )
  ) {
    return 'Corporate';
  }

  return 'Not specified';
}

function getStatusLabel(status) {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const knownStatuses = {
    approved: 'Approved',
    disbursed: 'Disbursed',
    rejected: 'Rejected',
    pending: 'Pending',
    draft: 'Pending',
    'in review': 'Under Review',
    'under review': 'Under Review',
    'awaiting kyc': 'Awaiting KYC',
    returned: 'Returned',
  };

  return knownStatuses[normalizedStatus] || status || 'Not available';
}

function formatAmount(amount) {
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return currencyFormatter.format(amount);
  }

  if (typeof amount !== 'string') return 'Not available';

  const numericAmount = Number(amount.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numericAmount) && amount.trim()
    ? currencyFormatter.format(numericAmount)
    : 'Not available';
}

function formatApplicationDate(date) {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function getStatusClass(status) {
  return getStatusLabel(status).toLowerCase().replace(/\s+/g, '-');
}

export default function LoanDashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [corporateUnavailable, setCorporateUnavailable] = useState(false);
  const [showRetailForm, setShowRetailForm] = useState(false);
  const applicationsAvailable = Array.isArray(api.applications);
  const applications = applicationsAvailable ? api.applications : [];
  const customers = Array.isArray(api.customers) ? api.customers : [];

  useEffect(() => {
    if (!categorySelectorOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setCategorySelectorOpen(false);
        setCorporateUnavailable(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [categorySelectorOpen]);

  const applicationRows = useMemo(
    () =>
      applications.map((application) => ({
        application,
        id: getApplicationId(application),
        customerName: getCustomerName(application),
        category: getCustomerCategory(application, customers),
      })),
    [applications, customers],
  );

  const applicationCounts = useMemo(
    () => ({
      total: applications.length,
      approved: applications.filter(
        (application) =>
          String(application.status || '').trim().toLowerCase() === 'approved',
      ).length,
      disbursed: applications.filter(
        (application) =>
          String(application.status || '').trim().toLowerCase() ===
          'disbursed',
      ).length,
    }),
    [applications],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return applicationRows;

    return applicationRows.filter(({ id, customerName, category }) =>
      [id, customerName, category].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [applicationRows, searchTerm]);

  const metrics = [
    {
      label: 'Total No. of Applications',
      value: applicationCounts.total,
      icon: FilePlus2,
      tone: 'teal',
    },
    {
      label: 'Approved Applications',
      value: applicationCounts.approved,
      icon: CheckCircle2,
      tone: 'green',
    },
    {
      label: 'Disbursed Applications',
      value: applicationCounts.disbursed,
      icon: Banknote,
      tone: 'blue',
    },
  ];

  const openCategorySelector = () => {
    setCorporateUnavailable(false);
    setCategorySelectorOpen(true);
  };

  const closeCategorySelector = () => {
    setCategorySelectorOpen(false);
    setCorporateUnavailable(false);
  };

  if (showRetailForm) {
    return <LoanApplicationFormPage onBack={() => setShowRetailForm(false)} />;
  }

  return (
    <AppShell title="Loan Dashboard">
      <div className="loan-dashboard">
        <PageHeader
          // eyebrow="LOAN ORIGINATION"
          title="Loan Dashboard"
          // description="Track loan applications, approvals, and disbursements in one place."
          action={
            <button
              className="primary-button apply-button"
              type="button"
              onClick={openCategorySelector}
            >
              <FilePlus2 size={16} />
              Apply for Loan
            </button>
          }
        />

        <section className="loan-metrics" aria-label="Loan application summary">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <Card className="loan-metric-card" key={label}>
              <div className={`loan-metric-icon ${tone}`}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            </Card>
          ))}
        </section>

        <Card className="loan-table-card">
          <div className="loan-table-heading">
            <div>
              <h2>Loan Applications</h2>
              <p>Review application details and current status.</p>
            </div>
            <span className="sample-data-label">Development sample data</span>
          </div>

          <label className="loan-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by application ID, customer, or category"
              aria-label="Search loan applications"
            />
          </label>

          {!applicationsAvailable ? (
            <div className="loan-table-message error-message" role="alert">
              Application records are unavailable. Please try again later.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="loan-table-message">
              <FilePlus2 size={22} aria-hidden="true" />
              <strong>
                {applications.length === 0
                  ? 'No loan applications yet'
                  : 'No applications match your search'}
              </strong>
              <span>
                {applications.length === 0
                  ? 'Applications will appear here when they are available.'
                  : 'Try another application ID, customer name, or category.'}
              </span>
            </div>
          ) : (
            <div className="loan-table-scroll">
              <table className="loan-applications-table">
                <thead>
                  <tr>
                    <th scope="col">Sr. No.</th>
                    <th scope="col">Loan Application ID</th>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Customer Category</th>
                    <th scope="col">Loan Amount</th>
                    <th scope="col">Application Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(
                    ({ application, id, customerName, category }, index) => (
                      <tr key={`${id}-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <strong className="application-id">{id}</strong>
                        </td>
                        <td>{customerName}</td>
                        <td>{category}</td>
                        <td className="loan-amount">
                          {formatAmount(application.amount)}
                        </td>
                        <td>
                          {formatApplicationDate(
                            application.applicationDate ||
                              application.createdAt ||
                              application.date,
                          )}
                        </td>
                        <td>
                          <span
                            className={`loan-status ${getStatusClass(
                              application.status,
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td>
                          <span className="no-action" aria-label="No detail view available">
                            —
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {applicationsAvailable && applications.length > 0 && (
            <p className="data-note">
              These records are existing in-project development  fixtures; no
              live loan-application API is configured.
            </p>
          )}
        </Card>

        {categorySelectorOpen && (
          <div
            className="category-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeCategorySelector();
            }}
          >
            <section
              className="category-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-dialog-title"
            >
              <button
                className="category-close"
                type="button"
                onClick={closeCategorySelector}
                autoFocus
                aria-label="Close customer category selection"
              >
                <X size={19} />
              </button>
              <div className="category-dialog-icon">
                <FilePlus2 size={21} aria-hidden="true" />
              </div>
              <h2 id="category-dialog-title">Select Customer Category</h2>
              <p className="category-dialog-description">
                Choose the type of customer applying for a loan.
              </p>

              <div className="category-options">
                <button
                  className="category-option"
                  type="button"
                  onClick={() => {
                    closeCategorySelector();
                    setShowRetailForm(true);
                  }}
                >
                  <span className="category-option-icon retail">
                    <UserRound size={19} aria-hidden="true" />
                  </span>
                  <span className="category-option-copy">
                    <strong>Retail</strong>
                    <span>Apply for an individual customer.</span>
                  </span>
                  <span className="category-option-arrow" aria-hidden="true">→</span>
                </button>
                <button
                  className={`category-option ${corporateUnavailable ? 'selected' : ''}`}
                  type="button"
                  onClick={() => setCorporateUnavailable(true)}
                >
                  <span className="category-option-icon corporate">
                    <Building2 size={19} aria-hidden="true" />
                  </span>
                  <span className="category-option-copy">
                    <strong>Corporate</strong>
                    <span>Apply for a business or corporate customer.</span>
                  </span>
                  <span className="category-option-arrow" aria-hidden="true">→</span>
                </button>
              </div>

              {corporateUnavailable && (
                <div className="corporate-notice" role="status">
                  <Building2 size={18} aria-hidden="true" />
                  <div>
                    <strong>
                      Corporate loan application is not yet available
                    </strong>
                    <span>
                      No dedicated Corporate loan application form is configured
                      in this project yet.
                    </span>
                  </div>
                </div>
              )}

              <button
                className="category-back"
                type="button"
                onClick={closeCategorySelector}
              >
                Return to Loan Dashboard
              </button>
            </section>
          </div>
        )}

        <style jsx>{`
          .loan-dashboard {
            min-width: 0;
          }

          :global(.apply-button) {
            flex-shrink: 0;
            color: #ffffff !important;
            background: #198754 !important;
            border-color: #198754 !important;
          }

          :global(.apply-button:hover) {
            color: #ffffff !important;
            background: #146c43 !important;
            border-color: #13653f !important;
          }

          :global(.apply-button:focus-visible) {
            outline: 3px solid #19875455;
            outline-offset: 3px;
          }

          .loan-metrics {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 15px;
            margin-bottom: 19px;
          }

          .loan-metrics :global(.loan-metric-card) {
            min-height: 126px;
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
          }

          .loan-metric-icon {
            width: 42px;
            height: 42px;
            display: grid;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 9px;
          }

          .loan-metric-icon.teal {
            color: #177e7a;
            background: #e5f2f0;
          }

          .loan-metric-icon.green {
            color: #398365;
            background: #e7f3eb;
          }

          .loan-metric-icon.blue {
            color: #4e7da2;
            background: #e8f0f7;
          }

          .loan-metrics :global(.loan-metric-card p) {
            margin: 0 0 6px;
            color: #718185;
            font-size: 12px;
          }

          .loan-metrics :global(.loan-metric-card strong) {
            color: #1e3f45;
            font: 700 27px Manrope, sans-serif;
            line-height: 1.1;
          }

          :global(.loan-table-card) {
            min-width: 0;
          }

          .loan-table-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 19px;
          }

          .loan-table-heading h2 {
            margin: 0;
            color: #23474c;
            font: 700 16px Manrope, sans-serif;
          }

          .loan-table-heading p {
            margin: 6px 0 0;
            color: #91a0a3;
            font-size: 11px;
          }

          .sample-data-label {
            flex-shrink: 0;
            padding: 6px 9px;
            border: 1px solid #e5ecec;
            border-radius: 20px;
            color: #718185;
            background: #f8fbfa;
            font-size: 10px;
            font-weight: 600;
          }

          .loan-search {
            min-height: 40px;
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 17px;
            padding: 0 12px;
            border: 1px solid #dfe8e8;
            border-radius: 6px;
            color: #849497;
            background: #fff;
          }

          .loan-search:focus-within {
            border-color: #70aaa4;
            box-shadow: 0 0 0 3px #177e7a18;
          }

          .loan-search input {
            width: 100%;
            min-width: 0;
            height: 38px;
            padding: 0;
            border: 0;
            outline: 0;
            color: #33474c;
            background: transparent;
            font-size: 12px;
          }

          .loan-search input::placeholder {
            color: #9aa8aa;
          }

          .loan-table-scroll {
            overflow-x: auto;
            border: 1px solid #edf2f1;
            border-radius: 6px;
          }

          .loan-applications-table {
            width: 100%;
            min-width: 980px;
            border-collapse: collapse;
            text-align: left;
            color: #617377;
            font-size: 11px;
          }

          .loan-applications-table th {
            padding: 12px;
            border-top: 0;
            white-space: nowrap;
          }

          .loan-applications-table td {
            padding: 13px 12px;
            white-space: nowrap;
          }

          .application-id {
            color: #267a7a;
          }

          .loan-amount {
            color: #435f63;
            font-weight: 700;
          }

          .loan-status {
            display: inline-flex;
            align-items: center;
            padding: 5px 8px;
            border-radius: 20px;
            color: #617377;
            background: #eef2f2;
            font-size: 10px;
            font-weight: 700;
          }

          .loan-status.approved,
          .loan-status.disbursed {
            color: #31815e;
            background: #e7f3eb;
          }

          .loan-status.pending,
          .loan-status.awaiting-kyc,
          .loan-status.returned {
            color: #a16f35;
            background: #fbf1e2;
          }

          .loan-status.under-review {
            color: #4d7c9f;
            background: #eaf1f7;
          }

          .loan-status.rejected {
            color: #a95757;
            background: #faeaea;
          }

          .no-action {
            color: #a3afb0;
          }

          .data-note {
            margin: 13px 0 0;
            color: #899799;
            font-size: 10px;
            line-height: 1.5;
          }

          .loan-table-message {
            min-height: 190px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 24px;
            border: 1px dashed #dfe8e8;
            border-radius: 6px;
            color: #8a999b;
            text-align: center;
          }

          .loan-table-message strong {
            color: #395b60;
            font-size: 13px;
          }

          .loan-table-message span {
            font-size: 11px;
          }

          .loan-table-message.error-message {
            color: #a95757;
            background: #fffafa;
          }

          .category-overlay {
            position: fixed;
            z-index: 100;
            inset: 0;
            display: grid;
            place-items: center;
            padding: 20px;
            background: rgb(18 39 43 / 45%);
          }

          .category-dialog {
            position: relative;
            width: min(100%, 490px);
            padding: 30px;
            border: 1px solid #e5ecec;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 20px 60px rgb(23 63 73 / 20%);
          }

          .category-close {
            position: absolute;
            top: 14px;
            right: 14px;
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border-radius: 6px;
            color: #718185;
          }

          .category-close:hover {
            color: #173e46;
            background: #f1f6f5;
          }

          .category-dialog-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            margin-bottom: 17px;
            border-radius: 9px;
            color: #177e7a;
            background: #e5f2f0;
          }

          .category-dialog h2 {
            margin: 0;
            color: #173e46;
            font: 700 20px Manrope, sans-serif;
            letter-spacing: -0.4px;
          }

          .category-dialog-description {
            margin: 8px 0 21px;
            color: #718185;
            font-size: 12px;
            line-height: 1.5;
          }

          .category-options {
            display: grid;
            gap: 10px;
          }

          .category-option {
            width: 100%;
            min-height: 76px;
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 13px;
            border: 1px solid #e2eaea;
            border-radius: 8px;
            background: #fff;
            text-align: left;
            transition: border-color 0.16s ease, background-color 0.16s ease;
          }

          .category-option:hover,
          .category-option.selected {
            border-color: #8bbab4;
            background: #fbfefd;
          }

          .category-option-icon {
            width: 38px;
            height: 38px;
            display: grid;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 8px;
          }

          .category-option-icon.retail {
            color: #177e7a;
            background: #e5f2f0;
          }

          .category-option-icon.corporate {
            color: #4e7da2;
            background: #e8f0f7;
          }

          .category-option-copy {
            display: grid;
            gap: 5px;
          }

          .category-option-copy strong {
            color: #34565b;
            font-size: 12px;
          }

          .category-option-copy span {
            color: #849497;
            font-size: 11px;
          }

          .category-option-arrow {
            margin-left: auto;
            color: #819396;
            font-size: 18px;
          }

          .corporate-notice {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-top: 14px;
            padding: 12px;
            border: 1px solid #f0dfc5;
            border-radius: 7px;
            color: #a16f35;
            background: #fffaf2;
          }

          .corporate-notice svg {
            flex: 0 0 auto;
            margin-top: 1px;
          }

          .corporate-notice div {
            display: grid;
            gap: 5px;
          }

          .corporate-notice strong {
            font-size: 11px;
          }

          .corporate-notice span {
            color: #8d795f;
            font-size: 10px;
            line-height: 1.5;
          }

          .category-back {
            margin-top: 19px;
            padding: 7px 0;
            color: #177e7a;
            font-size: 11px;
            font-weight: 700;
          }

          .category-back:hover {
            color: #0c5d5d;
            text-decoration: underline;
          }

          .apply-button:focus-visible,
          .category-option:focus-visible,
          .category-close:focus-visible,
          .category-back:focus-visible {
            outline: 3px solid #177e7a55;
            outline-offset: 2px;
          }

          @media (max-width: 900px) {
            .loan-metrics {
              gap: 11px;
            }

            .loan-metrics :global(.loan-metric-card) {
              padding: 16px;
            }

            .loan-metric-icon {
              width: 37px;
              height: 37px;
            }

            .loan-metrics :global(.loan-metric-card p) {
              font-size: 11px;
            }
          }

          @media (max-width: 640px) {
            .loan-metrics {
              grid-template-columns: 1fr;
            }

            .loan-metrics :global(.loan-metric-card) {
              min-height: 92px;
            }

            :global(.loan-table-card) {
              padding: 16px;
            }

            .loan-table-heading {
              flex-direction: column;
            }

            .category-dialog {
              padding: 24px 20px;
            }
          }
        `}</style>
      </div>
    </AppShell>
  );
}

const steps = [
  'Borrower Details',
  'Related Party',
  'Loan Details',
  'Repayment Chart',
  'Basic Details',
  'Security Details',
  'Insurance Details',
  'Disbursement',
];

const borrowerNamePattern = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;
const nameInputPattern = /^[\p{L}\p{M} '-]*$/u;
const codeInputPattern = /^[A-Za-z0-9_-]*$/;
const nameError = 'Use letters only. Spaces, apostrophes, and hyphens are allowed.';
const MIN_TEXT_LENGTH = 3;
const MAX_TEXT_LENGTH = 125;

const createInitialForm = () => ({
  loanAccountNumber: '',
  effectiveDate: '',
  customerId: '',
  title: '',
  firstName: '',
  middleName: '',
  lastName: '',
  productCode: '',
  productName: '',
  modeOfOperationYesNo: '',
  modeOfOperation: '',
  relatedParties: [],
  loanAmount: '',
  interestRate: '',
  offsetRate: '',
  moratorium: '',
  expiryDate: '',
  instalmentAmount: '',
  instalmentStartDate: '',
  tenureMonths: '',
  totalInterestRate: '',
  sanctionedDate: '',
  emi: '',
  bulletPayment: '',
  instalmentEndDate: '',
  basicDetails: {
    purposeCode: '',
    termCode: '',
    prioritySector: '',
    prioritySectorCode: '',
    industryType: '',
    industrySubType: '',
    physicallyChallenged: '',
  },
  security: {
    securityId: '',
    securityType: '',
    effectiveDate: '',
    assetType: '',
    securityAmount: '',
    marginPercent: '',
    address: '',
    address1: '',
    city: '',
    state: '',
    pincode: '',
    valuationAmount: '',
    valuerName: '',
    valuationDate: '',
    inspectionBy: '',
    inspectionDate: '',
    inspectionReport: null,
    inspectionReportError: '',
  },
});

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
};

function validateTextLength(key, value, label, errors, required = true) {
  const text = String(value ?? '').trim();
  if (!text) {
    if (required) errors[key] = `${label} is required.`;
    return;
  }
  if (text.length < MIN_TEXT_LENGTH || text.length > MAX_TEXT_LENGTH) {
    errors[key] = `${label} must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters.`;
  }
}

function validateName(key, value, label, errors, required = true) {
  const text = String(value ?? '').trim();
  if (!text) {
    if (required) errors[key] = `${label} is required.`;
    return;
  }
  if (text.length < MIN_TEXT_LENGTH || text.length > MAX_TEXT_LENGTH) {
    errors[key] = `${label} must be between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters.`;
    return;
  }
  if (!borrowerNamePattern.test(text)) {
    errors[key] = nameError;
  }
}

function validateDate(key, value, label, errors, required = false) {
  if (!String(value ?? '').trim()) {
    if (required) errors[key] = `${label} is required.`;
  } else if (!isValidDate(value)) {
    errors[key] = `Enter a valid ${label.toLowerCase()}.`;
  }
}

function validateNumber(key, value, label, errors, { required = false, positive = false } = {}) {
  if (!String(value ?? '').trim()) {
    if (required) errors[key] = `${label} is required.`;
    return;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (positive && number === 0)) {
    errors[key] = `${label} must be a ${positive ? 'positive' : 'non-negative'} number.`;
  }
}

function validateCode(key, value, label, errors, required = false) {
  const text = String(value ?? '').trim();
  if (!text) {
    if (required) errors[key] = `${label} is required.`;
    return;
  }
  if (text.length > 30 || !/^[A-Za-z0-9_-]+$/.test(text)) {
    errors[key] = `${label} must be up to 30 letters, numbers, hyphens, or underscores.`;
  }
}

function validateSecurity(values) {
  const errors = {};
  const security = values.security;
  const key = (field) => `security.${field}`;

  validateCode(key('securityId'), security.securityId, 'Security ID', errors, true);
  validateTextLength(key('securityType'), security.securityType, 'Security type', errors);
  validateDate(key('effectiveDate'), security.effectiveDate, 'Effective date', errors, true);
  validateTextLength(key('assetType'), security.assetType, 'Asset type', errors);
  validateNumber(key('securityAmount'), security.securityAmount, 'Security amount', errors, {
    required: true,
    positive: true,
  });
  if (String(security.marginPercent ?? '').trim()) {
    const margin = Number(security.marginPercent);
    if (!Number.isFinite(margin) || margin < 0 || margin > 100) {
      errors[key('marginPercent')] = 'Margin must be between 0 and 100%.';
    }
  }
  validateTextLength(key('address'), security.address, 'Address', errors);
  validateTextLength(key('address1'), security.address1, 'Address 1', errors, false);
  validateTextLength(key('city'), security.city, 'City', errors);
  validateTextLength(key('state'), security.state, 'State', errors);

  if (!/^\d{6}$/.test(String(security.pincode ?? '').trim())) {
    errors[key('pincode')] = 'Enter a valid 6-digit Indian pincode.';
  }

  validateNumber(key('valuationAmount'), security.valuationAmount, 'Valuation amount', errors, {
    required: true,
    positive: true,
  });
  validateName(key('valuerName'), security.valuerName, 'Valuer name', errors);
  validateDate(key('valuationDate'), security.valuationDate, 'Valuation date', errors, true);
  validateName(key('inspectionBy'), security.inspectionBy, 'Inspection by', errors);
  validateDate(key('inspectionDate'), security.inspectionDate, 'Inspection date', errors, true);
  if (security.inspectionReportError) {
    errors[key('inspectionReport')] = security.inspectionReportError;
  }

  if (
    isValidDate(security.effectiveDate)
    && isValidDate(security.valuationDate)
    && security.valuationDate < security.effectiveDate
  ) {
    errors[key('valuationDate')] = 'Valuation date cannot precede the effective date.';
  }
  if (
    isValidDate(security.effectiveDate)
    && isValidDate(security.inspectionDate)
    && security.inspectionDate < security.effectiveDate
  ) {
    errors[key('inspectionDate')] = 'Inspection date cannot precede the effective date.';
  }
  if (
    isValidDate(security.valuationDate)
    && isValidDate(security.inspectionDate)
    && security.inspectionDate < security.valuationDate
  ) {
    errors[key('inspectionDate')] = 'Inspection date cannot precede the valuation date.';
  }

  return errors;
}

function validateStep(stepIndex, values) {
  const errors = {};

  if (stepIndex === 0) {
    validateTextLength('loanAccountNumber', values.loanAccountNumber, 'Loan account number', errors);
    validateDate('effectiveDate', values.effectiveDate, 'Effective date', errors, true);
    validateTextLength('customerId', values.customerId, 'Customer ID', errors);
    if (!String(values.title ?? '').trim()) errors.title = 'Title is required.';
    validateName('firstName', values.firstName, 'First name', errors);
    validateName('middleName', values.middleName, 'Middle name', errors, false);
    validateName('lastName', values.lastName, 'Last name', errors);
    validateTextLength('productCode', values.productCode, 'Product code', errors);
    validateTextLength('productName', values.productName, 'Product name', errors);
    if (!String(values.modeOfOperationYesNo ?? '').trim()) {
      errors.modeOfOperationYesNo = 'Select Yes or No.';
    }
    if (!String(values.modeOfOperation ?? '').trim()) {
      errors.modeOfOperation = 'Mode of operation is required.';
    }
  }

  if (stepIndex === 1) {
    values.relatedParties.forEach((party) => {
      const prefix = `relatedParties.${party.id}.`;
      if (!String(party.nameType ?? '').trim()) errors[`${prefix}nameType`] = 'Name type is required.';
      validateTextLength(`${prefix}customerNo`, party.customerNo, 'Customer number', errors);
      if (!String(party.salutation ?? '').trim()) errors[`${prefix}salutation`] = 'Salutation is required.';
      validateName(`${prefix}firstName`, party.firstName, 'First name', errors);
      validateName(`${prefix}middleName`, party.middleName, 'Middle name', errors, false);
      validateName(`${prefix}lastName`, party.lastName, 'Last name', errors);
    });
  }

  if (stepIndex === 2) {
    validateNumber('loanAmount', values.loanAmount, 'Loan amount', errors, { required: true, positive: true });
    validateNumber('interestRate', values.interestRate, 'Interest rate', errors, { required: true });
    validateNumber('offsetRate', values.offsetRate, 'Offset rate', errors);
    validateNumber('totalInterestRate', values.totalInterestRate, 'Total interest rate', errors, { required: true });
    validateNumber('tenureMonths', values.tenureMonths, 'Tenure', errors, { required: true, positive: true });
    if (String(values.tenureMonths ?? '').trim() && !/^\d+$/.test(values.tenureMonths)) {
      errors.tenureMonths = 'Tenure must be a whole number of months.';
    }
    validateNumber('moratorium', values.moratorium, 'Moratorium', errors);
    validateNumber('instalmentAmount', values.instalmentAmount, 'Instalment amount', errors, {
      required: values.emi === 'Yes',
      positive: Boolean(String(values.instalmentAmount ?? '').trim()) || values.emi === 'Yes',
    });
    validateNumber('bulletPayment', values.bulletPayment, 'Bullet payment', errors, {
      positive: Boolean(String(values.bulletPayment ?? '').trim()),
    });
    if (!String(values.emi ?? '').trim()) errors.emi = 'EMI selection is required.';
    validateDate('sanctionedDate', values.sanctionedDate, 'Sanctioned date', errors, true);
    validateDate('expiryDate', values.expiryDate, 'Expiry date', errors);
    validateDate('instalmentStartDate', values.instalmentStartDate, 'Instalment start date', errors);
    validateDate('instalmentEndDate', values.instalmentEndDate, 'Instalment end date', errors);

    if (
      isValidDate(values.instalmentStartDate)
      && isValidDate(values.instalmentEndDate)
      && values.instalmentEndDate < values.instalmentStartDate
    ) {
      errors.instalmentEndDate = 'Instalment end date cannot precede the start date.';
    }
  }

  if (stepIndex === 3) {
    validateNumber('loanAmount', values.loanAmount, 'Loan amount', errors, {
      required: true,
      positive: true,
    });
    validateNumber('tenureMonths', values.tenureMonths, 'Tenure', errors, {
      required: true,
      positive: true,
    });
    if (String(values.tenureMonths ?? '').trim() && !/^\d+$/.test(values.tenureMonths)) {
      errors.tenureMonths = 'Tenure must be a whole number of months.';
    } else if (Number(values.tenureMonths) > 600) {
      errors.tenureMonths = 'Tenure cannot exceed 600 months.';
    }
    validateDate('instalmentStartDate', values.instalmentStartDate, 'Instalment start date', errors, true);
  }

  if (stepIndex === 4) {
    const basic = values.basicDetails;
    for (const field of ['purposeCode', 'termCode', 'prioritySectorCode', 'industryType', 'industrySubType']) {
      validateCode(
        `basicDetails.${field}`,
        basic[field],
        field.replace(/([A-Z])/g, ' $1').toLowerCase(),
        errors,
      );
    }
    for (const field of ['prioritySector', 'physicallyChallenged']) {
      if (basic[field] && !['Yes', 'No'].includes(basic[field])) {
        errors[`basicDetails.${field}`] = 'Select Yes or No.';
      }
    }
  }

  if (stepIndex === 5) {
    Object.assign(errors, validateSecurity(values));
  }

  return errors;
}

function LoanField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  required = false,
  options,
  placeholder,
  list,
  min,
  max,
  maxLength,
  step,
  readOnly = false,
  strictName = false,
  onInvalidNameInput,
  strictCode = false,
  onInvalidCodeInput,
}) {
  const handleChange = (event) => {
    const nextValue = event.target.value;
    if (strictName && !nameInputPattern.test(nextValue)) {
      onInvalidNameInput?.();
      return;
    }
    if (strictCode && !codeInputPattern.test(nextValue)) {
      onInvalidCodeInput?.();
      return;
    }
    if (maxLength && nextValue.length > maxLength) return;
    onChange(nextValue);
  };

  const handleBeforeInput = (event) => {
    if (
      (!strictName && !strictCode)
      || !event.nativeEvent.inputType?.startsWith('insert')
    ) return;
    const inserted = event.nativeEvent.data;
    if (inserted == null) return;
    const input = event.currentTarget;
    const nextValue = value.slice(0, input.selectionStart)
      + inserted
      + value.slice(input.selectionEnd);
    if (
      strictName
      && (!nameInputPattern.test(nextValue) || nextValue.length > MAX_TEXT_LENGTH)
    ) {
      event.preventDefault();
      onInvalidNameInput?.();
    }
    if (strictCode && !codeInputPattern.test(nextValue)) {
      event.preventDefault();
      onInvalidCodeInput?.();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text');
    const input = event.currentTarget;
    const nextValue = value.slice(0, input.selectionStart)
      + pasted
      + value.slice(input.selectionEnd);
    if (
      strictName
      && (!nameInputPattern.test(nextValue) || nextValue.length > MAX_TEXT_LENGTH)
    ) {
      event.preventDefault();
      onInvalidNameInput?.();
    }
    if (strictCode && !codeInputPattern.test(nextValue)) {
      event.preventDefault();
      onInvalidCodeInput?.();
    }
  };

  return (
    <label className="loan-field" htmlFor={id}>
      <span>{label}{required ? ' *' : ''}</span>
      {options ? (
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
        >
          <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          placeholder={placeholder}
          list={list}
          min={min}
          max={max}
          maxLength={maxLength}
          step={step}
          readOnly={readOnly}
          inputMode={type === 'number' ? 'decimal' : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
        />
      )}
      {error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}
    </label>
  );
}

const titles = ['Mr', 'Ms', 'Mrs', 'Dr', 'Other'].map((value) => ({ value, label: value }));
const nameTypes = ['Co-applicant', 'Guarantor', 'Reference', 'Other'].map((value) => ({ value, label: value }));
const modesOfOperation = [
  'Single',
  'Joint',
  'Either or Survivor',
  'Anyone or Survivor',
  'Former or Survivor',
  'Other',
].map((value) => ({ value, label: value }));
const yesNoOptions = ['Yes', 'No'].map((value) => ({ value, label: value }));

function LoanApplicationFormPage({ onBack }) {
  const router = useRouter();
  const [form, setForm] = useState(createInitialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState('');
  const [partyToDelete, setPartyToDelete] = useState(null);
  const [showFrontendSuccess, setShowFrontendSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');
  const nextPartyId = useRef(0);
  const cancelDeleteButtonRef = useRef(null);
  const confirmDeleteButtonRef = useRef(null);
  const inspectionFileRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      let accessToken;
      try {
        const authData = JSON.parse(window.localStorage.getItem('authData') || '{}');
        accessToken = authData.accessToken;
      } catch {
        setProductsError('Product suggestions could not be loaded. You can enter product details manually.');
        return;
      }

      try {
        const result = await getLoanProducts(controller.signal, accessToken);
        if (!controller.signal.aborted) setProducts(Array.isArray(result) ? result : []);
      } catch {
        if (!controller.signal.aborted) {
          setProductsError('Product suggestions could not be loaded. You can enter product details manually.');
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!partyToDelete) return undefined;
    cancelDeleteButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPartyToDelete(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [partyToDelete]);

  const updateForm = (nextForm) => {
    setForm(nextForm);
    setIsFormDirty(true);
    setShowFrontendSuccess(false);
    setSecurityMessage('');
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validateStep(currentStep, nextForm));
    }
  };

  const updateField = (field, value) => {
    const nextForm = { ...form, [field]: value };
    if (field === 'interestRate' || field === 'offsetRate') {
      const interest = Number(nextForm.interestRate || 0);
      const offset = Number(nextForm.offsetRate || 0);
      nextForm.totalInterestRate = (nextForm.interestRate !== '' || nextForm.offsetRate !== '')
        ? String(Math.max(0, interest + offset))
        : '';
    }
    updateForm(nextForm);
  };

  const updateParty = (partyId, field, value) => {
    updateForm({
      ...form,
      relatedParties: form.relatedParties.map((party) => (
        party.id === partyId ? { ...party, [field]: value } : party
      )),
    });
  };

  const addRelatedParty = () => {
    nextPartyId.current += 1;
    updateForm({
      ...form,
      relatedParties: [
        ...form.relatedParties,
        {
          id: `party-${nextPartyId.current}`,
          nameType: '',
          customerNo: '',
          salutation: '',
          firstName: '',
          middleName: '',
          lastName: '',
        },
      ],
    });
  };

  const removeRelatedParty = (partyId) => {
    updateForm({
      ...form,
      relatedParties: form.relatedParties.filter((party) => party.id !== partyId),
    });
  };

  const confirmRemoveRelatedParty = () => {
    if (!partyToDelete) return;
    removeRelatedParty(partyToDelete);
    setPartyToDelete(null);
  };

  const trapDeleteDialogFocus = (event) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === cancelDeleteButtonRef.current) {
      event.preventDefault();
      confirmDeleteButtonRef.current?.focus();
    } else if (!event.shiftKey && document.activeElement === confirmDeleteButtonRef.current) {
      event.preventDefault();
      cancelDeleteButtonRef.current?.focus();
    }
  };

  const goToNextStep = () => {
    const errors = validateStep(currentStep, form);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
      setShowFrontendSuccess(false);
      setSecurityMessage('');
    }
  };

  const goToPreviousStep = () => {
    setValidationErrors({});
    setCurrentStep((step) => Math.max(step - 1, 0));
    setShowFrontendSuccess(false);
  };

  const handleCancel = () => handleReturnToDashboard();

  const handleSubmit = (event) => {
    event.preventDefault();
    const allErrors = steps.reduce((errors, _, index) => (
      index <= 5 ? { ...errors, ...validateStep(index, form) } : errors
    ), {});
    setValidationErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const invalidStep = steps.findIndex((_, index) => (
        index <= 5 && Object.keys(validateStep(index, form)).length > 0
      ));
      setCurrentStep(invalidStep >= 0 ? invalidStep : 0);
      return;
    }

    // Frontend-only confirmation: no backend endpoint is called and nothing is persisted.
    setShowFrontendSuccess(true);
    setIsSubmitting(false);
  };

  const selectProduct = (name) => {
    const matchedProduct = products.find(
      (product) => String(product.name ?? '').toLowerCase() === name.trim().toLowerCase(),
    );
    updateForm({
      ...form,
      productName: name,
      ...(matchedProduct ? { productCode: String(matchedProduct.id ?? '') } : {}),
    });
  };

  const relatedPartyError = (party, field) => (
    validationErrors[`relatedParties.${party.id}.${field}`]
  );

  const invalidNameInput = (field) => {
    setValidationErrors((errors) => ({ ...errors, [field]: nameError }));
  };

  const invalidCodeInput = (field) => {
    setValidationErrors((errors) => ({
      ...errors,
      [field]: 'Use letters, numbers, hyphens, and underscores only.',
    }));
  };

  const repaymentSchedule = useMemo(() => {
    const principal = Number(form.loanAmount);
    const months = Number(form.tenureMonths);
    const annualRate = Number(
      form.totalInterestRate || form.interestRate || 0,
    );
    const enteredPayment = Number(form.instalmentAmount);

    if (
      !Number.isFinite(principal)
      || principal <= 0
      || !Number.isInteger(months)
      || months <= 0
      || months > 600
      || !Number.isFinite(annualRate)
      || annualRate < 0
    ) {
      return { rows: [], warning: '', payment: 0, annualRate: null };
    }

    const monthlyRate = annualRate / 1200;
    const calculatedPayment = monthlyRate === 0
      ? principal / months
      : principal * monthlyRate / (1 - ((1 + monthlyRate) ** -months));
    const payment = enteredPayment > 0 ? enteredPayment : calculatedPayment;

    if (!Number.isFinite(payment) || payment <= 0) {
      return { rows: [], warning: '', payment: 0, annualRate };
    }

    if (monthlyRate > 0 && payment <= principal * monthlyRate) {
      return {
        rows: [],
        warning: 'The entered instalment does not cover monthly interest. Increase it to produce an amortizing schedule.',
        payment,
        annualRate,
      };
    }

    let balance = principal;
    const rows = [];
    for (let month = 1; month <= months && balance > 0; month += 1) {
      const openingPrincipal = balance;
      const interest = Math.round(openingPrincipal * monthlyRate * 100) / 100;
      const instalment = Math.min(payment, openingPrincipal + interest);
      const principalPaid = Math.min(openingPrincipal, Math.max(0, instalment - interest));
      balance = Math.max(0, Math.round((openingPrincipal - principalPaid) * 100) / 100);
      rows.push({
        month,
        openingPrincipal,
        instalment,
        interest,
        principalPaid,
        balance,
      });
    }

    return { rows, warning: '', payment, annualRate };
  }, [
    form.instalmentAmount,
    form.interestRate,
    form.loanAmount,
    form.tenureMonths,
    form.totalInterestRate,
  ]);

  const updateSectionField = (section, field, value) => {
    const nextForm = {
      ...form,
      [section]: { ...form[section], [field]: value },
    };
    setForm(nextForm);
    setIsFormDirty(true);
    setSecurityMessage('');
    setShowFrontendSuccess(false);
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validateStep(currentStep, nextForm));
    }
  };

  const navigateToStep = (targetStep) => {
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep);
      setValidationErrors({});
      setShowFrontendSuccess(false);
      return;
    }

    for (let stepIndex = currentStep; stepIndex < targetStep; stepIndex += 1) {
      const errors = validateStep(stepIndex, form);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setCurrentStep(stepIndex);
        setShowFrontendSuccess(false);
        return;
      }
    }

    setCurrentStep(targetStep);
    setValidationErrors({});
    setShowFrontendSuccess(false);
  };

  const handleReturnToDashboard = () => {
    if (
      isFormDirty
      && !window.confirm('Return to the Loan Dashboard and discard this application?')
    ) {
      return;
    }

    if (typeof onBack === 'function') {
      onBack();
    } else {
      router.push('/loan_application');
    }
  };

  const handleSecurityFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      setForm((previous) => ({
        ...previous,
        security: {
          ...previous.security,
          inspectionReportError: 'Choose a PDF, JPG, JPEG, or PNG file.',
        },
      }));
      setIsFormDirty(true);
      setValidationErrors((errors) => ({
        ...errors,
        'security.inspectionReport': 'Choose a PDF, JPG, JPEG, or PNG file.',
      }));
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setForm((previous) => ({
        ...previous,
        security: {
          ...previous.security,
          inspectionReportError: 'The report must be 5 MB or smaller.',
        },
      }));
      setIsFormDirty(true);
      setValidationErrors((errors) => ({
        ...errors,
        'security.inspectionReport': 'The report must be 5 MB or smaller.',
      }));
      event.target.value = '';
      return;
    }

    setForm((previous) => ({
      ...previous,
      security: {
        ...previous.security,
        inspectionReport: file,
        inspectionReportError: '',
      },
    }));
    setIsFormDirty(true);
    setSecurityMessage('');
    setShowFrontendSuccess(false);
    setValidationErrors((errors) => {
      const nextErrors = { ...errors };
      delete nextErrors['security.inspectionReport'];
      return nextErrors;
    });
    event.target.value = '';
  };

  const handleSecuritySubmit = () => {
    const errors = validateSecurity(form);
    setValidationErrors((previous) => ({
      ...Object.fromEntries(
        Object.entries(previous).filter(([key]) => !key.startsWith('security.')),
      ),
      ...errors,
    }));
    setSecurityMessage(
      Object.keys(errors).length === 0
        ? 'Security details are valid. They have not been saved to a backend.'
        : 'Please correct the highlighted security details.',
    );
  };

  const handleSecurityClear = () => {
    const hasSecurityData = Object.values(form.security).some(
      (value) => value instanceof File || String(value ?? '').trim() !== '',
    );
    if (
      hasSecurityData
      && !window.confirm('Clear all entered Security Details?')
    ) {
      return;
    }

    setForm((previous) => ({ ...previous, security: createInitialForm().security }));
    setIsFormDirty(true);
    setValidationErrors((previous) => Object.fromEntries(
      Object.entries(previous).filter(([key]) => !key.startsWith('security.')),
    ));
    setSecurityMessage('');
    if (inspectionFileRef.current) inspectionFileRef.current.value = '';
  };

  return (
    <AppShell>
      <div className="loan-application-shell">
        <PageHeader
          // eyebrow="LOAN OPERATIONS"
          title="Loan Application"
          // description="Capture borrower, related-party, security, and repayment details."
          action={
            <button
              className="icon-button loan-dashboard-back"
              type="button"
              onClick={handleReturnToDashboard}
              aria-label="Back to Loan Dashboard"
              title="Back to Loan Dashboard"
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
          }
        />

        <Card className="loan-application-card">
          <div className="loan-form-layout">
            <nav className="loan-form-nav" aria-label="Loan application sections">
              {steps.map((label, index) => {
                const isCurrent = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <button
                    className={`loan-form-nav-item ${isCurrent ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                    key={label}
                    type="button"
                    onClick={() => navigateToStep(index)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${index + 1}: ${label}${isComplete ? ', completed' : ''}`}
                  >
                    <span className="loan-form-nav-number">
                      {isComplete ? <Check size={13} aria-hidden="true" /> : index + 1}
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="loan-form-panel">

          {productsError && (
            <div className="bank-master-alert" role="status">
              <span>{productsError}</span>
            </div>
          )}
          {showFrontendSuccess && (
            <div className="bank-master-alert" role="status">
              <Check size={17} aria-hidden="true" />
              <span>All fields are valid. This is a frontend preview; no data has been saved.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {currentStep === 0 && (
              <div className="loan-form-section">
                <h2>Borrower Details</h2>

                <div className="loan-form-section-inner">
                  <h3>Application information</h3>
                  <div className="loan-form-grid">
                    <LoanField
                      id="loanAccountNumber"
                      label="Loan Account Number"
                      value={form.loanAccountNumber}
                      onChange={(value) => updateField('loanAccountNumber', value)}
                      error={validationErrors.loanAccountNumber}
                      min={MIN_TEXT_LENGTH}
                      maxLength={MAX_TEXT_LENGTH}
                      required
                    />
                    <LoanField
                      id="effectiveDate"
                      label="Effective Date"
                      type="date"
                      value={form.effectiveDate}
                      onChange={(value) => updateField('effectiveDate', value)}
                      error={validationErrors.effectiveDate}
                      required
                    />
                    <LoanField
                      id="customerId"
                      label="Customer ID"
                      value={form.customerId}
                      onChange={(value) => updateField('customerId', value)}
                      error={validationErrors.customerId}
                      min={MIN_TEXT_LENGTH}
                      maxLength={MAX_TEXT_LENGTH}
                      required
                    />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3 className="borrower-information-heading">Borrower Information</h3>
                  <div className="loan-form-grid borrower-information-grid">
                    <LoanField
                      id="title"
                      label="Title"
                      value={form.title}
                      onChange={(value) => updateField('title', value)}
                      options={titles}
                      error={validationErrors.title}
                      required
                    />
                    <LoanField
                      id="firstName"
                      label="First Name"
                      value={form.firstName}
                      onChange={(value) => updateField('firstName', value)}
                      error={validationErrors.firstName}
                      strictName
                      maxLength={MAX_TEXT_LENGTH}
                      onInvalidNameInput={() => invalidNameInput('firstName')}
                      required
                    />
                    <LoanField
                      id="middleName"
                      label="Middle Name"
                      value={form.middleName}
                      onChange={(value) => updateField('middleName', value)}
                      error={validationErrors.middleName}
                      strictName
                      maxLength={MAX_TEXT_LENGTH}
                      onInvalidNameInput={() => invalidNameInput('middleName')}
                    />
                    <LoanField
                      id="lastName"
                      label="Last Name"
                      value={form.lastName}
                      onChange={(value) => updateField('lastName', value)}
                      error={validationErrors.lastName}
                      strictName
                      maxLength={MAX_TEXT_LENGTH}
                      onInvalidNameInput={() => invalidNameInput('lastName')}
                      required
                    />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3>Loan / product information</h3>
                  <div className="loan-form-grid">
                    <LoanField
                      id="productCode"
                      label="Product Code"
                      value={form.productCode}
                      onChange={(value) => updateField('productCode', value)}
                      error={validationErrors.productCode}
                      min={MIN_TEXT_LENGTH}
                      maxLength={MAX_TEXT_LENGTH}
                      required
                    />
                    <LoanField
                      id="productName"
                      label="Product Name"
                      value={form.productName}
                      onChange={selectProduct}
                      error={validationErrors.productName}
                      list="loan-product-options"
                      maxLength={MAX_TEXT_LENGTH}
                      required
                    />
                    <LoanField
                      id="modeOfOperationYesNo"
                      label="Mode of Operation (Yes/No)"
                      value={form.modeOfOperationYesNo}
                      onChange={(value) => updateField('modeOfOperationYesNo', value)}
                      options={yesNoOptions}
                      error={validationErrors.modeOfOperationYesNo}
                      required
                    />
                    <LoanField
                      id="modeOfOperation"
                      label="Mode of Operation"
                      value={form.modeOfOperation}
                      onChange={(value) => updateField('modeOfOperation', value)}
                      options={modesOfOperation}
                      error={validationErrors.modeOfOperation}
                      required
                    />
                  </div>
                  <datalist id="loan-product-options">
                    {products.map((product) => (
                      <option key={String(product.id)} value={product.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="loan-form-section">
                <div className="panel-heading">
                  <div>
                    <h2>Related Party</h2>
                    <p>Add co-applicants, guarantors, or other parties associated with this application.</p>
                  </div>
                  <button className="secondary-button" type="button" onClick={addRelatedParty}>
                    <Plus size={16} aria-hidden="true" />
                    Add Related Party
                  </button>
                </div>

                {form.relatedParties.length === 0 ? (
                  <div className="bank-master-empty" style={{ minHeight: 180, flexDirection: 'column' }}>
                    <p>No related parties added.</p>
                    <span>Add a related party if one is associated with this application. This step can be left empty.</span>
                  </div>
                ) : (
                  <div className="loan-data-table-wrap" style={{ overflowX: 'auto' }}>
                    <table className="loan-data-table" style={{ minWidth: 1040 }}>
                      <thead>
                        <tr>
                          <th scope="col">Sr. No.</th>
                          <th scope="col">Name Type</th>
                          <th scope="col">Customer No.</th>
                          <th scope="col">Salutation</th>
                          <th scope="col">First Name</th>
                          <th scope="col">Middle Name</th>
                          <th scope="col">Last Name</th>
                          <th scope="col" aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.relatedParties.map((party, index) => (
                          <tr key={party.id}>
                            <td>{index + 1}</td>
                            <td>
                              <LoanField
                                id={`${party.id}-nameType`}
                                label="Name Type"
                                value={party.nameType}
                                onChange={(value) => updateParty(party.id, 'nameType', value)}
                                options={nameTypes}
                                error={relatedPartyError(party, 'nameType')}
                                required
                              />
                            </td>
                            <td>
                              <LoanField
                                id={`${party.id}-customerNo`}
                                label="Customer No."
                                value={party.customerNo}
                                onChange={(value) => updateParty(party.id, 'customerNo', value)}
                                error={relatedPartyError(party, 'customerNo')}
                                maxLength={MAX_TEXT_LENGTH}
                                required
                              />
                            </td>
                            <td>
                              <LoanField
                                id={`${party.id}-salutation`}
                                label="Salutation"
                                value={party.salutation}
                                onChange={(value) => updateParty(party.id, 'salutation', value)}
                                options={titles}
                                error={relatedPartyError(party, 'salutation')}
                                required
                              />
                            </td>
                            <td>
                              <LoanField
                                id={`${party.id}-firstName`}
                                label="First Name"
                                value={party.firstName}
                                onChange={(value) => updateParty(party.id, 'firstName', value)}
                                error={relatedPartyError(party, 'firstName')}
                                strictName
                                maxLength={MAX_TEXT_LENGTH}
                                onInvalidNameInput={() => invalidNameInput(`relatedParties.${party.id}.firstName`)}
                                required
                              />
                            </td>
                            <td>
                              <LoanField
                                id={`${party.id}-middleName`}
                                label="Middle Name"
                                value={party.middleName}
                                onChange={(value) => updateParty(party.id, 'middleName', value)}
                                error={relatedPartyError(party, 'middleName')}
                                strictName
                                maxLength={MAX_TEXT_LENGTH}
                                onInvalidNameInput={() => invalidNameInput(`relatedParties.${party.id}.middleName`)}
                              />
                            </td>
                            <td>
                              <LoanField
                                id={`${party.id}-lastName`}
                                label="Last Name"
                                value={party.lastName}
                                onChange={(value) => updateParty(party.id, 'lastName', value)}
                                error={relatedPartyError(party, 'lastName')}
                                strictName
                                maxLength={MAX_TEXT_LENGTH}
                                onInvalidNameInput={() => invalidNameInput(`relatedParties.${party.id}.lastName`)}
                                required
                              />
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => setPartyToDelete(party.id)}
                                aria-label={`Remove related party ${index + 1}`}
                                title="Remove related party"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="loan-form-section">
                <h2>Loan Details</h2>
                <div className="loan-form-section-inner">
                  <h3>Loan and interest details</h3>
                  <div className="loan-form-grid">
                    <LoanField id="loanAmount" label="Loan Amount" type="number" min="0" step="any" value={form.loanAmount} onChange={(value) => updateField('loanAmount', value)} error={validationErrors.loanAmount} required />
                    <LoanField id="interestRate" label="Interest Rate (%)" type="number" min="0" step="any" value={form.interestRate} onChange={(value) => updateField('interestRate', value)} error={validationErrors.interestRate} required />
                    <LoanField id="offsetRate" label="Offset Rate (%)" type="number" min="0" step="any" value={form.offsetRate} onChange={(value) => updateField('offsetRate', value)} error={validationErrors.offsetRate} />
                    <LoanField id="moratorium" label="Moratorium (Months)" type="number" min="0" step="1" value={form.moratorium} onChange={(value) => updateField('moratorium', value)} error={validationErrors.moratorium} />
                    <LoanField id="expiryDate" label="Expiry Date" type="date" value={form.expiryDate} onChange={(value) => updateField('expiryDate', value)} error={validationErrors.expiryDate} />
                    <LoanField id="instalmentAmount" label="Instalment Amount" type="number" min="0" step="any" value={form.instalmentAmount} onChange={(value) => updateField('instalmentAmount', value)} error={validationErrors.instalmentAmount} required={form.emi === 'Yes'} />
                    <LoanField id="instalmentStartDate" label="Instalment Start Date" type="date" value={form.instalmentStartDate} onChange={(value) => updateField('instalmentStartDate', value)} error={validationErrors.instalmentStartDate} />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3>Tenure and repayment details</h3>
                  <div className="loan-form-grid">
                    <LoanField id="tenureMonths" label="Tenure (Months)" type="number" min="1" step="1" value={form.tenureMonths} onChange={(value) => updateField('tenureMonths', value)} error={validationErrors.tenureMonths} required />
                    <LoanField id="totalInterestRate" label="Total Interest Rate (%)" type="number" min="0" step="any" value={form.totalInterestRate} onChange={(value) => updateField('totalInterestRate', value)} error={validationErrors.totalInterestRate} readOnly required />
                    <LoanField id="sanctionedDate" label="Sanctioned Date" type="date" value={form.sanctionedDate} onChange={(value) => updateField('sanctionedDate', value)} error={validationErrors.sanctionedDate} required />
                    <LoanField id="emi" label="EMI" value={form.emi} onChange={(value) => updateField('emi', value)} options={yesNoOptions} error={validationErrors.emi} required />
                    <LoanField id="bulletPayment" label="Bullet Payment" type="number" min="0" step="any" value={form.bulletPayment} onChange={(value) => updateField('bulletPayment', value)} error={validationErrors.bulletPayment} />
                    <LoanField id="instalmentEndDate" label="Instalment End Date" type="date" value={form.instalmentEndDate} onChange={(value) => updateField('instalmentEndDate', value)} error={validationErrors.instalmentEndDate} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="loan-form-section">
                <h2>Repayment Chart</h2>
                <div className="loan-form-section-inner">
                  <h3>Repayment details</h3>
                  <div className="loan-form-grid">
                    <LoanField
                      id="repaymentLoanAmount"
                      label="Loan Amount (Rs.)"
                      type="number"
                      min="0"
                      step="any"
                      value={form.loanAmount}
                      onChange={(value) => updateField('loanAmount', value)}
                      error={validationErrors.loanAmount}
                      required
                    />
                    <LoanField
                      id="repaymentTenure"
                      label="Tenure (months)"
                      type="number"
                      min="1"
                      step="1"
                      value={form.tenureMonths}
                      onChange={(value) => updateField('tenureMonths', value)}
                      error={validationErrors.tenureMonths}
                      required
                    />
                    <LoanField
                      id="repaymentStartDate"
                      label="Instalment Start Date"
                      type="date"
                      value={form.instalmentStartDate}
                      onChange={(value) => updateField('instalmentStartDate', value)}
                      error={validationErrors.instalmentStartDate}
                      required
                    />
                  </div>
                  <p className="repayment-assumption">
                    Schedule assumes monthly instalments and a fixed annual rate
                    of {Number.isFinite(repaymentSchedule.annualRate)
                      ? `${repaymentSchedule.annualRate}%`
                      : '0%'}.
                    {form.instalmentAmount
                      ? ' The instalment amount entered in Loan Details is used.'
                      : ' Otherwise, instalments are calculated using a standard reducing-balance EMI.'}
                  </p>
                </div>

                {repaymentSchedule.warning && (
                  <div className="loan-form-warning" role="alert">
                    {repaymentSchedule.warning}
                  </div>
                )}
                {repaymentSchedule.rows.length > 0 ? (
                  <div className="repayment-table-scroll">
                    <table className="loan-data-table repayment-table">
                      <thead>
                        <tr>
                          <th scope="col">Month</th>
                          <th scope="col">Principal Amount (Rs.)</th>
                          <th scope="col">Instalment Amt (Rs.)</th>
                          <th scope="col">Interest (Rs.)</th>
                          <th scope="col">Principal (Rs.)</th>
                          <th scope="col">Balance Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {repaymentSchedule.rows.map((row) => (
                          <tr key={row.month}>
                            <td>{row.month}</td>
                            <td>{currencyFormatter.format(row.openingPrincipal)}</td>
                            <td>{currencyFormatter.format(row.instalment)}</td>
                            <td>{currencyFormatter.format(row.interest)}</td>
                            <td>{currencyFormatter.format(row.principalPaid)}</td>
                            <td>{currencyFormatter.format(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !repaymentSchedule.warning && (
                    <div className="bank-master-empty repayment-empty" role="status">
                      Enter a valid loan amount, tenure, interest rate, and start
                      date to preview the repayment schedule.
                    </div>
                  )
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="loan-form-section">
                <h2>Basic Details</h2>
                <div className="loan-form-section-inner">
                  <p className="section-help">
                    Enter available classification details. Code values are
                    accepted as manual entries because no related master options
                    are configured in the project.
                  </p>
                  <div className="loan-form-grid">
                    <LoanField
                      id="purposeCode"
                      label="Purpose Code"
                      value={form.basicDetails.purposeCode}
                      onChange={(value) => updateSectionField('basicDetails', 'purposeCode', value)}
                      error={validationErrors['basicDetails.purposeCode']}
                      maxLength={30}
                      strictCode
                      onInvalidCodeInput={() => invalidCodeInput('basicDetails.purposeCode')}
                    />
                    <LoanField
                      id="termCode"
                      label="Term Code"
                      value={form.basicDetails.termCode}
                      onChange={(value) => updateSectionField('basicDetails', 'termCode', value)}
                      error={validationErrors['basicDetails.termCode']}
                      maxLength={30}
                      strictCode
                      onInvalidCodeInput={() => invalidCodeInput('basicDetails.termCode')}
                    />
                    <LoanField
                      id="prioritySector"
                      label="Priority Sector (Y/N)"
                      value={form.basicDetails.prioritySector}
                      onChange={(value) => updateSectionField('basicDetails', 'prioritySector', value)}
                      options={yesNoOptions}
                      error={validationErrors['basicDetails.prioritySector']}
                    />
                    <LoanField
                      id="prioritySectorCode"
                      label="Priority Sector Code"
                      value={form.basicDetails.prioritySectorCode}
                      onChange={(value) => updateSectionField('basicDetails', 'prioritySectorCode', value)}
                      error={validationErrors['basicDetails.prioritySectorCode']}
                      maxLength={30}
                      strictCode
                      onInvalidCodeInput={() => invalidCodeInput('basicDetails.prioritySectorCode')}
                    />
                    <LoanField
                      id="industryType"
                      label="Industry Type"
                      value={form.basicDetails.industryType}
                      onChange={(value) => updateSectionField('basicDetails', 'industryType', value)}
                      error={validationErrors['basicDetails.industryType']}
                      maxLength={30}
                      strictCode
                      onInvalidCodeInput={() => invalidCodeInput('basicDetails.industryType')}
                    />
                    <LoanField
                      id="industrySubType"
                      label="Industry Sub Type"
                      value={form.basicDetails.industrySubType}
                      onChange={(value) => updateSectionField('basicDetails', 'industrySubType', value)}
                      error={validationErrors['basicDetails.industrySubType']}
                      maxLength={30}
                      strictCode
                      onInvalidCodeInput={() => invalidCodeInput('basicDetails.industrySubType')}
                    />
                    <LoanField
                      id="physicallyChallenged"
                      label="Physically Challenged"
                      value={form.basicDetails.physicallyChallenged}
                      onChange={(value) => updateSectionField('basicDetails', 'physicallyChallenged', value)}
                      options={yesNoOptions}
                      error={validationErrors['basicDetails.physicallyChallenged']}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="loan-form-section">
                <h2>Security Details</h2>
                <div className="loan-form-section-inner">
                  <h3>Security information</h3>
                  <div className="loan-form-grid">
                    <LoanField id="securityId" label="Security ID" value={form.security.securityId} onChange={(value) => updateSectionField('security', 'securityId', value)} error={validationErrors['security.securityId']} maxLength={30} strictCode onInvalidCodeInput={() => invalidCodeInput('security.securityId')} required />
                    <LoanField id="securityType" label="Security Type" value={form.security.securityType} onChange={(value) => updateSectionField('security', 'securityType', value)} error={validationErrors['security.securityType']} maxLength={MAX_TEXT_LENGTH} required />
                    <LoanField id="securityEffectiveDate" label="Effective Date" type="date" value={form.security.effectiveDate} onChange={(value) => updateSectionField('security', 'effectiveDate', value)} error={validationErrors['security.effectiveDate']} required />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3>Asset details</h3>
                  <div className="loan-form-grid">
                    <LoanField id="assetType" label="Asset Type" value={form.security.assetType} onChange={(value) => updateSectionField('security', 'assetType', value)} error={validationErrors['security.assetType']} maxLength={MAX_TEXT_LENGTH} required />
                    <LoanField id="securityAmount" label="Security Amount (Rs.)" type="number" min="0" step="any" value={form.security.securityAmount} onChange={(value) => updateSectionField('security', 'securityAmount', value)} error={validationErrors['security.securityAmount']} required />
                    <LoanField id="marginPercent" label="Margin (%)" type="number" min="0" max="100" step="any" value={form.security.marginPercent} onChange={(value) => updateSectionField('security', 'marginPercent', value)} error={validationErrors['security.marginPercent']} />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3>Asset location</h3>
                  <div className="loan-form-grid">
                    <LoanField id="securityAddress" label="Address" value={form.security.address} onChange={(value) => updateSectionField('security', 'address', value)} error={validationErrors['security.address']} maxLength={MAX_TEXT_LENGTH} required />
                    <LoanField id="securityAddress1" label="Address 1" value={form.security.address1} onChange={(value) => updateSectionField('security', 'address1', value)} error={validationErrors['security.address1']} maxLength={MAX_TEXT_LENGTH} />
                    <LoanField id="securityCity" label="City" value={form.security.city} onChange={(value) => updateSectionField('security', 'city', value)} error={validationErrors['security.city']} maxLength={MAX_TEXT_LENGTH} required />
                    <LoanField id="securityState" label="State" value={form.security.state} onChange={(value) => updateSectionField('security', 'state', value)} error={validationErrors['security.state']} maxLength={MAX_TEXT_LENGTH} required />
                    <LoanField id="securityPincode" label="Pincode" value={form.security.pincode} onChange={(value) => updateSectionField('security', 'pincode', value.replace(/\D/g, '').slice(0, 6))} error={validationErrors['security.pincode']} maxLength={6} required />
                  </div>
                </div>

                <div className="loan-form-section-inner">
                  <h3>Valuation and inspection</h3>
                  <div className="loan-form-grid">
                    <LoanField id="valuationAmount" label="Valuation Amount (Rs.)" type="number" min="0" step="any" value={form.security.valuationAmount} onChange={(value) => updateSectionField('security', 'valuationAmount', value)} error={validationErrors['security.valuationAmount']} required />
                    <LoanField id="valuerName" label="Valuer Name" value={form.security.valuerName} onChange={(value) => updateSectionField('security', 'valuerName', value)} error={validationErrors['security.valuerName']} strictName maxLength={MAX_TEXT_LENGTH} onInvalidNameInput={() => invalidNameInput('security.valuerName')} required />
                    <LoanField id="valuationDate" label="Valuation Done On" type="date" value={form.security.valuationDate} onChange={(value) => updateSectionField('security', 'valuationDate', value)} error={validationErrors['security.valuationDate']} required />
                    <LoanField id="inspectionBy" label="Inspection By" value={form.security.inspectionBy} onChange={(value) => updateSectionField('security', 'inspectionBy', value)} error={validationErrors['security.inspectionBy']} strictName maxLength={MAX_TEXT_LENGTH} onInvalidNameInput={() => invalidNameInput('security.inspectionBy')} required />
                    <LoanField id="inspectionDate" label="Inspection Done On" type="date" value={form.security.inspectionDate} onChange={(value) => updateSectionField('security', 'inspectionDate', value)} error={validationErrors['security.inspectionDate']} required />
                    <label className="loan-field" htmlFor="inspectionReport">
                      <span>Inspection Report</span>
                      <span className="security-file-control">
                        <UploadCloud size={16} aria-hidden="true" />
                        <span>
                          {form.security.inspectionReport?.name || 'Choose a report'}
                        </span>
                        <input
                          ref={inspectionFileRef}
                          id="inspectionReport"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          onChange={handleSecurityFileChange}
                        />
                      </span>
                      {validationErrors['security.inspectionReport'] && (
                        <span className="field-error" role="alert">
                          {validationErrors['security.inspectionReport']}
                        </span>
                      )}
                      <span className="security-file-help">
                        Accepted: PDF, JPG, PNG. Maximum size: 5 MB. File is not
                        uploaded to a server.
                      </span>
                    </label>
                  </div>
                  {securityMessage && (
                    <div className="security-message" role="status">
                      {securityMessage}
                    </div>
                  )}
                  <div className="security-actions">
                    <button className="loan-secondary-btn" type="button" onClick={handleSecurityClear}>
                      Clear
                    </button>
                    <button className="loan-primary-btn" type="button" onClick={handleSecuritySubmit}>
                      Submit Security Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(currentStep === 6 || currentStep === 7) && (
              <div className="loan-form-section">
                <h2>{steps[currentStep]}</h2>
                <div className="bank-master-empty workflow-unavailable" role="status">
                  <strong>{steps[currentStep]} is not configured yet.</strong>
                  <span>
                    This section is shown for workflow navigation only. No fields
                    or save action are available in the current project.
                  </span>
                </div>
              </div>
            )}

            <div className="loan-step-actions">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button className="loan-secondary-btn" type="button" onClick={handleCancel}>Cancel</button>
                {currentStep > 0 && (
                  <button className="loan-secondary-btn" type="button" onClick={goToPreviousStep}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    Previous
                  </button>
                )}
              </div>
              {currentStep < steps.length - 1 ? (
                <button className="loan-primary-btn" type="button" onClick={goToNextStep}>
                  Next <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button className="loan-primary-btn" type="submit" disabled={isSubmitting}>
                  Preview Application <Check size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
            </div>
          </div>
        </Card>

        {partyToDelete && (
          <div className="loan-delete-overlay" role="presentation">
            <section
              className="loan-delete-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="loan-delete-title"
              aria-describedby="loan-delete-message"
              onKeyDown={trapDeleteDialogFocus}
            >
              <h2 id="loan-delete-title">Delete related party</h2>
              <p id="loan-delete-message">Are you sure you want to delete this related party?</p>
              <div className="loan-delete-actions">
                <button
                  ref={cancelDeleteButtonRef}
                  className="loan-delete-cancel"
                  type="button"
                  onClick={() => setPartyToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  ref={confirmDeleteButtonRef}
                  className="loan-delete-confirm"
                  type="button"
                  onClick={confirmRemoveRelatedParty}
                >
                  Delete
                </button>
              </div>
            </section>
          </div>
        )}
        <style jsx>{`
          .loan-application-shell {
            min-width: 0;
          }

          :global(.loan-dashboard-back) {
            width: 40px;
            height: 40px;
            border: 1px solid #dfe8e8;
            background: #fff;
          }

          :global(.loan-dashboard-back:hover) {
            border-color: #b8d4cf;
          }

          :global(.loan-application-card) {
            padding: 20px;
          }

          .loan-form-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 20px;
            min-height: 600px;
          }

          /* Keep all eight application sections in one horizontal navigation row. */
          .loan-form-nav {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 7px;
            width: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 0 0 12px;
            border-right: 0;
            border-bottom: 1px solid #e5ecec;
            scrollbar-width: thin;
          }

          .loan-form-nav-item {
            min-height: 42px;
            display: inline-flex;
            flex: 0 0 auto;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            padding: 7px 10px;
            border: 1px solid transparent;
            border-radius: 7px;
            color: #60747a;
            font-size: 12px;
            font-weight: 600;
            text-align: left;
          }

          .loan-form-nav-item:hover {
            background: #f6faf9;
          }

          .loan-form-nav-item.active {
            border-color: #cfe1df;
            color: #165f5c;
            background: #edf6f4;
          }

          .loan-form-nav-item.complete {
            color: #247b67;
          }

          .loan-form-nav-number {
            width: 26px;
            height: 26px;
            display: grid;
            flex: 0 0 26px;
            place-items: center;
            border: 1px solid #d7e2e3;
            border-radius: 50%;
            color: #657b81;
            background: #fff;
            font-size: 11px;
          }

          .loan-form-nav-item.active .loan-form-nav-number {
            border-color: #177e7a;
            color: #fff;
            background: #177e7a;
          }

          .loan-form-nav-item.complete .loan-form-nav-number {
            border-color: #b8dfd3;
            color: #26795f;
            background: #e5f5ef;
          }

          .loan-form-panel {
            min-width: 0;
          }

          .borrower-information-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            align-items: start;
            gap: 14px;
          }

          .borrower-information-grid > * {
            min-width: 0;
          }

          .loan-data-table-wrap {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
          }

          .loan-data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .repayment-assumption,
          .section-help {
            margin: 12px 0 0;
            color: #708087;
            font-size: 12px;
            line-height: 1.55;
          }

          .repayment-table-scroll {
            overflow-x: auto;
            margin-top: 18px;
            border: 1px solid #dfe8eb;
            border-radius: 7px;
          }

          .repayment-table {
            min-width: 850px;
          }

          .repayment-empty {
            min-height: 140px;
            margin-top: 18px;
          }

          .security-file-control {
            position: relative;
            width: 100%;
            min-height: 42px;
            display: flex;
            align-items: center;
            gap: 8px;
            overflow: hidden;
            padding: 0 11px;
            border: 1px solid #dfe8eb;
            border-radius: 8px;
            color: #35535d;
            background: #f7fafb;
            font-size: 12px;
            font-weight: 500;
          }

          .security-file-control > span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .security-file-control input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            opacity: 0;
          }

          .security-file-control:focus-within {
            border-color: #177e7a;
            box-shadow: 0 0 0 3px #177e7a1a;
          }

          .security-file-help {
            color: #7c8b8f;
            font-size: 10px;
            font-weight: 400;
            line-height: 1.4;
          }

          .security-message {
            margin-top: 14px;
            padding: 10px 12px;
            border: 1px solid #c9e6d6;
            border-radius: 7px;
            color: #25613d;
            background: #f1fbf5;
            font-size: 12px;
          }

          .security-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 16px;
          }

          .workflow-unavailable {
            min-height: 180px;
            flex-direction: column;
            gap: 8px;
            padding: 24px;
            text-align: center;
          }

          .workflow-unavailable strong {
            color: #395b60;
          }

          .workflow-unavailable span {
            max-width: 460px;
            color: #708087;
            font-size: 12px;
            line-height: 1.5;
          }

          .loan-form-nav-item:focus-visible,
          :global(.loan-dashboard-back:focus-visible) {
            outline: 3px solid #177e7a55;
            outline-offset: 2px;
          }

          @media (max-width: 1000px) {
            .loan-form-layout {
              grid-template-columns: minmax(0, 1fr);
              gap: 18px;
            }

            /* Keep all four borrower-name fields on one row on desktop/tablet. */
            .borrower-information-grid {
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 12px;
            }
          }

          @media (max-width: 720px) {
            :global(.loan-application-card) {
              padding: 16px;
            }

            .loan-form-layout {
              grid-template-columns: 1fr;
              gap: 18px;
              min-height: 0;
            }

            .loan-form-nav {
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
              gap: 5px;
              overflow-x: auto;
              padding: 0 0 12px;
              border-right: 0;
              border-bottom: 1px solid #e5ecec;
            }

            .loan-form-nav-item {
              flex: 0 0 auto;
              min-height: 40px;
              padding: 6px 8px;
              font-size: 10px;
              white-space: nowrap;
            }

            .loan-form-nav-number {
              width: 23px;
              height: 23px;
              flex-basis: 23px;
            }

            .borrower-information-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .security-actions {
              flex-direction: column-reverse;
            }

            .security-actions button {
              width: 100%;
            }
          }

          @media (max-width: 440px) {
            .borrower-information-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </AppShell>
  );
}
