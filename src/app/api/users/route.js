import nextEnv from '@next/env';

const DEFAULT_API_BASE_URL = 'https://los-backend-at5n.onrender.com';

function getUsersApiUrl(request, create = false) {
  nextEnv.loadEnvConfig(process.cwd(), undefined, undefined, true);
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL
  ).replace(/\/+$/, '');
  const versionedBaseUrl = /\/api\/v\d+$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api/v1`;
  const endpoint = create ? '/users' : '/administration/users';
  const query = new URL(request.url).search;
  return `${versionedBaseUrl}${endpoint}${query}`;
}

async function proxyUsersRequest(request, method) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ message: 'Sign in to access users.' }, { status: 401 });
  }

  let url;
  try {
    url = getUsersApiUrl(request, method === 'POST');
  } catch (error) {
    console.error('Unable to configure the users API proxy.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return Response.json({ message: error.message }, { status: 500 });
  }

  let body;
  if (method === 'POST') {
    try {
      body = await request.text();
    } catch (error) {
      console.error('Unable to read the users API request body.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      return Response.json({ message: 'Unable to read the user request.' }, { status: 400 });
    }
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
  } catch (error) {
    console.error(`Users API ${method} request failed to reach the backend.`, {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return Response.json({ message: 'Unable to connect to the user service.' }, { status: 502 });
  }

  if ([204, 205, 304].includes(upstream.status)) {
    return new Response(null, { status: upstream.status });
  }

  let responseBody;
  try {
    responseBody = await upstream.text();
  } catch (error) {
    console.error(`Unable to read the users API ${method} response.`, {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return Response.json(
      { message: 'The user service returned an unreadable response.' },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  if (!responseBody) {
    return new Response(null, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  if (!upstream.ok) {
    console.error(`Users API ${method} request returned HTTP ${upstream.status}.`);
  }

  return new Response(responseBody, {
    status: upstream.status,
    headers,
  });
}

export async function GET(request) {
  return proxyUsersRequest(request, 'GET');
}

export async function POST(request) {
  return proxyUsersRequest(request, 'POST');
}
