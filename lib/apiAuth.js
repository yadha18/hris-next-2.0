export function isAuthorized(request) {
  const API_KEY = process.env.API_KEY || '';
  if (!API_KEY) return true;
  return request.headers.get('x-api-key') === API_KEY;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: 'unauthorized', message: 'Header x-api-key tidak valid atau tidak ada.' },
    { status: 401 }
  );
}