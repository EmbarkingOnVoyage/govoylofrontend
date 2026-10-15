// "Coming soon" for web features that aren't built yet: a short toast at the
// bottom of the screen. Plain DOM so any component can call it without a
// provider; a second call replaces the first.
const TOAST_ID = 'govoylo-coming-soon-toast';

export function showComingSoon(feature: string): void {
  if (typeof document === 'undefined') return;
  document.getElementById(TOAST_ID)?.remove();

  const toast = document.createElement('div');
  toast.id = TOAST_ID;
  toast.setAttribute('role', 'status');
  toast.textContent = `Coming soon: ${feature} will be available shortly.`;
  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    bottom: '32px',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    maxWidth: 'calc(100vw - 32px)',
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#182339',
    color: '#FFFFFF',
    font: '500 14px/20px Inter, system-ui, sans-serif',
    boxShadow: '0 6px 20px rgba(24, 35, 57, 0.25)',
    transition: 'opacity 200ms ease',
    opacity: '1',
  });
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    window.setTimeout(() => toast.remove(), 220);
  }, 2500);
}
