import { useRef, useEffect } from 'react';
import { ZONES } from '../World';

/* World → minimap coordinate mapping */
const WORLD_SIZE  = 120;   // half-extent of world we care about
const MAP_SIZE    = 150;   // canvas px (matches CSS)

function worldToMap(wx, wz) {
  const x = (wx / WORLD_SIZE) * (MAP_SIZE / 2) + MAP_SIZE / 2;
  const y = (wz / WORLD_SIZE) * (MAP_SIZE / 2) + MAP_SIZE / 2;
  return [x, y];
}

export default function MiniMap({ carPos, activeZone }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = MAP_SIZE, H = MAP_SIZE;

    ctx.clearRect(0, 0, W, H);

    // ── Roads ───────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 6;
    // E-W
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    // N-S
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();

    // ── Zone dots ────────────────────────
    ZONES.forEach((zone) => {
      const [mx, my] = worldToMap(zone.pos[0], zone.pos[2]);
      const isActive = zone.id === activeZone;
      const r = isActive ? 9 : 6;

      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.fillStyle = zone.color + (isActive ? 'ff' : '99');
      ctx.fill();

      if (isActive) {
        ctx.beginPath();
        ctx.arc(mx, my, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = zone.color + '55';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // ── Car arrow ────────────────────────
    if (carPos) {
      const [cx, cy] = worldToMap(carPos.x, carPos.z);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      // white glow
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [carPos, activeZone]);

  return (
    <div className="minimap">
      <canvas ref={canvasRef} width={MAP_SIZE} height={MAP_SIZE} />
    </div>
  );
}
