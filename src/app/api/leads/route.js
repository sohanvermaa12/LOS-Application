import path from 'node:path';
import nextEnv from '@next/env';

function getLeadsApiUrl() {
  nextEnv.loadEnvConfig(path.join(process.cwd(), 'src'), undefined, undefined, true);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  const versionedBaseUrl = /\/api\/v\d+$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api/v1`;
  return `${versionedBaseUrl}/leads`;
}

async function proxyLeadsRequest(request, method) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ message: 'Sign in to access leads.' }, { status: 401 });
  }

  let url;
  try {
    url = getLeadsApiUrl();
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  let body;
  if (method === 'POST') {
    body = await request.text();
  }

  let upstream;
  try {
    upstream = await fetch(url, {
      method,
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body } : {}),
      cache: 'no-store',
    });
  } catch {
    return Response.json({ message: 'Unable to connect to the leads service.' }, { status: 502 });
  }

  let result;
  try {
    result = await upstream.json();
  } catch {
    return Response.json(
      { message: 'The leads service returned an unreadable response.' },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  return Response.json(result, { status: upstream.status });
}

export async function GET(request) {
  return proxyLeadsRequest(request, 'GET');
}

export async function POST(request) {
  return proxyLeadsRequest(request, 'POST');
}
