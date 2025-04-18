import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    optimizeDeps: {
        include: ['axios']
    },
    build: {
        rollupOptions: {
            external: [ "sqlite3" ]
        }
    }
});
