import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// ── Update these with your real details ──────────────────────────
const PROFILE = {
  linkedIn: 'https://www.linkedin.com/in/YOUR-PROFILE-HERE',
  roles: [
    {
      title: 'AI Data Engineer II',
      company: 'Current Company',
      period: '2023 – Present',
      bullets: [
        'Architecting ML pipelines & LLM systems at scale',
        'RAG system design and LLM fine-tuning workflows',
        'Real-time streaming with Apache Kafka & Spark',
        'Cloud infra on AWS (S3, Glue, Lambda, SageMaker)',
      ],
    },
    {
      title: 'Data Engineer I',
      company: 'Previous Company',
      period: '2021 – 2023',
      bullets: [
        'ETL orchestration with Apache Airflow & dbt',
        'Optimised SQL/NoSQL query performance 40 %+',
        'Data quality monitoring & SLA alerting',
      ],
    },
  ],
  skills: [
    'Python', 'SQL', 'Spark', 'dbt', 'Airflow',
    'Kafka', 'LLMs', 'RAG', 'AWS', 'GCP',
    'Docker', 'K8s', 'FastAPI', 'Postgres',
  ],
};

// Neon border edge helper
function BorderEdge({ pos, args, color = '#00ff88' }) {
  return (
    <mesh position={pos}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={4}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function Terminal() {
  const groupRef = useRef();

  // Slow float + gentle sway
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = 1.65 + Math.sin(t * 0.75) * 0.028;
    groupRef.current.rotation.y = -0.42 + Math.sin(t * 0.28) * 0.04;
  });

  const W = 1.72, H = 1.18;

  return (
    <group ref={groupRef} position={[2.95, 1.65, -1.6]} rotation={[0, -0.42, 0]}>
      {/* Translucent panel backing */}
      <mesh>
        <boxGeometry args={[W, H, 0.015]} />
        <meshStandardMaterial
          color="#002211"
          emissive="#00ff88"
          emissiveIntensity={0.04}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Corner accents */}
      {[
        [-W / 2, H / 2, 0],
        [ W / 2, H / 2, 0],
        [-W / 2,-H / 2, 0],
        [ W / 2,-H / 2, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Neon border */}
      <BorderEdge pos={[0,  H / 2, 0]} args={[W, 0.012, 0.012]} />
      <BorderEdge pos={[0, -H / 2, 0]} args={[W, 0.012, 0.012]} />
      <BorderEdge pos={[-W / 2, 0, 0]} args={[0.012, H, 0.012]} />
      <BorderEdge pos={[ W / 2, 0, 0]} args={[0.012, H, 0.012]} />

      {/* HTML holographic UI — rendered in 3D space by Drei */}
      <Html
        transform
        distanceFactor={1.55}
        position={[0, 0, 0.016]}
        style={{ width: '340px', userSelect: 'none', pointerEvents: 'auto' }}
        occlude={false}
      >
        <div
          style={{
            background: 'rgba(0, 8, 4, 0.94)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '5px',
            padding: '13px 16px',
            color: '#00ff88',
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            lineHeight: '1.55',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 0 24px rgba(0,255,136,0.15), inset 0 0 40px rgba(0,255,136,0.02)',
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              borderBottom: '1px solid rgba(0,255,136,0.2)',
              paddingBottom: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px' }}>
                ◈ JRZO.DEV
              </span>
              <span style={{ color: 'rgba(0,255,136,0.4)', fontSize: '10px', marginLeft: '8px' }}>
                v{new Date().getFullYear()}
              </span>
            </div>
            <div style={{ color: 'rgba(0,255,136,0.3)', fontSize: '10px' }}>CAREER HUD</div>
          </div>

          {/* ── Roles ── */}
          {PROFILE.roles.map((role, ri) => (
            <div key={ri} style={{ marginBottom: '10px', opacity: ri === 0 ? 1 : 0.78 }}>
              <div style={{ color: ri === 0 ? '#7fff00' : '#4caf8a', fontWeight: 'bold', marginBottom: '3px' }}>
                {ri === 0 ? '▶' : '◻'} {role.title}
              </div>
              <div style={{ color: 'rgba(0,255,136,0.5)', fontSize: '10px', marginBottom: '4px' }}>
                {role.company} · {role.period}
              </div>
              {role.bullets.map((b, bi) => (
                <div
                  key={bi}
                  style={{
                    color: ri === 0 ? 'rgba(200,255,200,0.85)' : 'rgba(180,255,180,0.6)',
                    paddingLeft: '10px',
                    fontSize: '10px',
                    lineHeight: '1.5',
                  }}
                >
                  · {b}
                </div>
              ))}
            </div>
          ))}

          {/* ── Skills ── */}
          <div
            style={{
              borderTop: '1px solid rgba(0,255,136,0.2)',
              paddingTop: '8px',
              marginBottom: '11px',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '6px', color: '#00ff88' }}>
              ⬡ STACK
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {PROFILE.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    border: '1px solid rgba(0,255,136,0.25)',
                    borderRadius: '3px',
                    padding: '1px 7px',
                    fontSize: '9px',
                    color: '#7fff00',
                    letterSpacing: '0.5px',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ── LinkedIn CTA ── */}
          <button
            onClick={() => {
              const w = window.open(PROFILE.linkedIn, '_blank', 'noopener,noreferrer');
              if (w) w.opener = null;
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(0,119,181,0.28), rgba(0,119,181,0.1))',
              border: '1px solid rgba(0,119,181,0.55)',
              borderRadius: '4px',
              color: '#58a6ff',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '8px 0',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,119,181,0.38)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0,119,181,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(0,119,181,0.28), rgba(0,119,181,0.1))';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ⬡ CONNECT ON LINKEDIN →
          </button>
        </div>
      </Html>
    </group>
  );
}
