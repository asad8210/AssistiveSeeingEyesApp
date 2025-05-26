import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.assistiveseeingeyes.app',
  appName: 'Assistive SeeingEyes',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHaptics: {
      enabled: true
    },
    CapacitorCamera: {
      enabled: true
    },
    CapacitorGeolocation: {
      enabled: true
    }
  }
};

export default config;