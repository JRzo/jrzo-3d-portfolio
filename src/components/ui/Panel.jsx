import { useEffect, useRef } from 'react';
import { useGitHub } from '../../hooks/useGitHub';

/* ── Panel shell ─────────────────────────────────────────── */
export default function Panel({ zone, onClose }) {
  const open = Boolean(zone);

  return (
    <aside className={`zone-panel ${open ? 'open' : ''}`}>
      {open && (
        <>
          <PanelHeader zone={zone} onClose={onClose} />
          <div className="panel-body">
            <PanelContent zone={zone} />
          </div>
        </>
      )}
    </aside>
  );
}

function PanelHeader({ zone, onClose }) {
  const ZONE_META = {
    home:     { label: 'Low Library',    color: '#f4a261', icon: '🏛️' },
    projects: { label: 'Butler Library', color: '#9b5de5', icon: '📚' },
    skills:   { label: 'Pupin Hall',     color: '#06d6a0', icon: '⚡' },
    sports:   { label: 'Dodge / Field',  color: '#ef476f', icon: '🏀' },
    contact:  { label: 'Lerner Hall',    color: '#118ab2', icon: '📡' },
    controls: { label: 'Controls',       color: '#58a6ff', icon: '⌨️' },
  };
  const meta = ZONE_META[zone] || { label: zone, color: '#fff', icon: '•' };

  return (
    <div className="panel-header">
      <div className="panel-title" style={{ color: meta.color }}>
        {meta.icon} {meta.label}
      </div>
      <button className="panel-close" onClick={onClose}>✕</button>
    </div>
  );
}

/* ── Content router ──────────────────────────────────────── */
function PanelContent({ zone }) {
  switch (zone) {
    case 'home':     return <HomeContent />;
    case 'projects': return <ProjectsContent />;
    case 'skills':   return <SkillsContent />;
    case 'sports':   return <SportsContent />;
    case 'contact':  return <ContactContent />;
    case 'controls': return <ControlsContent />;
    default:         return null;
  }
}

/* ── Home ────────────────────────────────────────────────── */
function HomeContent() {
  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#00f5ff', fontFamily: "'Amatic SC', cursive", letterSpacing: 2 }}>
        Julio Rodriguez
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: 'uppercase' }}>
        AI Data Engineer II
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>
        I build data pipelines, AI systems, and interactive experiences.
        Passionate about turning raw data into insights and crafting
        immersive digital worlds.
      </p>

      <SectionTitle>Currently</SectionTitle>
      <Tag color="#00f5ff">AI Data Engineer II</Tag>
      <Tag color="#bf5fff">ML Pipelines</Tag>
      <Tag color="#00ff88">Data Architecture</Tag>

      <div style={{ marginTop: 24 }}>
        <SectionTitle>Fun Facts</SectionTitle>
        <ul style={{ paddingLeft: 18, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 2 }}>
          <li>🇩🇴 Dominican Republic proud</li>
          <li>🏀 NBA fanatic</li>
          <li>⚾ Baseball + ⚽ Soccer enjoyer</li>
          <li>🎮 Gamer at heart</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Projects ─────────────────────────────────────────────── */
function ProjectsContent() {
  const { repos, loading } = useGitHub('JRzo', 6);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
      Loading repos…
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>
        GITHUB / JRZO
      </p>
      {repos.map((repo) => (
        <RepoCard key={repo.name} repo={repo} />
      ))}
    </div>
  );
}

function RepoCard({ repo }) {
  const LANG_COLORS = { Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Jupyter: '#DA5B0B', Shell: '#89e051', Go: '#00ADD8', default: '#858585' };
  const lc = LANG_COLORS[repo.language] || LANG_COLORS.default;
  const url = repo.html_url || repo.url || '#';
  const stars = repo.stargazers_count ?? repo.stars ?? 0;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="link-btn"
      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#bf5fff' }}>
          {repo.name}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
          ★ {stars}
        </span>
      </div>
      {repo.description && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
          {repo.description}
        </p>
      )}
      {repo.language && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: lc, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
            {repo.language}
          </span>
        </div>
      )}
    </a>
  );
}

/* ── Skills ──────────────────────────────────────────────── */
const SKILL_GROUPS = [
  {
    title: 'Data & AI',
    color: '#00ff88',
    skills: [
      { name: 'Python',        pct: 95 },
      { name: 'Apache Spark',  pct: 88 },
      { name: 'Databricks',    pct: 85 },
      { name: 'dbt',           pct: 82 },
      { name: 'ML / PyTorch',  pct: 78 },
    ],
  },
  {
    title: 'Engineering',
    color: '#00f5ff',
    skills: [
      { name: 'SQL / duckDB',  pct: 92 },
      { name: 'Airflow',       pct: 80 },
      { name: 'Kafka',         pct: 74 },
      { name: 'Docker / K8s',  pct: 72 },
      { name: 'AWS',           pct: 78 },
    ],
  },
  {
    title: 'Front-End',
    color: '#bf5fff',
    skills: [
      { name: 'React',         pct: 82 },
      { name: 'Three.js',      pct: 72 },
      { name: 'TypeScript',    pct: 70 },
      { name: 'Next.js',       pct: 68 },
    ],
  },
];

