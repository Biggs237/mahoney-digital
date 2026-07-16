export const config = {
  matcher: ['/examples/castos-auto-repair', '/examples/castos-auto-repair/:path*'],
};

function decodeBasicAuth(header) {
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return null;

  try {
    const decoded = atob(encoded);
    const colon = decoded.indexOf(':');
    if (colon < 0) return null;
    return {
      user: decoded.slice(0, colon),
      pass: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

export default function middleware(request) {
  const expectedUser = process.env.CASTOS_DEMO_USER || 'castos';
  const expectedPass = process.env.CASTOS_DEMO_PASSWORD;

  if (!expectedPass) {
    return new Response('Castos demo is locked. Set CASTOS_DEMO_PASSWORD in Vercel.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const auth = request.headers.get('authorization');
  if (auth) {
    const credentials = decodeBasicAuth(auth);
    if (
      credentials &&
      credentials.user === expectedUser &&
      credentials.pass === expectedPass
    ) {
      return;
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Castos Auto Repair Demo", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}