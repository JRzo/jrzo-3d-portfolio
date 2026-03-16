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

describe('Zone detection', () => {
  it('detects home zone at world origin', () => {
    expect(detectZone(0, 0)).toBe('home');
  });

  it('detects home zone near (but within) its radius', () => {
    expect(detectZone(ZONE_RADIUS - 1, 0)).toBe('home');
  });

  it('returns null outside all zones', () => {
    expect(detectZone(20, 20)).toBeNull();
  });

  it('detects each zone at its center', () => {
    for (const zone of ZONES) {
      expect(detectZone(zone.pos[0], zone.pos[2])).toBe(zone.id);
    }
  });

  it('returns null exactly at zone boundary (outside)', () => {
    // ZONE_RADIUS away from home center — outside the zone
    expect(detectZone(ZONE_RADIUS, 0)).toBeNull();
  });

  it('detects projects zone at x=40', () => {
    expect(detectZone(40, 0)).toBe('projects');
  });

  it('detects skills zone at x=-40', () => {
    expect(detectZone(-40, 0)).toBe('skills');
  });

  it('detects sports zone at z=-40', () => {
    expect(detectZone(0, -40)).toBe('sports');
  });

  it('detects contact zone at z=40', () => {
    expect(detectZone(0, 40)).toBe('contact');
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
