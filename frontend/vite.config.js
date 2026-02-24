import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
        host: true,
    allowedHosts: [
      "mernstack.kodebloom.com",
      ".trycloudflare.com",
      "localhost"
    ],
    proxy: {
      "/api": {
        target: "https://api.kodebloom.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
