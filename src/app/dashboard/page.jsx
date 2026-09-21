'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, ArrowUpRight, CircleHelp, FileText, Filter, Gauge, ShieldCheck } from 'lucide-react';
import AppShell from '../../components/AppShell';
import ApplicationTable from '../../components/ApplicationTable';
import MetricCard from '../../components/MetricCard';
import NewApplicationButton from '../../components/NewApplicationButton';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

function AttentionItem({ icon: Icon, title, detail, tone }) { return <div className="attention-item"><div className={`attention-icon ${tone}`}><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div><ArrowUpRight size={15} className="attention-arrow" /></div>; }
function PipelineBar({ label, value, percent, color }) { return <div className="pipeline-row"><div className="pipeline-label"><span className={`dot ${color}`} />{label}<strong>{value}</strong></div><div className="bar-track"><div className={`bar-fill ${color}`} style={{ width: `${percent}%` }} /></div><span className="percent">{percent}%</span></div>; }

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Good day');
  const [userName, setUserName] = useState('User');
  const [today, setToday] = useState('');

    useEffect(() => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const storedAuthData = window.localStorage.getItem('authData');

    if (storedAuthData) {
      try {
        const user = JSON.parse(storedAuthData).user;
        const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
        if (name) setUserName(name);
      } catch {
        window.localStorage.removeItem('authData');
      }
    }

    setGreeting(currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening');
    setToday(currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

    return <AppShell title="Overview">
      <PageHeader eyebrow={today} title={`${greeting}, ${userName}`} description="Here is what needs your attention today." action={<NewApplicationButton />} />
      <section className="filter-row">
        <div className="filter-title"><Filter size={16} /> Filters</div>
        <button className="filter-select">All branches</button>
        <button className="filter-select">All products</button>
        <button className="filter-select">All statuses</button>
        <button className="filter-select">This month</button>
        <button className="reset-button">Reset</button>
      </section>
      <section className="metric-grid">
        <MetricCard label="Total applications" value="248" change="12.8%" tone="ink" />
        <MetricCard label="Awaiting my review" value="18" change="4.2%" tone="blue" />
        <MetricCard label="Approved this month" value="96" change="18.6%" tone="green" />
        <MetricCard label="Average TAT" value="2.4d" change="0.6d" tone="amber" />
      </section>
      <section className="dashboard-grid">
        <Card>
          <div className="panel-heading">
            <div>
              <h2>Application pipeline</h2>
              <p>Volume by current application status</p>
            </div>
            <Link className="text-button" href="/applications">View all <ArrowUpRight size={15} /></Link>
          </div>
          <div className="pipeline">
            <PipelineBar label="Approved" value="96" percent={39} color="green" />
            <PipelineBar label="In review" value="72" percent={29} color="blue" />
            <PipelineBar label="Awaiting KYC" value="38" percent={15} color="violet" />
            <PipelineBar label="Returned" value="24" percent={10} color="amber" />
            <PipelineBar label="Draft" value="18" percent={7} color="grey" />
          </div>
          <div className="pipeline-total">
            <span>248 total applications</span>
            <span>+12.8% vs last month</span>
          </div>
        </Card>
        <Card>
          <div className="panel-heading">
            <div>
              <h2>Needs attention</h2>
              <p>Items that need your decision</p>
            </div>
            <span className="count-badge">4</span>
          </div>
          <div className="alert-list">
            <AttentionItem icon={AlertTriangle} title="KYC verification pending" detail="3 applications · Oldest 2d" tone="amber" />
            <AttentionItem icon={Activity} title="SLA breach risk" detail="2 applications · Due today" tone="blue" />
            <AttentionItem icon={CircleHelp} title="Returned by checker" detail="1 application · Needs update" tone="violet" />
          </div>
        </Card>
      </section>
      <Card className="table-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent applications</h2>
            <p>Latest activity across your portfolio</p>
          </div>
          <Link className="text-button" href="/applications">View all <ArrowUpRight size={15} /></Link>
        </div>
        <ApplicationTable compact />
      </Card>
    </AppShell>;
}