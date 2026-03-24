import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  server: {
    proxy: {
      '/api/': 'http://localhost:5000',
      '/socket.io/': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
});




