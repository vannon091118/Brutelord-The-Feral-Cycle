import { BUILDING_STATE, BUILDING_TYPE } from '../../domain/buildings/building-config.js';
import { BuildSiteArt } from './BuildSiteArt.jsx';
import { SwarmHostArt } from './SwarmHostArt.jsx';
import { ExtractorArt } from './ExtractorArt.jsx';
import { BruteLordArt } from './BruteLordArt.jsx';

// @doc: docs/daten/buildings/buildingart.md#buildingart
export function BuildingArt({ building, tileSize }) {
  const props = { building, tileSize };
  if (building.state === BUILDING_STATE.SITE) return <BuildSiteArt {...props} />;
  if (building.type === BUILDING_TYPE.SWARM_HOST) return <SwarmHostArt {...props} />;
  if (building.type === BUILDING_TYPE.ESSENCE_EXTRACTOR) return <ExtractorArt {...props} />;
  return <BruteLordArt {...props} />;
}
