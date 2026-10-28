import { proxyLeadRequest } from '../../../../../lib/leadApiProxy';

export async function PUT(request, { params }) {
  const { leadId } = await params;
  return proxyLeadRequest(request, 'PUT', leadId, 'assign');
}