function SkillsContent() {
  return (
    <div>
      {SKILL_GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: 28 }}>
          <SectionTitle color={group.color}>{group.title}</SectionTitle>
          {group.skills.map((s) => (
            <SkillBar key={s.name} name={s.name} pct={s.pct} color={group.color} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkillBar({ name, pct, color }) {
  const fillRef = useRef();
  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = pct + '%';
    }, 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="skill-bar">
      <div className="skill-bar-label">
        <span style={{ fontSize: 13 }}>{name}</span>
        <span style={{ fontSize: 12, color: color, fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          ref={fillRef}
          className="skill-bar-fill"
          style={{ width: 0, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

/* ── Sports ──────────────────────────────────────────────── */
function SportsContent() {
  return (
    <div>
      <SectionTitle color="#ff6a00">Favourites</SectionTitle>

      <SportCard icon="🏀" sport="NBA" detail="New York Knicks" color="#ff6a00" />
      <SportCard icon="⚾" sport="Baseball" detail="New York Yankees" color="#1e40af" />
      <SportCard icon="⚽" sport="Soccer" detail="Barcelona / La Selección" color="#15803d" />

      <div style={{ marginTop: 24 }}>
        <SectionTitle color="#007aff">Culture</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CultureCard
            flag="🇩🇴"
            title="República Dominicana"
            subtitle="Santiago de los Caballeros"
          />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Born and raised with merengue, bachata, and the hustle of Caribbean excellence.
            The island is the backbone of everything I am.
          </p>
        </div>
      </div>
    </div>
  );
}

function SportCard({ icon, sport, detail, color }) {
  return (
    <div className="link-btn" style={{ pointerEvents: 'none' }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color }}>{sport}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

function CultureCard({ flag, title, subtitle }) {
  return (
    <div className="link-btn" style={{ pointerEvents: 'none' }}>
      <span style={{ fontSize: 32 }}>{flag}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}

/* ── Contact ──────────────────────────────────────────────── */
function ContactContent() {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.7 }}>
        Available for freelance, collaborations, and full-time opportunities.
        Let's build something extraordinary.
      </p>

      <SectionTitle color="#ff3399">Reach Out</SectionTitle>

      <a href="https://linkedin.com/in/jrzo" target="_blank" rel="noreferrer" className="link-btn">
        <span style={{ fontSize: 20 }}>💼</span>
        <div>
          <div style={{ fontWeight: 600, color: '#0077b5' }}>LinkedIn</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>linkedin.com/in/jrzo</div>
        </div>
      </a>

      <a href="https://github.com/JRzo" target="_blank" rel="noreferrer" className="link-btn">
        <span style={{ fontSize: 20 }}>🐙</span>
        <div>
          <div style={{ fontWeight: 600, color: '#e6edf3' }}>GitHub</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>github.com/JRzo</div>
        </div>
      </a>

      <div className="link-btn" style={{ cursor: 'default', pointerEvents: 'none' }}>
        <span style={{ fontSize: 20 }}>📧</span>
        <div>
          <div style={{ fontWeight: 600, color: '#ff3399' }}>Email</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Available on LinkedIn</div>
        </div>
      </div>
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────── */
function ControlsContent() {
  const rows = [
    { key: 'W / ↑',      desc: 'Walk forward' },
    { key: 'S / ↓',      desc: 'Walk backward' },
    { key: 'A / ←',      desc: 'Turn left' },
    { key: 'D / →',      desc: 'Turn right' },
    { key: 'Shift',       desc: 'Run' },
    { key: 'Space',       desc: 'Jump' },
    { key: 'E or Click',  desc: 'Enter / close zone' },
    { key: 'ESC',         desc: 'Close panel' },
  ];
  return (
    <div>
      <SectionTitle color="#58a6ff">Keyboard</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {rows.map(({ key, desc }) => (
            <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <td style={{ padding: '10px 0', paddingRight: 16 }}>
                <kbd style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 5, padding: '2px 8px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                }}>{key}</kbd>
              </td>
              <td style={{ padding: '10px 0', color: 'rgba(255,255,255,0.55)' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Shared helpers ──────────────────────────────────────── */
function SectionTitle({ children, color = 'rgba(255,255,255,0.35)' }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: 3,
      textTransform: 'uppercase', color, marginBottom: 12, marginTop: 6,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {children}
    </p>
  );
}

function Tag({ children, color }) {
  return (
    <span className="chip" style={{ borderColor: color + '44', color, marginRight: 6, marginBottom: 6 }}>
      {children}
    </span>
  );
}
