/** Zwei Aufrufe, ein Ort: das Backend antwortet mit Status und Objekt. */
async function post(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? `Anfrage fehlgeschlagen (${response.status})`);
  return payload;
}

export function registerAccount(credentials) {
  return post('/api/register', credentials);
}

export function loginAccount(credentials) {
  return post('/api/login', credentials);
}
