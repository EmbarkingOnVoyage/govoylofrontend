// Products that aren't built yet each have a "Coming soon" page of their own.
export type ComingSoonFeature = 'Hotels' | 'Flights + Hotels' | 'Voylo AI';

export const COMING_SOON_PATHS: Record<ComingSoonFeature, string> = {
  Hotels: '/hotels',
  'Flights + Hotels': '/flights-hotels',
  'Voylo AI': '/voylo-ai',
};

// The web app registers its router here (setComingSoonNavigator) so shared
// components can open these pages without depending on react-router.
let navigateTo: ((path: string) => void) | null = null;

export function setComingSoonNavigator(navigate: ((path: string) => void) | null): void {
  navigateTo = navigate;
}

export function openComingSoonPage(feature: ComingSoonFeature): void {
  const path = COMING_SOON_PATHS[feature];
  if (navigateTo) {
    navigateTo(path);
  } else {
    window.location.assign(path);
  }
}
