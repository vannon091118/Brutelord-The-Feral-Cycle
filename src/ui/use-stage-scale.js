import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { TILE_SIZE, computeWorldScale, viewportPixelSize } from '../domain/world/world-config.js';

// @doc: docs/daten/ui/use-stage-scale.md#use-stage-scale
export function useStageScale(tileSize = TILE_SIZE) {
  const [node, setNode] = useState(null);
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  const attach = useCallback((element) => {
    setNode(element);
  }, []);

  useLayoutEffect(() => {
    if (!node) return undefined;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      setAvailable({ width: rect.width, height: rect.height });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  const scale = computeWorldScale({
    availableWidth: available.width - 4,
    availableHeight: available.height - 4,
    tileSize,
  });

  return { attach, scale, tileSize, stage: useMemo(() => viewportPixelSize(tileSize), [tileSize]) };
}