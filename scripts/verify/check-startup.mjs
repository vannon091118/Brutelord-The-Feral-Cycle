/** Der Start läuft: dieselbe Browser-Stufe, die auch allein laufen kann. */
import { section } from './expect.mjs';
import { checkBrowserStage } from '../browser/stage.mjs';

export async function checkStartup() {
  section('Der Start läuft: Server hoch, Seite da, Onboarding in Echtzeit');
  await checkBrowserStage();
}