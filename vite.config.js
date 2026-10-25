import { defineConfig } from 'vite'

export default defineConfig({
    base: '/tsifrik01/',
    build: {
        outDir: 'dist',
        assetsInlineLimit: 0,
    },
})
