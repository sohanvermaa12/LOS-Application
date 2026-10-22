import path from 'node:path';
import nextEnv from '@next/env';

export async function POST(request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ message: 'Sign in to import leads.' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ message: 'The upload must contain a CSV file.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string' || !file.name?.toLowerCase().endsWith('.csv')) {
    return Response.json({ message: 'Choose a valid .csv file to import.' }, { status: 400 });
  }

  nextEnv.loadEnvConfig(path.join(process.cwd(), 'src'), undefined, undefined, true);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    return Response.json({ message: 'NEXT_PUBLIC_API_URL is not configured.' }, { status: 500 });
  }

  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  const versionedBaseUrl = /\/api\/v\d+$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api/v1`;
  const upstreamFormData = new FormData();
  upstreamFormData.append('file', file, file.name);

  let upstream;
  try {
    upstream = await fetch(`${versionedBaseUrl}/leads/import`, {
      method: 'POST',
      headers: { Authorization: authorization, Accept: 'application/json' },
      body: upstreamFormData,
      cache: 'no-store',
    });
  } catch {
    return Response.json({ message: 'Unable to connect to the leads service.' }, { status: 502 });
  }

  const responseBody = await upstream.arrayBuffer();
  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
