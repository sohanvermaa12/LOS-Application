import path from 'node:path';
import nextEnv from '@next/env';

export async function GET(request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ message: 'Sign in to export leads.' }, { status: 401 });
  }

  nextEnv.loadEnvConfig(path.join(process.cwd(), 'src'), undefined, undefined, true);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    return Response.json({ message: 'NEXT_PUBLIC_API_URL is not configured.' }, { status: 500 });
  }

  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  const versionedBaseUrl = /\/api\/v\d+$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api/v1`;

  let upstream;
  try {
    upstream = await fetch(`${versionedBaseUrl}/leads/export`, {
      method: 'GET',
      headers: { Authorization: authorization, Accept: 'text/csv, application/octet-stream' },
      cache: 'no-store',
    });
  } catch {
    return Response.json({ message: 'Unable to connect to the leads service.' }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.text();
    return new Response(body || JSON.stringify({ message: 'Unable to export leads.' }), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
    });
  }

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/csv; charset=utf-8',
      'Content-Disposition': upstream.headers.get('content-disposition') || 'attachment; filename="leads.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
