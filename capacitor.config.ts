import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.65739c50950f4a129aa8e5855fcd79cd',
  appName: 'My Pilates Plan',
  webDir: 'dist',
  server: {
    url: 'https://65739c50-950f-4a12-9aa8-e5855fcd79cd.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    // Allow rotation on iOS
    orientation: 'all',
  },
  android: {
    // Allow rotation on Android
    orientation: 'unspecified',
  },
};

export default config;
