import Link from 'next/link';

export default function Navbar() {
  return <nav className="tabs"><Link className="tab" href="/dashboard">Dashboard</Link><Link className="tab" href="/applications">Applications</Link><Link className="tab" href="/reports">Reports</Link></nav>;
}