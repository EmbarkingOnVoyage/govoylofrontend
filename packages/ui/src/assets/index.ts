// 1. Static Import for Web: Vite will resolve this path cleanly at build time
import webBackground from './images/bg-balloon.png';

// 2. Runtime Environment Detection
const isWebRuntime = typeof window !== 'undefined';

export const CoreImages = {
  // 3. Adaptive Property Resolver Contract
  onboardingBackground: isWebRuntime 
    ? webBackground 
    : require('./images/bg-balloon.png'), // Safely hidden from Vite's runtime execution path
};

export const CoreAnimations = {
  // Future Lottie assets will go here
};
