import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                // Public pages
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),

                // Mahasiswa pages
                'mahasiswa-dashboard': resolve(__dirname, 'mahasiswa/dashboard.html'),
                'mahasiswa-track': resolve(__dirname, 'mahasiswa/track.html'),
                'mahasiswa-proposal': resolve(__dirname, 'mahasiswa/proposal.html'),
                'mahasiswa-bimbingan': resolve(__dirname, 'mahasiswa/bimbingan.html'),
                'mahasiswa-laporan': resolve(__dirname, 'mahasiswa/laporan.html'),
                'mahasiswa-hasil': resolve(__dirname, 'mahasiswa/hasil.html'),
                'mahasiswa-kelompok': resolve(__dirname, 'mahasiswa/kelompok.html'),

                // Dosen pages
                'dosen-dashboard': resolve(__dirname, 'dosen/dashboard.html'),
                'dosen-mahasiswa-bimbingan': resolve(__dirname, 'dosen/mahasiswa-bimbingan.html'),
                'dosen-bimbingan-approve': resolve(__dirname, 'dosen/bimbingan-approve.html'),
                'dosen-laporan-approve': resolve(__dirname, 'dosen/laporan-approve.html'),

                // Koordinator pages
                'koordinator-dashboard': resolve(__dirname, 'koordinator/dashboard.html'),
                'koordinator-kelola-periode': resolve(__dirname, 'koordinator/kelola-periode.html'),
                'koordinator-validasi-proposal': resolve(__dirname, 'koordinator/validasi-proposal.html'),
                'koordinator-approve-pembimbing': resolve(__dirname, 'koordinator/approve-pembimbing.html'),
                'koordinator-daftar-mahasiswa': resolve(__dirname, 'koordinator/daftar-mahasiswa.html'),
                'koordinator-jadwal-sidang': resolve(__dirname, 'koordinator/jadwal-sidang.html'),

                // Kaprodi pages
                'kaprodi-dashboard': resolve(__dirname, 'kaprodi/dashboard.html'),
                'kaprodi-kelola-koordinator': resolve(__dirname, 'kaprodi/kelola-koordinator.html'),
                'kaprodi-daftar-dosen': resolve(__dirname, 'kaprodi/daftar-dosen.html'),
                'kaprodi-monitoring': resolve(__dirname, 'kaprodi/monitoring.html'),

                // Admin pages
                'admin-dashboard': resolve(__dirname, 'admin/dashboard.html'),
                'admin-kelola-users': resolve(__dirname, 'admin/kelola-users.html'),
                'admin-kelola-dosen': resolve(__dirname, 'admin/kelola-dosen.html'),

                // Shared pages
                'shared-profile': resolve(__dirname, 'shared/profile.html'),
                'shared-settings': resolve(__dirname, 'shared/settings.html'),
            },
        },
    },
})
