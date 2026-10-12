import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell (iOS / Android) for El Rugido.
 * The web app is built with `npm run build` into `dist/` and copied into the
 * native projects with `npx cap sync`. See MOBILE.md.
 */
const config: CapacitorConfig = {
  appId: "com.elrugido.app",
  appName: "El Rugido",
  webDir: "dist",
  // Matches the PWA background so there is no white flash while the WebView loads.
  backgroundColor: "#0f0f23",
  experimental: {
    ios: {
      // capacitor-plugin-playlist needs iOS 18, and `.iOS(.v18)` needs Swift tools 6.0 in the
      // generated ios/App/CapApp-SPM/Package.swift (the CLI writes 5.9 by default).
      spm: { swiftToolsVersion: "6.0" },
    },
  },
};

export default config;
