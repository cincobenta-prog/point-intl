/**
 * Benta's Funeral Home (BFH OS) - Service Worker Registration Helper
 */

export function registerPwaServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.info('[BFH PWA] New operating system version available.');
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('[BFH PWA] Service worker registration failed:', error);
        });
    });
  }
}
