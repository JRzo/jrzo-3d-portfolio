import { describe, it, expect } from 'vitest';
import { ZONES, ZONE_RADIUS } from '../components/World';

// Mirror of the zone detection logic in Scene.jsx
const ZONE_RADIUS_SQ = ZONE_RADIUS * ZONE_RADIUS;

function detectZone(x, z) {
  for (const zone of ZONES) {
    const dx = x - zone.pos[0];
    const dz = z - zone.pos[2];
    if (dx * dx + dz * dz < ZONE_RADIUS_SQ) return zone.id;
  }
  return null;
}

// Lookup helpers
const home     = ZONES.find(z => z.id === 'home');
const projects = ZONES.find(z => z.id === 'projects');
const skills   = ZONES.find(z => z.id === 'skills');
const sports   = ZONES.find(z => z.id === 'sports');
const contact  = ZONES.find(z => z.id === 'contact');

describe('Zone detection', () => {
  it('detects home zone at its center', () => {
    expect(detectZone(home.pos[0], home.pos[2])).toBe('home');
  });

  it('detects home zone near (but within) its radius', () => {
    expect(detectZone(home.pos[0] + ZONE_RADIUS - 1, home.pos[2])).toBe('home');
  });

  it('returns null outside all zones', () => {
    // Point far from any zone center
    expect(detectZone(0, 0)).toBeNull();
  });

  it('detects each zone at its center', () => {
    for (const zone of ZONES) {
      expect(detectZone(zone.pos[0], zone.pos[2])).toBe(zone.id);
    }
  });

  it('returns null exactly at zone boundary (outside)', () => {
    // ZONE_RADIUS away from home center — outside the zone
    expect(detectZone(home.pos[0] + ZONE_RADIUS, home.pos[2])).toBeNull();
  });

  it('detects projects zone at its campus position', () => {
    expect(detectZone(projects.pos[0], projects.pos[2])).toBe('projects');
  });

  it('detects skills zone at its campus position', () => {
    expect(detectZone(skills.pos[0], skills.pos[2])).toBe('skills');
  });

  it('detects sports zone at its campus position', () => {
    expect(detectZone(sports.pos[0], sports.pos[2])).toBe('sports');
  });

  it('detects contact zone at its campus position', () => {
    expect(detectZone(contact.pos[0], contact.pos[2])).toBe('contact');
  });
});

describe('ZONES constant', () => {
  it('has exactly 5 zones', () => {
    expect(ZONES).toHaveLength(5);
  });

  it('all zones have required fields', () => {
    for (const zone of ZONES) {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('label');
      expect(zone).toHaveProperty('icon');
      expect(zone).toHaveProperty('color');
      expect(zone.pos).toHaveLength(3);
    }
  });

  it('zone ids are unique', () => {
    const ids = ZONES.map(z => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
