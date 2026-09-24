import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function AuditBlogsPage() {
  return <AppShell title="Audit logs">
    <PageHeader eyebrow="INSIGHTS" title="Audit logs" description="Track regulatory notes, process updates, and audit-ready documentation." />
    <Card>
      <h2>Latest notes</h2>
      <p className="modal-copy">Maintain a clear audit trail with summaries, controls, and review checkpoints.</p>
      <div className="review-summary">
        <span>Published<strong>18</strong></span>
        <span>Needs review<strong>2</strong></span>
        <span>Archived<strong>11</strong></span>
      </div>
    </Card>
  </AppShell>;
}
