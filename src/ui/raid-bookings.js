// @doc: docs/daten/ui/raid-bookings.md#raid-bookings
const NO_SERVER = 'Der Konto-Server antwortet nicht — die Quittungen hängen am Dev-Server, nicht am Production-Build.';
const NO_SESSION = 'Diese Sitzung kennt der Server nicht mehr — bitte neu anmelden.';

export function amountOf(value) {
  return Number.isFinite(value) ? value : 0;
}

function bookingsOf(payload) {
  const rows = Array.isArray(payload?.bookings) ? payload.bookings : [];
  return rows.map((row) => ({
    id: String(row?.id ?? ''),
    defender: String(row?.defender ?? '–'),
    essence: amountOf(row?.essence),
    bloodstone: amountOf(row?.bloodstone),
  }));
}

export async function readBookings(token) {
  if (!token || typeof fetch !== 'function') return { ok: false, error: NO_SERVER };
  let response;
  try {
    response = await fetch('/api/raid/bookings', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, error: NO_SERVER };
  }
  if (!(response.headers.get('content-type') ?? '').includes('application/json')) return { ok: false, error: NO_SERVER };
  if (!response.ok) return { ok: false, error: NO_SESSION };
  const payload = await response.json().catch(() => ({}));
  return { ok: true, rows: bookingsOf(payload) };
}
