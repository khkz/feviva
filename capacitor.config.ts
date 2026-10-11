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
};

export default config;
