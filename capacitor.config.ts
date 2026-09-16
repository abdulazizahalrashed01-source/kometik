import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kometik.app",
  appName: "Kometik",

  webDir: "capacitor-web",

  server: {
    url: "http://192.168.1.110:3000",
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;