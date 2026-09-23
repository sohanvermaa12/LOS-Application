import AppShell from '../../components/AppShell';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';

export default function ProductManagemetPage() {
  return <AppShell title="Product Management">
    <PageHeader eyebrow="PRODUCT" title="Product Management" description="Manage available products, eligibility, and rules for lending." />
    <Card>
      <h2>Product catalog</h2>
      <p className="modal-copy">Configure pricing, eligibility, and business rules for each product offering.</p>
      <div className="review-summary">
        <span>Active products<strong>12</strong></span>
        <span>Draft items<strong>3</strong></span>
        <span>Updated this week<strong>5</strong></span>
      </div>
    </Card>
  </AppShell>;
}
