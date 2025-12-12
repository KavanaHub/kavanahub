import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                track: resolve(__dirname, 'track.html'),
                proposal: resolve(__dirname, 'proposal.html'),
                bimbingan: resolve(__dirname, 'bimbingan.html'),
                laporan: resolve(__dirname, 'laporan.html'),
                hasil: resolve(__dirname, 'hasil.html'),
            },
        },
    },
})
