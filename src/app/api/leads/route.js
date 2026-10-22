import { proxyLeadRequest } from '../../../lib/leadApiProxy';

export async function GET(request) {
  return proxyLeadRequest(request, 'GET');
}

export async function POST(request) {
  return proxyLeadRequest(request, 'POST');
}
