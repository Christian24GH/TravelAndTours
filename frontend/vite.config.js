import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  /** Value depends on frontend serve directory
   *  If app needs to be accessible at http://localhost/TravelAndTour/frontend/ → keep base: '/TravelAndTour/frontend/'.
      if directory is htdocs/dist(http://localhost/) (directly from htdocs/dist) → change base: '/' and rebuild.
   */
  // Sets assets(js/css) url for dist/index.html
  base: '/'
})