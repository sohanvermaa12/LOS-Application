'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import { api } from '../../services/api';

const pipeline = [
  { label: 'Approved', value: 96, percent: 39, color: 'approved' },
  { label: 'In review', value: 72, percent: 29, color: 'review' },
  { label: 'Awaiting KYC', value: 38, percent: 15, color: 'kyc' },
  { label: 'Returned', value: 24, percent: 10, color: 'returned' },
  { label: 'Draft', value: 18, percent: 7, color: 'draft' },
];

const products = [
  { name: 'Gold loan', share: 34, color: 'gold' },
  { name: 'Home loan', share: 12, color: 'home' },
  { name: 'Personal loan', share: 24, color: 'personal' },
  { name: 'Vehicle loan', share: 8, color: 'vehicle' },
  { name: 'Business loan', share: 18, color: 'business' },
  { name: 'Education loan', share: 4, color: 'education' },
];

const metrics = [
  { label: 'Total applications', value: '248', change: '12.8%' },
  { label: 'Total leads', value: '1,248', change: '9.4%' },
  { label: 'Total customers', value: '856', change: '14.2%' },
  { label: 'Amount disbursed', value: '₹14.8 Cr', change: '18.6%' },
];

function getGreeting(date) {
  const hour = date.getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function getDisplayName(authData) {
  const user = authData?.user ?? authData?.profile ?? authData;
  if (!user || typeof user !== 'object') return '';

  const name =
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    '';

  return typeof name === 'string' ? name.trim() : '';
}

function formatAmount(amount) {
  return typeof amount === 'string' ? amount.replace(/^INR\s*/i, '₹') : amount;
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Good day');
  const [userName, setUserName] = useState('User');
  const [today, setToday] = useState('');

  useEffect(() => {
    const now = new Date();
    const storedAuthData = window.localStorage.getItem('authData');

    if (storedAuthData) {
      try {
        const name = getDisplayName(JSON.parse(storedAuthData));
        if (name) setUserName(name);
      } catch {
        window.localStorage.removeItem('authData');
      }
    }

    setGreeting(getGreeting(now));
    setToday(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    );
  }, []);

  const recentApplications = api.applications.slice(0, 4);
  const topBranches = [...api.branches]
    .sort((first, second) => second.applications - first.applications)
    .slice(0, 5);

  return (
    <AppShell title="Overview">
      <main className="dashboard-page">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
        />
        <header className="dashboard-heading">
          <div>
            <p className="dashboard-date">{today}</p>
            <h1>{greeting}, {userName}</h1>
          </div>
          <div className="dashboard-filters" aria-label="Dashboard filters">
            <button type="button">All branches</button>
            <button type="button">All products</button>
            <button type="button" className="selected">This month</button>
          </div>
        </header>

        <section className="dashboard-metrics" aria-label="Portfolio overview">
          {metrics.map((metric) => (
            <article className="dashboard-metric" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>▲ {metric.change} vs last month</span>
            </article>
          ))}
        </section>

        <section className="dashboard-overview">
          <article className="dashboard-card branch-card">
            <div className="card-heading">
              <h2>Top branches</h2>
              <span className="sample-label">Sample data</span>
            </div>
            <ol className="branch-list">
              {topBranches.map((branch) => (
                <li key={branch.code}>
                  <span>{branch.name}</span>
                  <strong>{branch.applications} applications</strong>
                </li>
              ))}
            </ol>
          </article>

          <article className="dashboard-card pipeline-card">
            <div className="card-heading">
              <h2>Application pipeline</h2>
            </div>
            <div className="pipeline-stack" aria-label="Application status distribution">
              {pipeline.map((item) => (
                <span
                  className={`pipeline-segment ${item.color}`}
                  key={item.label}
                  style={{ width: `${item.percent}%` }}
                  title={`${item.label}: ${item.value} (${item.percent}%)`}
                />
              ))}
            </div>
            <ul className="pipeline-list">
              {pipeline.map((item) => (
                <li key={item.label}>
                  <span className="pipeline-label">
                    <i className={`status-dot ${item.color}`} />
                    {item.label}
                  </span>
                  <strong>{item.value} · {item.percent}%</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="dashboard-card portfolio-card">
          <div className="card-heading">
            <h2>Portfolio by product</h2>
            <span className="sample-label">Sample data</span>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <div className="product-item" key={product.name}>
                <div className="product-label">
                  <span>{product.name}</span>
                  <strong>{product.share}%</strong>
                </div>
                <div className="product-track">
                  <span
                    className={`product-fill ${product.color}`}
                    style={{ width: `${product.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card recent-card">
          <div className="card-heading">
            <h2>Recent applications</h2>
            <Link href="/customer_management" className="view-all">View all</Link>
          </div>
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Updated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((application) => (
                  <tr key={application.id}>
                    <td><strong className="application-id">{application.id}</strong></td>
                    <td>{application.customer}</td>
                    <td>{application.product}</td>
                    <td className="application-amount">{formatAmount(application.amount)}</td>
                    <td className="updated-time">{application.updated}</td>
                    <td>
                      <span className={`application-status ${application.status.toLowerCase().replace(/ /g, '-')}`}>
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style jsx>{`
        .dashboard-page {
          min-height: calc(100vh - 68px);
          margin: -42px -45px -55px;
          padding: 22px 7% 40px;
          background: #f4f7fb;
          color: #172746;
          font-family: "Google Sans", Arial, sans-serif;
          font-weight: 500;
        }

        .dashboard-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 12px;
        }

        .dashboard-date {
          margin: 0 0 4px;
          color: #7584a0;
          font-size: 12px;
          font-weight: 500;
        }

        .dashboard-heading h1 {
          margin: 0;
          color: #172746;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.6px;
          line-height: 1.25;
        }

        .dashboard-filters {
          display: flex;
          gap: 6px;
        }

        .dashboard-filters button {
          min-height: 34px;
          padding: 0 11px;
          border: 1px solid #d9e1ef;
          border-radius: 7px;
          background: #fff;
          color: #34425f;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .dashboard-filters button.selected {
          border-color: #2362e9;
          background: #2362e9;
          color: #fff;
          font-weight: 700;
        }

        .dashboard-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 13px;
        }

        .dashboard-metric,
        .dashboard-card {
          border: 1px solid #dfe6f2;
          border-radius: 10px;
          background: #fff;
        }

        .dashboard-metric {
          min-height: 82px;
          padding: 14px 13px 11px;
        }

        .dashboard-metric p {
          margin: 0 0 4px;
          color: #7685a0;
          font-size: 12px;
          font-weight: 600;
        }

        .dashboard-metric strong {
          display: block;
          color: #172746;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.6px;
          line-height: 1.1;
        }

        .dashboard-metric span {
          display: block;
          margin-top: 5px;
          color: #2362e9;
          font-size: 11px;
          font-weight: 600;
        }

        .dashboard-overview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 13px;
        }

        .dashboard-card {
          min-width: 0;
          padding: 15px;
        }

        .branch-card,
        .pipeline-card {
          min-height: 183px;
        }

        .card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .card-heading h2 {
          margin: 0;
          color: #1d2e4d;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .sample-label {
          color: #8693ac;
          font-size: 10px;
          font-weight: 500;
        }

        .branch-list,
        .pipeline-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .branch-list {
          counter-reset: branch;
        }

        .branch-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 28px;
          border-bottom: 1px solid #eff2f7;
          color: #33415e;
          font-size: 12px;
          font-weight: 500;
          counter-increment: branch;
        }

        .branch-list li:last-child {
          border-bottom: 0;
        }

        .branch-list li > span::before {
          content: counter(branch) ' · ';
        }

        .branch-list strong {
          color: #202f4d;
          font-size: 12px;
          font-weight: 700;
        }

        .pipeline-card .card-heading {
          margin-bottom: 9px;
        }

        .pipeline-stack {
          display: flex;
          width: 100%;
          height: 11px;
          gap: 2px;
          overflow: hidden;
          border-radius: 8px;
          margin: 0 0 9px;
        }

        .pipeline-segment {
          display: block;
          height: 100%;
        }

        .pipeline-segment.approved,
        .status-dot.approved { background: #2462e8; }
        .pipeline-segment.review,
        .status-dot.review { background: #5e8cf0; }
        .pipeline-segment.kyc,
        .status-dot.kyc { background: #9ab9f5; }
        .pipeline-segment.returned,
        .status-dot.returned { background: #f5a337; }
        .pipeline-segment.draft,
        .status-dot.draft { background: #b5c1d7; }

        .pipeline-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 20px;
          color: #3b4966;
          font-size: 12px;
          font-weight: 500;
        }

        .pipeline-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pipeline-list strong {
          color: #202f4d;
          font-size: 12px;
          font-weight: 700;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 2px;
        }

        .portfolio-card {
          margin-bottom: 13px;
          padding: 15px;
        }

        .portfolio-card .card-heading {
          margin-bottom: 13px;
        }

        .product-grid {
          display: grid;
          grid-auto-flow: column;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(3, minmax(20px, auto));
          column-gap: 35px;
          row-gap: 7px;
        }

        .product-item {
          min-width: 0;
        }

        .product-label {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 3px;
          color: #34415f;
          font-size: 12px;
          font-weight: 500;
        }

        .product-label strong {
          color: #202f4d;
          font-weight: 700;
        }

        .product-track {
          height: 6px;
          overflow: hidden;
          border-radius: 5px;
          background: #e5ecf9;
        }

        .product-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
        }

        .product-fill.gold { background: #2462e8; }
        .product-fill.home { background: #80a5f4; }
        .product-fill.personal { background: #4a7ce9; }
        .product-fill.vehicle { background: #91aff0; }
        .product-fill.business { background: #5f8cf0; }
        .product-fill.education { background: #afc6f4; }

        .recent-card {
          padding: 15px 15px 10px;
        }

        .recent-card .card-heading {
          margin-bottom: 8px;
        }

        .view-all {
          color: #2362e9;
          font-size: 12px;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .recent-table-wrap {
          overflow-x: auto;
        }

        .recent-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
          color: #34415f;
          font-size: 12px;
          font-weight: 500;
          text-align: left;
        }

        .recent-table th {
          padding: 8px 9px;
          background: #f4f6fa;
          color: #74829d;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .recent-table th:first-child {
          border-radius: 7px 0 0 7px;
        }

        .recent-table th:last-child {
          border-radius: 0 7px 7px 0;
        }

        .recent-table td {
          padding: 8px 9px;
          border-bottom: 1px solid #eff2f7;
          white-space: nowrap;
        }

        .recent-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .application-id {
          color: #2462e8;
          font-size: 12px;
          font-weight: 700;
        }

        .application-amount {
          color: #202f4d;
          font-weight: 700;
        }

        .updated-time {
          color: #7583a0;
        }

        .application-status {
          display: inline-flex;
          align-items: center;
          min-height: 17px;
          padding: 2px 8px;
          border-radius: 10px;
          background: #e7efff;
          color: #2860cb;
          font-size: 10px;
          font-weight: 700;
        }

        .application-status.approved {
          background: #2462e8;
          color: #fff;
        }

        .application-status.awaiting-kyc {
          background: #edf1f8;
          color: #50607d;
        }

        .application-status.returned {
          background: #ffebc9;
          color: #95611b;
        }

        @media (max-width: 900px) {
          .dashboard-page {
            margin-right: -24px;
            margin-left: -24px;
            padding-right: 6%;
            padding-left: 6%;
          }
        }

        @media (max-width: 680px) {
          .dashboard-page {
            margin: -24px -16px -35px;
            padding: 18px 14px 30px;
          }

          .dashboard-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .dashboard-heading h1 {
            font-size: 22px;
          }

          .dashboard-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .dashboard-metric {
            min-height: 80px;
            padding: 12px 10px;
          }

          .dashboard-overview {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .branch-card,
          .pipeline-card {
            min-height: auto;
          }

          .product-grid {
            column-gap: 18px;
          }
        }

        @media (max-width: 420px) {
          .dashboard-filters {
            width: 100%;
          }

          .dashboard-filters button {
            flex: 1;
            padding: 0 5px;
            font-size: 11px;
          }

          .dashboard-metric strong {
            font-size: 21px;
          }

          .product-grid {
            grid-auto-flow: row;
            grid-template-columns: 1fr;
            grid-template-rows: none;
          }
        }
      `}</style>
    </AppShell>
  );
}
