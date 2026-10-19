import { proxyLeadRequest } from '../../../../lib/leadApiProxy';

export async function GET(request, { params }) {
  const { leadId } = await params;
  return proxyLeadRequest(request, 'GET', leadId);
}

export async function PUT(request, { params }) {
  const { leadId } = await params;
  return proxyLeadRequest(request, 'PUT', leadId);
}
