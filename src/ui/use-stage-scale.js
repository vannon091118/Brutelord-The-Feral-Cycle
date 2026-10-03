import { useCallback, useEffect, useState } from 'react';
import { TILE_SIZE, computeWorldScale, worldPixelSize } from '../domain/world/world-config.js';

/**
 * Messt die verfügbare Spielfläche und liefert den Skalierungsfaktor.
 * Auf Desktop bleiben die Tiles 64px, auf schmalen Geräten schrumpft die Welt
 * proportional (Tiles landen bei etwa 48–56px). Keine horizontale Scrollbar.
 */
export function useStageScale(tileSize = TILE_SIZE) {
  const [node, setNode] = useState(null);
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  const attach = useCallback((element) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setAvailable({ width: rect.width, height: rect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const scale = computeWorldScale({
    availableWidth: available.width - 4,
    availableHeight: available.height - 4,
    tileSize,
  });

  return { attach, scale, tileSize, world: worldPixelSize(tileSize) };
}
