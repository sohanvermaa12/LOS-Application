import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function LeadGenerationPage() {
  return <AppShell title="Lead Generation">
    <PageHeader eyebrow="GROWTH" title="Lead Generation" description="Capture and qualify incoming customer interest from multiple channels." />
    <Card>
      <h2>Channel performance</h2>
      <p className="modal-copy">Review source quality, lead conversion, and next-best actions for new opportunities.</p>
      <div className="review-summary">
        <span>Captured leads<strong>210</strong></span>
        <span>Qualified<strong>72</strong></span>
        <span>High intent<strong>28</strong></span>
      </div>
    </Card>
  </AppShell>;
}
