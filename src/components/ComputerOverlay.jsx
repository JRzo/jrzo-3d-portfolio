import { useState, useEffect } from 'react';

const LANG_COLORS = {
  JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5',
  Rust:'#dea584', Go:'#00ADD8', Java:'#b07219', 'C++':'#f34b7d',
  CSS:'#563d7c', HTML:'#e34c26', Shell:'#89e051', Ruby:'#701516',
};
function langColor(l) { return LANG_COLORS[l] ?? '#8b949e'; }

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  if (d < 30)  return `${d} days ago`;
  const m = Math.floor(d / 30);
  if (m < 12)  return `${m} mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

// ── Repo card ─────────────────────────────────────────────────────
function RepoCard({ repo, index, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => {
        const w = window.open(repo.html_url, '_blank', 'noopener,noreferrer');
        if (w) w.opener = null;
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(30,40,60,0.95)' : 'rgba(13,17,23,0.95)',
        border: `1px solid ${hovered ? '#58a6ff' : 'rgba(48,54,61,0.8)'}`,
        borderRadius: '8px',
        padding: '18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 0 20px rgba(88,166,255,0.2)' : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${index * 60}ms`,
        transitionProperty: 'opacity, transform, background, border, box-shadow',
        transitionDuration: '0.35s',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Repo name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#58a6ff">
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
        </svg>
        <span style={{ color: '#58a6ff', fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.3px' }}>
          {repo.name}
        </span>
        {repo.fork && (
          <span style={{ color: '#8b949e', fontSize: '11px', border: '1px solid #30363d', borderRadius: '10px', padding: '0 6px' }}>fork</span>
        )}
      </div>

      {/* Description */}
      <p style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.5', margin: 0, minHeight: '36px' }}>
        {repo.description || 'No description provided.'}
      </p>

      {/* Topics */}
      {repo.topics?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {repo.topics.slice(0, 4).map((t) => (
            <span key={t} style={{
              background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.3)',
              borderRadius: '10px', padding: '1px 8px', fontSize: '11px', color: '#58a6ff',
            }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#8b949e', marginTop: 'auto' }}>
        {repo.language && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: langColor(repo.language), display: 'inline-block' }} />
            {repo.language}
          </span>
        )}
        <span>⭐ {repo.stargazers_count}</span>
        <span>⑂ {repo.forks_count}</span>
        {repo.updated_at && <span style={{ marginLeft: 'auto', color: '#484f58' }}>Updated {timeAgo(repo.updated_at)}</span>}
      </div>
    </div>
  );
}

// ── Main overlay ──────────────────────────────────────────────────
export default function ComputerOverlay({ onClose }) {
  const [repos, setRepos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter]   = useState('');
  const [activeTab, setActiveTab] = useState('repos');

  // Fade in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Fetch repos (up to 9 for the full desktop view)
  useEffect(() => {
    fetch('https://api.github.com/users/JRzo/repos?sort=updated&per_page=9')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRepos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 400);
  }

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(8px)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* ── OS Title bar ── */}
      <div style={{
        background: '#161b22', borderBottom: '1px solid #30363d',
        padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px',
        userSelect: 'none',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: '7px' }}>
          <div onClick={handleClose} style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57', cursor: 'pointer' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* GitHub icon + title */}
        <svg width="18" height="18" viewBox="0 0 16 16" fill="#8b949e" style={{ marginLeft: 8 }}>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span style={{ color: '#e6edf3', fontSize: '13px', fontWeight: 600 }}>JRzo — GitHub Portfolio</span>

        {/* Search */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            placeholder="Filter repositories…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px',
              color: '#e6edf3', padding: '5px 12px', fontSize: '12px', outline: 'none', width: '220px',
            }}
          />
          <button onClick={handleClose} style={{
            background: 'rgba(248,81,73,0.15)', border: '1px solid rgba(248,81,73,0.4)',
            borderRadius: '6px', color: '#f85149', cursor: 'pointer',
            padding: '5px 14px', fontSize: '12px', fontWeight: 600,
          }}>✕ ESC</button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #21262d', display: 'flex', padding: '0 18px' }}>
        {['repos', 'profile'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeTab === tab ? '#e6edf3' : '#8b949e',
            padding: '12px 16px', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
            borderBottom: activeTab === tab ? '2px solid #f78166' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{tab}</button>
        ))}
        {!loading && (
          <span style={{ marginLeft: 'auto', alignSelf: 'center', color: '#8b949e', fontSize: '12px' }}>
            {filtered.length} repositories
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {activeTab === 'repos' && (
          <>
            {loading ? (
              <div style={{ color: '#8b949e', textAlign: 'center', marginTop: '60px', fontSize: '14px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⟳</div>
                Fetching repositories…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ color: '#8b949e', textAlign: 'center', marginTop: '60px' }}>No repos match your filter.</div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}>
                {filtered.map((repo, i) => (
                  <RepoCard key={repo.id} repo={repo} index={i} visible={visible} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: '680px', margin: '0 auto', color: '#e6edf3' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '28px' }}>
              {/* Avatar placeholder */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f5ff, #bf5fff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 'bold', color: '#000',
              }}>JR</div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>JRzo</div>
                <div style={{ color: '#8b949e', fontSize: '14px', marginBottom: '8px' }}>AI Data Engineer II</div>
                <a href="https://github.com/JRzo" target="_blank" rel="noreferrer"
                  style={{ color: '#58a6ff', fontSize: '13px', textDecoration: 'none' }}>
                  github.com/JRzo ↗
                </a>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: 'Repositories', val: repos.length + '+' },
                { label: 'Total Stars', val: repos.reduce((a, r) => a + r.stargazers_count, 0) },
                { label: 'Languages', val: [...new Set(repos.map((r) => r.language).filter(Boolean))].length },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  background: '#161b22', border: '1px solid #30363d', borderRadius: '8px',
                  padding: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#58a6ff' }}>{val}</div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Language breakdown */}
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', color: '#e6edf3' }}>Top Languages</div>
              {[...new Set(repos.map((r) => r.language).filter(Boolean))].map((lang) => {
                const count = repos.filter((r) => r.language === lang).length;
                const pct   = Math.round((count / repos.length) * 100);
                return (
                  <div key={lang} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: langColor(lang), display: 'inline-block' }} />
                        {lang}
                      </span>
                      <span style={{ color: '#8b949e', fontSize: '12px' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: '#21262d', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: langColor(lang), borderRadius: 2, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Taskbar ── */}
      <div style={{
        background: '#161b22', borderTop: '1px solid #30363d',
        padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#8b949e',
      }}>
        <span style={{ color: '#00f5ff' }}>●</span>
        <span>Connected to GitHub API</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>{repos.length} repos loaded</span>
        <span style={{ marginLeft: 'auto' }}>Press <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '3px', padding: '1px 6px', color: '#e6edf3' }}>ESC</kbd> to exit</span>
      </div>
    </div>
  );
}
