const TEXT_TYPES = ['application/json', 'text/', 'application/problem+json'];

function apiPath(event) {
  const path = event.path || '';
  const marker = '/.netlify/functions/backend-proxy/';
  if (path.includes(marker)) return path.slice(path.indexOf(marker) + marker.length);
  return path.replace(/^\/api\/?/, '');
}

function queryString(event) {
  if (event.rawQuery) return event.rawQuery;
  const values = new URLSearchParams();
  for (const [key, value] of Object.entries(event.queryStringParameters || {})) if (value !== undefined) values.append(key, value);
  return values.toString();
}

exports.handler = async (event) => {
  const configuredBackend = process.env.BACKEND_SERVICE_URL;
  if (!configuredBackend) return { statusCode: 503, body: JSON.stringify({ message: 'Backend service URL is not configured.', code: 'PROXY_NOT_CONFIGURED' }), headers: { 'content-type': 'application/json' } };
  const base = configuredBackend.replace(/\/$/, '');
  const prefix = base.endsWith('/api') ? base : `${base}/api`;
  const query = queryString(event);
  const target = `${prefix}/${apiPath(event)}${query ? `?${query}` : ''}`;
  const headers = {};
  for (const name of ['accept', 'authorization', 'content-type', 'cookie', 'user-agent']) {
    const value = event.headers?.[name];
    if (value) headers[name] = value;
  }
  const hasBody = !['GET', 'HEAD'].includes(event.httpMethod);
  const body = hasBody && event.body
    ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body)
    : undefined;

  try {
    const response = await fetch(target, { method: event.httpMethod, headers, body, redirect: 'manual' });
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const isText = TEXT_TYPES.some((type) => contentType.includes(type));
    const responseBody = isText ? await response.text() : Buffer.from(await response.arrayBuffer()).toString('base64');
    const responseHeaders = { 'content-type': contentType };
    for (const name of ['content-disposition', 'cache-control']) {
      const value = response.headers.get(name);
      if (value) responseHeaders[name] = value;
    }
    const cookies = response.headers.getSetCookie?.() || (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : []);
    return {
      statusCode: response.status,
      headers: responseHeaders,
      ...(cookies.length ? { multiValueHeaders: { 'set-cookie': cookies } } : {}),
      body: responseBody,
      isBase64Encoded: !isText,
    };
  } catch (error) {
    console.error(`Backend proxy request failed: ${error.message}`);
    return { statusCode: 502, body: JSON.stringify({ message: 'The API service is temporarily unavailable.', code: 'UPSTREAM_UNAVAILABLE' }), headers: { 'content-type': 'application/json' } };
  }
};
