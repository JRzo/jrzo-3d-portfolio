import { CanvasTexture, SRGBColorSpace } from 'three';

// Language → color mapping (GitHub style)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] ?? '#8b949e';
}

// Cross-browser roundRect helper
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

// Word-wrap helper; returns final y position
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  let lineCount = 0;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      if (lineCount >= maxLines - 1) {
        // Truncate with ellipsis
        ctx.fillText(line.trimEnd() + '…', x, curY);
        return curY;
      }
      ctx.fillText(line.trimEnd(), x, curY);
      line = word + ' ';
      curY += lineHeight;
      lineCount++;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trimEnd(), x, curY);
  return curY;
}

/**
 * Generates a 1024×768 CanvasTexture styled like a GitHub repo card.
 * @param {object|null} repo  - GitHub repo object (or null / placeholder)
 * @param {number}      index - 0-based monitor index (affects accent color)
 */
export function createMonitorTexture(repo, index = 0) {
  const W = 1024, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Accent colors per monitor
  const ACCENTS = ['#00f5ff', '#bf5fff', '#ff3399'];
  const accent = ACCENTS[index % ACCENTS.length];

  // ── Background ──────────────────────────────────────
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  // Subtle dot grid
  ctx.fillStyle = 'rgba(30,50,80,0.18)';
  for (let x = 20; x < W; x += 36) {
    for (let y = 20; y < H; y += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Title bar ───────────────────────────────────────
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, '#161b22');
  headerGrad.addColorStop(1, '#0d1117');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, 62);

  // Traffic lights
  [['#ff5f57', 22], ['#ffbd2e', 54], ['#28c840', 86]].forEach(([c, x]) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, 31, 9, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'rgba(139,148,158,0.6)';
  ctx.font = '15px "Courier New", monospace';
  ctx.fillText('~/dev/github/JRzo', 114, 37);

  // Active tab
  roundRect(ctx, 260, 10, 190, 42, 6);
  ctx.fillStyle = '#0d1117';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText(`repo ${index + 1} / 3`, 280, 37);

  // ── Repo name ───────────────────────────────────────
  const repoName = repo?.name ?? `project-${index + 1}`;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.font = `bold ${repoName.length > 22 -> 36 : 44}px "Courier New", monospace`;
  const displayName = repoName.length > 28 -> repoName.slice(0, 28) + '…' : repoName;
  ctx.fillText(displayName, 30, 132);
  ctx.shadowBlur = 0;

  // Neon underline
  const titleWidth = ctx.measureText(displayName).width;
  const lineGrad = ctx.createLinearGradient(30, 0, 30 + titleWidth, 0);
  lineGrad.addColorStop(0, accent);
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 145);
  ctx.lineTo(30 + Math.min(titleWidth, W - 60), 145);
  ctx.stroke();

  // ── Language badge ──────────────────────────────────
  const lang = repo?.language ?? '...';
  const langColor = getLangColor(lang);
  roundRect(ctx, 30, 160, lang.length * 13 + 42, 34, 6);
  ctx.fillStyle = '#21262d';
  ctx.fill();
  ctx.strokeStyle = langColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = langColor;
  ctx.beginPath();
  ctx.arc(50, 177, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e6edf3';
  ctx.font = '18px "Courier New", monospace';
  ctx.fillText(lang, 66, 183);

  // ── Stats row ───────────────────────────────────────
  const stats = [
    { emoji: '*', val: repo?.stargazers_count ?? 0, label: 'stars' },
    { emoji: '+', val: repo?.forks_count ?? 0,       label: 'forks' },
    { emoji: 'o', val: repo?.open_issues_count ?? 0,  label: 'issues' },
  ];
  stats.forEach(({ emoji, val, label }, i) => {
    const sx = 30 + i * 195;
    roundRect(ctx, sx, 208, 178, 48, 8);
    ctx.fillStyle = '#21262d';
    ctx.fill();
    ctx.fillStyle = '#e3b341';
    ctx.font = 'bold 19px "Courier New", monospace';
    ctx.fillText(`${emoji} ${val}  ${label}`, sx + 12, 238);
  });

  // ── Description ─────────────────────────────────────
  ctx.fillStyle = '#8b949e';
  ctx.font = '21px "Segoe UI", Arial, sans-serif';
  const desc = repo?.description ?? 'No description provided.';
  wrapText(ctx, desc, 30, 300, W - 60, 30, 4);

  // ── Topics ──────────────────────────────────────────
  const topics = repo?.topics?.slice(0, 5) ?? [];
  if (topics.length > 0) {
    let tx = 30;
    topics.forEach((topic) => {
      const tw = ctx.measureText(`#${topic}`).width + 22;
      roundRect(ctx, tx, 410, tw, 28, 14);
      ctx.fillStyle = 'rgba(56,139,253,0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56,139,253,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#58a6ff';
      ctx.font = '15px "Courier New", monospace';
      ctx.fillText(`#${topic}`, tx + 10, 430);
      tx += tw + 8;
    });
  }

  // ── Last updated ────────────────────────────────────
  if (repo?.updated_at) {
    const date = new Date(repo.updated_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    ctx.fillStyle = '#484f58';
    ctx.font = '15px "Courier New", monospace';
    ctx.fillText(`Updated: ${date}`, 30, 468);
  }

  // ── CRT scan-line overlay ────────────────────────────
  for (let sy = 0; sy < H; sy += 5) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, sy, W, 2);
  }

  // ── CTA Button ──────────────────────────────────────
  roundRect(ctx, 30, 680, 230, 54, 10);
  const btnGrad = ctx.createLinearGradient(30, 680, 260, 734);
  btnGrad.addColorStop(0, '#1f6feb');
  btnGrad.addColorStop(1, '#388bfd');
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.shadowColor = '#1f6feb';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('View on GitHub →', 50, 714);
  ctx.shadowBlur = 0;

  // Monitor index watermark
  ctx.fillStyle = `rgba(255,255,255,0.1)`;
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(`// monitor[${index}]`, W - 165, H - 12);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
