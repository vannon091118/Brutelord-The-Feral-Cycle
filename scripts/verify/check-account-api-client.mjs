/** Testet die Fehlerfälle des Account API Clients (account-api.js), indem
 *  fetch gemockt wird. */
import { loginAccount } from '../../src/ui/account/account-api.js';
import { check, section } from './expect.mjs';

export async function checkAccountApiClient() {
  section('Account API Client: Fehlerfälle');

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error('Network error'); };
    let error1;
    try {
      await loginAccount({ name: 'test', password: 'password' });
    } catch (e) {
      error1 = e;
    }
    check('Wirft korrekten Fehler, wenn fetch fehlschlaegt', error1?.message === 'Der Konto-Server ist nicht erreichbar.');

    globalThis.fetch = async () => ({
      headers: new Headers({ 'content-type': 'text/html' }),
    });
    let error2;
    try {
      await loginAccount({ name: 'test', password: 'password' });
    } catch (e) {
      error2 = e;
    }
    check('Wirft NO_SERVER Fehler, wenn kein JSON zurueckkommt', error2?.message === 'Der Konto-Server antwortet nicht — er hängt nur am Dev-Server, nicht im Production-Build.');
  } finally {
    globalThis.fetch = originalFetch;
  }
}
