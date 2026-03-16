import { useRef, useCallback } from 'react';

export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    id: 'FIRST_STEPS',
    icon: '🚶',
    name: 'First Steps',
    desc: 'Started exploring the campus',
  },
  VISIT_PROJECTS: {
    id: 'VISIT_PROJECTS',
    icon: '💻',
    name: 'Code Explorer',
    desc: 'Visited Butler Library — Projects',
  },
  VISIT_SKILLS: {
    id: 'VISIT_SKILLS',
    icon: '⚡',
    name: 'Skill Check',
    desc: 'Visited Pupin Hall — Skills',
  },
  VISIT_SPORTS: {
    id: 'VISIT_SPORTS',
    icon: '🏀',
    name: 'Game On',
    desc: 'Visited Dodge Center — Sports & Culture',
  },
  VISIT_CONTACT: {
    id: 'VISIT_CONTACT',
    icon: '📡',
    name: 'Ping Sent',
    desc: 'Visited Lerner Hall — Contact',
  },
  VISIT_HOME: {
    id: 'VISIT_HOME',
    icon: '🏛️',
    name: 'Home Base',
    desc: 'Visited Low Library — Home',
  },
  ALL_ZONES: {
    id: 'ALL_ZONES',
    icon: '🌍',
    name: 'Campus Tour',
    desc: 'Visited all 5 zones',
  },
  SPRINTER: {
    id: 'SPRINTER',
    icon: '💨',
    name: 'Sprinter',
    desc: 'Ran at full speed across campus',
  },
};

const ZONE_ACHIEVEMENTS = {
  home:     'VISIT_HOME',
  projects: 'VISIT_PROJECTS',
  skills:   'VISIT_SKILLS',
  sports:   'VISIT_SPORTS',
  contact:  'VISIT_CONTACT',
};

const ZONE_SET = new Set(['home', 'projects', 'skills', 'sports', 'contact']);

export function useAchievements(onUnlock) {
  const unlocked     = useRef(new Set());
  const visitedZones = useRef(new Set());
  const hasWalked    = useRef(false);

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
    if (ZONE_SET.size === visitedZones.current.size &&
        [...ZONE_SET].every(z => visitedZones.current.has(z))) {
      unlock('ALL_ZONES');
    }
  }, [unlock]);

  const onWalk = useCallback(() => {
    if (!hasWalked.current) {
      hasWalked.current = true;
      unlock('FIRST_STEPS');
    }
  }, [unlock]);

  const onSprintUnlock = useCallback(() => {
    unlock('SPRINTER');
  }, [unlock]);

  return { onZoneEnter, onWalk, onSprintUnlock };
}
