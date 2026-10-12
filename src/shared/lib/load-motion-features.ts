export const loadMotionFeatures = () =>
  import('./motion-features').then((module) => module.default);