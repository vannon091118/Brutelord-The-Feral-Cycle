/** Zwei Aufrufe, ein Ort: das Backend antwortet mit Status und Objekt. */
const NO_SERVER = 'Der Konto-Server antwortet nicht — er hängt nur am Dev-Server, nicht im Production-Build.';

async function post(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Der Konto-Server ist nicht erreichbar.');
  }
  if (!(response.headers.get('content-type') ?? '').includes('application/json')) throw new Error(NO_SERVER);
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