import { useEffect, useRef } from 'react';
import { temperatureRgb } from '../../utils/color';

/** Centros de los núcleos en coordenadas normalizadas del dado (0–1). */
export const CORE_LAYOUT: Array<{ x: number; y: number; w: number; h: number }> = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const w = 0.2;
  const h = 0.32;
  const x = 0.06 + col * 0.225;
  const y = row === 0 ? 0.06 : 0.62;
  return { x, y, w, h };
});

const RES = 56;
const SIGMA = 0.12;

interface HeatmapCanvasProps {
  /** Temperatura media del dado [°C]. */
  T: number;
  ambient: number;
  coreDelta: number[];
}

/**
 * Mapa de calor del dado (REPRESENTACIÓN CONCEPTUAL). Superpone a la
 * temperatura media un perfil gaussiano por núcleo y un leve enfriamiento
 * hacia los bordes. Se dibuja a baja resolución y el navegador lo suaviza.
 */
export function HeatmapCanvas({ T, ambient, coreDelta }: HeatmapCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const img = ctx.createImageData(RES, RES);
    const edgeDrop = 0.18 * Math.max(0, T - ambient);
    const centers = CORE_LAYOUT.map((c) => ({ cx: c.x + c.w / 2, cy: c.y + c.h / 2 }));
    const inv2s2 = 1 / (2 * SIGMA * SIGMA);
    for (let j = 0; j < RES; j++) {
      const y = (j + 0.5) / RES;
      for (let i = 0; i < RES; i++) {
        const x = (i + 0.5) / RES;
        const dx0 = x - 0.5;
        const dy0 = y - 0.5;
        let t = T - edgeDrop * (dx0 * dx0 + dy0 * dy0) * 2;
        for (let k = 0; k < centers.length; k++) {
          const d = coreDelta[k] ?? 0;
          if (d <= 0.01) continue;
          const dx = x - centers[k].cx;
          const dy = (y - centers[k].cy) * 0.8;
          t += d * Math.exp(-(dx * dx + dy * dy) * inv2s2);
        }
        const [r, g, b] = temperatureRgb(t);
        const idx = (j * RES + i) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [T, ambient, coreDelta]);

  return <canvas ref={ref} width={RES} height={RES} className="h-full w-full rounded-[3%]" aria-hidden />;
}
