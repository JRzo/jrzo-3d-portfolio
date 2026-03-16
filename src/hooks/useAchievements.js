import { useRef, useCallback } from 'react';

export const ACHIEVEMENTS = {
  FIRST_DRIVE: {
    id: 'FIRST_DRIVE',
    icon: '🚗',
    name: 'On the Road',
    desc: 'Started driving for the first time',
  },
  VISIT_PROJECTS: {
    id: 'VISIT_PROJECTS',
    icon: '💻',
    name: 'Code Explorer',
    desc: 'Visited the Projects zone',
  },
  VISIT_SKILLS: {
    id: 'VISIT_SKILLS',
    icon: '⚡',
    name: 'Skill Check',
    desc: 'Visited the Skills zone',
  },
  VISIT_SPORTS: {
    id: 'VISIT_SPORTS',
    icon: '🏀',
    name: 'Game On',
    desc: 'Visited the Sports & Culture zone',
  },
  VISIT_CONTACT: {
    id: 'VISIT_CONTACT',
    icon: '📡',
    name: 'Ping Sent',
    desc: 'Visited the Contact zone',
  },
  VISIT_HOME: {
    id: 'VISIT_HOME',
    icon: '🏠',
    name: 'Home Base',
    desc: 'Visited the Home zone',
  },
  ALL_ZONES: {
    id: 'ALL_ZONES',
    icon: '🌍',
    name: 'World Explorer',
    desc: 'Visited all 5 zones',
  },
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    icon: '🏎️',
    name: 'Speed Demon',
    desc: 'Drove at full speed',
  },
};

const ZONE_ACHIEVEMENTS = {
  home: 'VISIT_HOME',
  projects: 'VISIT_PROJECTS',
  skills: 'VISIT_SKILLS',
  sports: 'VISIT_SPORTS',
  contact: 'VISIT_CONTACT',
};

const ZONE_SET = new Set(['home', 'projects', 'skills', 'sports', 'contact']);

export function useAchievements(onUnlock) {
  const unlocked = useRef(new Set());
  const visitedZones = useRef(new Set());
  const hasDriven = useRef(false);

  const unlock = useCallback((id) => {
    if (unlocked.current.has(id)) return;
    unlocked.current.add(id);
    const achievement = ACHIEVEMENTS[id];
    if (achievement) onUnlock?.(achievement);
  }, [onUnlock]);

  const onZoneEnter = useCallback((zone) => {
    const achId = ZONE_ACHIEVEMENTS[zone];
    if (achId) unlock(achId);

    visitedZones.current.add(zone);
    // Check if all zones visited
    if (ZONE_SET.size === visitedZones.current.size &&
        [...ZONE_SET].every(z => visitedZones.current.has(z))) {
      unlock('ALL_ZONES');
    }
  }, [unlock]);

  const onDrive = useCallback(() => {
    if (!hasDriven.current) {
      hasDriven.current = true;
      unlock('FIRST_DRIVE');
    }
  }, [unlock]);

  const onSpeedDemon = useCallback(() => {
    unlock('SPEED_DEMON');
  }, [unlock]);

  return { onZoneEnter, onDrive, onSpeedDemon };
}
