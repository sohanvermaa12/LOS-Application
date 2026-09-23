import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function RuleEnginePage() {
  return <AppShell title="Rule Engine">
    <PageHeader eyebrow="COMPLIANCE" title="Rule Engine" description="Review decision rules and policy checks that power lending workflows." />
    <Card>
      <h2>Decision rules</h2>
      <p className="modal-copy">Control underwriting, validation, and workflow constraints from one place.</p>
      <div className="review-summary">
        <span>Rules active<strong>48</strong></span>
        <span>Pending review<strong>4</strong></span>
        <span>Last updated<strong>Today</strong></span>
      </div>
    </Card>
  </AppShell>;
}
