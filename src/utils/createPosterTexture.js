import { CanvasTexture } from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Helper utils
// ─────────────────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────────
// NBA Poster — dunker silhouette, orange/navy
// ─────────────────────────────────────────────────────────────────────────────
function drawNBAPoster(ctx, W, H) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a18');
  bg.addColorStop(1, '#12122a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Court lines (parquet floor illusion)
  ctx.save();
  ctx.strokeStyle = 'rgba(60,40,10,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.6 + i * 12);
    ctx.lineTo(W, H * 0.6 + i * 12);
    ctx.stroke();
  }
  // Perspective lines
  for (let i = -5; i <= 15; i++) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + i * 60, H * 0.6);
    ctx.lineTo(W / 2 + i * 250, H);
    ctx.stroke();
  }
  ctx.restore();

  // Large background number
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ff6600';
  ctx.font = `bold ${W * 0.75}px "Arial Black", Impact`;
  ctx.textAlign = 'center';
  ctx.fillText('23', W / 2, H * 0.72);
  ctx.restore();

  // Player silhouette — dunking pose
  const cx = W * 0.5, cy = H * 0.38, s = H * 0.0032;
  ctx.save();
  ctx.fillStyle = '#e85c00';
  ctx.globalAlpha = 0.85;

  // Head
  ctx.beginPath();
  ctx.arc(cx - 8 * s, cy - 105 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.fillRect(cx - 22 * s, cy - 86 * s, 44 * s, 55 * s);

  // Right arm — raised up with ball
  ctx.save();
  ctx.translate(cx + 22 * s, cy - 76 * s);
  ctx.rotate(-1.1);
  ctx.fillRect(-8 * s, 0, 16 * s, 52 * s);
  ctx.restore();
  // Ball in right hand
  ctx.beginPath();
  ctx.arc(cx + 62 * s, cy - 118 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();

  // Left arm — swinging back
  ctx.save();
  ctx.translate(cx - 22 * s, cy - 68 * s);
  ctx.rotate(0.7);
  ctx.fillRect(-8 * s, 0, 16 * s, 46 * s);
  ctx.restore();

  // Right leg — bent forward
  ctx.save();
  ctx.translate(cx + 6 * s, cy - 30 * s);
  ctx.rotate(0.35);
  ctx.fillRect(-10 * s, 0, 20 * s, 52 * s);
  ctx.restore();

  // Left leg — extended back
  ctx.save();
  ctx.translate(cx - 10 * s, cy - 30 * s);
  ctx.rotate(-0.5);
  ctx.fillRect(-10 * s, 0, 20 * s, 56 * s);
  ctx.restore();

  ctx.restore();

  // Spotlight glow beneath player
  const glow = ctx.createRadialGradient(cx, H * 0.62, 0, cx, H * 0.62, W * 0.4);
  glow.addColorStop(0, 'rgba(255,102,0,0.18)');
  glow.addColorStop(1, 'rgba(255,102,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(0, 0, W, 7);
  ctx.fillRect(0, H - 7, W, 7);

  // Title text
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${W * 0.12}px "Arial Black", Impact`;
  ctx.textAlign = 'center';
  ctx.fillText('NBA', W / 2, H * 0.83);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff6600';
  ctx.font = `${W * 0.06}px "Courier New", monospace`;
  ctx.fillText('BASKETBALL', W / 2, H * 0.90);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${W * 0.038}px monospace`;
  ctx.fillText('RISE TO THE OCCASION', W / 2, H * 0.96);

  // Border
  ctx.strokeStyle = '#ff6600';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 8, W - 16, H - 16, 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Baseball Poster — batter silhouette, red/white/navy
// ─────────────────────────────────────────────────────────────────────────────
function drawBaseballPoster(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0008');
  bg.addColorStop(1, '#1a0010');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Diamond shape background
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 2;
  const dc = { x: W / 2, y: H * 0.5 };
  const ds = H * 0.28;
  ctx.beginPath();
  ctx.moveTo(dc.x, dc.y - ds);
  ctx.lineTo(dc.x + ds, dc.y);
  ctx.lineTo(dc.x, dc.y + ds);
  ctx.lineTo(dc.x - ds, dc.y);
  ctx.closePath();
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    const r = ds * (0.35 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(dc.x, dc.y - r);
    ctx.lineTo(dc.x + r, dc.y);
    ctx.lineTo(dc.x, dc.y + r);
    ctx.lineTo(dc.x - r, dc.y);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Big background number
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#cc0000';
  ctx.font = `bold ${W * 0.8}px "Arial Black"`;
  ctx.textAlign = 'center';
  ctx.fillText('99', W / 2, H * 0.72);
  ctx.restore();

  // Batter silhouette
  const cx = W * 0.5, cy = H * 0.42, s = H * 0.003;
  ctx.save();
  ctx.fillStyle = '#cc0000';
  ctx.globalAlpha = 0.9;

  // Head
  ctx.beginPath();
  ctx.arc(cx + 10 * s, cy - 105 * s, 19 * s, 0, Math.PI * 2);
  ctx.fill();
  // Helmet brim
  ctx.fillRect(cx - 5 * s, cy - 122 * s, 36 * s, 10 * s);

  // Torso — twisted for swing
  ctx.save();
  ctx.translate(cx, cy - 68 * s);
  ctx.rotate(0.25);
  ctx.fillRect(-18 * s, 0, 36 * s, 50 * s);
  ctx.restore();

  // Bat — extended horizontal swing
  ctx.save();
  ctx.translate(cx - 28 * s, cy - 85 * s);
  ctx.rotate(-0.15);
  ctx.fillRect(0, -5 * s, 90 * s, 10 * s);
  ctx.restore();

  // Arms holding bat
  ctx.save();
  ctx.translate(cx - 16 * s, cy - 84 * s);
  ctx.rotate(-0.2);
  ctx.fillRect(-6 * s, 0, 14 * s, 36 * s);
  ctx.restore();
  ctx.save();
  ctx.translate(cx + 10 * s, cy - 76 * s);
  ctx.rotate(0.5);
  ctx.fillRect(-6 * s, 0, 14 * s, 32 * s);
  ctx.restore();

  // Legs — batting stance
  ctx.save();
  ctx.translate(cx - 14 * s, cy - 18 * s);
  ctx.rotate(-0.15);
  ctx.fillRect(-10 * s, 0, 20 * s, 50 * s);
  ctx.restore();
  ctx.save();
  ctx.translate(cx + 10 * s, cy - 18 * s);
  ctx.rotate(0.25);
  ctx.fillRect(-10 * s, 0, 20 * s, 50 * s);
  ctx.restore();

  ctx.restore();

  // Stitching circles (baseball seam decoration)
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(W * 0.12, H * 0.15, 30, 0, Math.PI * 1.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W * 0.88, H * 0.85, 30, Math.PI, Math.PI * 2.3);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Text
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(0, 0, W, 7);
  ctx.fillRect(0, H - 7, W, 7);

  ctx.shadowColor = '#cc0000';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${W * 0.11}px "Arial Black", Impact`;
  ctx.textAlign = 'center';
  ctx.fillText('BASEBALL', W / 2, H * 0.83);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#cc0000';
  ctx.font = `${W * 0.055}px "Courier New", monospace`;
  ctx.fillText("AMERICA'S PASTIME", W / 2, H * 0.90);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${W * 0.036}px monospace`;
  ctx.fillText('PLAY BALL', W / 2, H * 0.96);

  ctx.strokeStyle = '#cc0000';
  ctx.shadowColor = '#cc0000';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 8, W - 16, H - 16, 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Soccer Poster — kicker silhouette, green/white/gold
// ─────────────────────────────────────────────────────────────────────────────
function drawSoccerPoster(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#001a08');
  bg.addColorStop(1, '#00120a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Field markings
  ctx.save();
  ctx.strokeStyle = 'rgba(0,80,20,0.5)';
  ctx.lineWidth = 2;
  // Center circle
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.52, W * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // Center line
  ctx.beginPath();
  ctx.moveTo(0, H * 0.52);
  ctx.lineTo(W, H * 0.52);
  ctx.stroke();
  // Penalty box
  ctx.strokeRect(W * 0.2, H * 0.62, W * 0.6, H * 0.3);
  ctx.strokeRect(W * 0.32, H * 0.72, W * 0.36, H * 0.2);
  ctx.restore();

  // Big background number
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#00cc44';
  ctx.font = `bold ${W * 0.8}px "Arial Black"`;
  ctx.textAlign = 'center';
  ctx.fillText('10', W / 2, H * 0.68);
  ctx.restore();

  // Player kicking silhouette
  const cx = W * 0.48, cy = H * 0.4, s = H * 0.0032;
  ctx.save();
  ctx.fillStyle = '#00cc44';
  ctx.globalAlpha = 0.88;

  // Head
  ctx.beginPath();
  ctx.arc(cx + 5 * s, cy - 106 * s, 19 * s, 0, Math.PI * 2);
  ctx.fill();

  // Torso — leaning into kick
  ctx.save();
  ctx.translate(cx, cy - 76 * s);
  ctx.rotate(-0.2);
  ctx.fillRect(-16 * s, 0, 32 * s, 50 * s);
  ctx.restore();

  // Left arm — back for balance
  ctx.save();
  ctx.translate(cx - 16 * s, cy - 66 * s);
  ctx.rotate(0.8);
  ctx.fillRect(-6 * s, 0, 12 * s, 44 * s);
  ctx.restore();

  // Right arm — forward
  ctx.save();
  ctx.translate(cx + 16 * s, cy - 68 * s);
  ctx.rotate(-0.6);
  ctx.fillRect(-6 * s, 0, 12 * s, 40 * s);
  ctx.restore();

  // Support leg — planted
  ctx.save();
  ctx.translate(cx - 10 * s, cy - 24 * s);
  ctx.rotate(0.1);
  ctx.fillRect(-10 * s, 0, 20 * s, 52 * s);
  ctx.restore();

  // Kicking leg — extended high
  ctx.save();
  ctx.translate(cx + 8 * s, cy - 24 * s);
  ctx.rotate(-0.9);
  ctx.fillRect(-10 * s, 0, 20 * s, 56 * s);
  ctx.restore();

  // Soccer ball
  ctx.beginPath();
  ctx.arc(cx + 72 * s, cy - 38 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(cx + 72 * s, cy - 38 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Spotlight
  const glow = ctx.createRadialGradient(cx, H * 0.55, 0, cx, H * 0.55, W * 0.5);
  glow.addColorStop(0, 'rgba(0,200,60,0.15)');
  glow.addColorStop(1, 'rgba(0,200,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold top/bottom bars
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(0, 0, W, 7);
  ctx.fillRect(0, H - 7, W, 7);

  ctx.shadowColor = '#00cc44';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${W * 0.11}px "Arial Black", Impact`;
  ctx.textAlign = 'center';
  ctx.fillText('SOCCER', W / 2, H * 0.83);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#00cc44';
  ctx.font = `${W * 0.055}px "Courier New", monospace`;
  ctx.fillText('THE BEAUTIFUL GAME', W / 2, H * 0.90);

  ctx.fillStyle = 'rgba(255,215,0,0.5)';
  ctx.font = `${W * 0.036}px monospace`;
  ctx.fillText('EL JUEGO BONITO', W / 2, H * 0.96);

  ctx.strokeStyle = '#00cc44';
  ctx.shadowColor = '#00cc44';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 8, W - 16, H - 16, 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dominican Republic Flag
// ─────────────────────────────────────────────────────────────────────────────
export function createDominicanFlagTexture() {
  const W = 700, H = 460;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const blue = '#002D62';
  const red  = '#CE1126';
  const cw   = W * 0.13; // cross width

  // Quadrants
  ctx.fillStyle = blue; ctx.fillRect(0,       0,       W/2, H/2); // top-left
  ctx.fillStyle = red;  ctx.fillRect(W/2,     0,       W/2, H/2); // top-right
  ctx.fillStyle = red;  ctx.fillRect(0,       H/2,     W/2, H/2); // bottom-left
  ctx.fillStyle = blue; ctx.fillRect(W/2,     H/2,     W/2, H/2); // bottom-right

  // White cross
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0,       H/2 - cw/2, W, cw); // horizontal
  ctx.fillRect(W/2 - cw/2, 0, cw, H);       // vertical

  // ── Coat of Arms (simplified) ──
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.09;

  // Outer circle (gold)
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.fill();

  // Shield background
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // Shield quarters (blue & red)
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI * 1.5); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fillStyle = blue; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 0.5); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fillStyle = blue; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.5, Math.PI * 2); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fillStyle = red; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.5, Math.PI); ctx.lineTo(cx, cy); ctx.closePath();
  ctx.fillStyle = red; ctx.fill(); ctx.restore();

  // Cross on shield
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - r * 0.6, cy - r * 0.1, r * 1.2, r * 0.2);
  ctx.fillRect(cx - r * 0.1, cy - r * 0.6, r * 0.2, r * 1.2);

  // Bible (small rect in center)
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(cx - r * 0.22, cy - r * 0.15, r * 0.44, r * 0.3);
  ctx.fillStyle = '#D4AF37';
  ctx.font = `bold ${r * 0.2}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✝', cx, cy + r * 0.08);

  // Thin border around flag
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Label
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, H - 28, W, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${H * 0.04}px "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('REPÚBLICA DOMINICANA', cx, H - 8);

  return new CanvasTexture(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function createPosterTexture(type) {
  const W = 512, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'left';

  switch (type) {
    case 'nba':      drawNBAPoster(ctx, W, H);      break;
    case 'baseball': drawBaseballPoster(ctx, W, H); break;
    case 'soccer':   drawSoccerPoster(ctx, W, H);   break;
    default:         drawNBAPoster(ctx, W, H);
  }

  return new CanvasTexture(canvas);
}
