import type { MotionProps } from 'motion/react';

const ease = 'easeOut';

export const motionPresets = {
  page: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.18, ease },
  },
  listItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease },
  },
  pop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease },
  },
} as const satisfies Record<string, MotionProps>;
