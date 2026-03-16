import { ZONES } from '../World';

export default function Navigation({ activeZone, openPanel, onNavClick }) {
  return (
    <nav className="nav-bar">
      {ZONES.map((zone) => (
        <button
          key={zone.id}
          className={`nav-btn ${activeZone === zone.id ? 'active' : ''}`}
          style={activeZone === zone.id ? {
            borderColor: zone.color,
            boxShadow: `0 0 16px ${zone.color}, inset 0 0 10px ${zone.color}22`,
            color: zone.color,
          } : {}}
          onClick={() => onNavClick(zone.id)}
          title={zone.label}
        >
          <span>{zone.icon}</span>
          <span className="nav-tooltip" style={{ borderColor: zone.color, color: zone.color }}>
            {zone.label}
          </span>
        </button>
      ))}

      {/* Controls toggle */}
      <button
        className="nav-btn"
        style={{ marginTop: 8 }}
        onClick={() => onNavClick('controls')}
        title="Controls"
      >
        <span>⌨️</span>
        <span className="nav-tooltip">Controls</span>
      </button>
    </nav>
  );
}
