import { Filter, Search } from 'lucide-react';
import AppShell from '../../components/AppShell';
import ApplicationTable from '../../components/ApplicationTable';
import NewApplicationButton from '../../components/NewApplicationButton';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function ApplicationsPage() {
  return <AppShell title="Applications"><PageHeader eyebrow="WORK QUEUE" title="Applications" description="Review, track and move applications through the credit journey." action={<NewApplicationButton />} /><div className="workspace-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search by application ID or customer" /></div><button className="filter-select"><Filter size={15} /> More filters</button><button className="filter-select">Sort: newest</button></div><div className="tabs"><button className="tab active">All <span>248</span></button><button className="tab">My queue <span>18</span></button><button className="tab">Returned <span>24</span></button><button className="tab">Drafts <span>18</span></button></div><Card className="table-panel full-table"><ApplicationTable /></Card></AppShell>;
}