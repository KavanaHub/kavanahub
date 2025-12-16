// ========================================
// DOSEN DASHBOARD COMPONENT (Responsive)
// ========================================

import { dosenAPI } from "../api.js";

// Render dosen dashboard content (responsive)
export async function renderDosenDashboard(container, userData) {
  container.innerHTML = `
    <div class="flex items-center justify-center py-12 sm:py-20">
      <div class="text-center">
        <span class="material-symbols-outlined text-3xl sm:text-4xl text-primary animate-spin">sync</span>
        <p class="text-text-secondary mt-2 text-sm sm:text-base">Memuat data dashboard...</p>
      </div>
    </div>
  `;

  try {
    // Fetch mahasiswa bimbingan
    const mahasiswaResult = await dosenAPI.getMahasiswaBimbingan();
    const mahasiswaList = mahasiswaResult.ok ? mahasiswaResult.data || [] : [];

    // Calculate stats
    const totalMahasiswa = mahasiswaList.length;
    const pendingBimbingan = mahasiswaList.filter((m) => m.pending_count > 0).reduce((acc, m) => acc + m.pending_count, 0);
    const approvedLaporan = mahasiswaList.filter((m) => m.laporan_status === "approved").length;

    container.innerHTML = `
      <!-- Welcome Card -->
      <div class="bg-gradient-to-r from-primary to-primary/70 p-6 lg:p-8 rounded-xl shadow-lg text-white mb-6 lg:mb-8">
        <h2 class="text-xl lg:text-2xl font-bold mb-2">Selamat Datang, ${userData?.nama || "Dosen"}!</h2>
        <p class="text-white/80 text-sm lg:text-base">Kelola bimbingan mahasiswa Anda dari dashboard ini.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <!-- Card 1: Mahasiswa Bimbingan -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-blue-50 text-primary rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">groups</span>
            </div>
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Mahasiswa Bimbingan</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${totalMahasiswa} <span class="text-slate-400 text-base lg:text-lg font-normal">mahasiswa</span></p>
          </div>
        </div>

        <!-- Card 2: Bimbingan Pending -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">pending</span>
            </div>
            ${pendingBimbingan > 0 ? '<span class="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Perlu tindakan</span>' : ""}
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Bimbingan Pending</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${pendingBimbingan} <span class="text-slate-400 text-base lg:text-lg font-normal">permintaan</span></p>
          </div>
        </div>

        <!-- Card 3: Laporan Disetujui -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors sm:col-span-2 lg:col-span-1">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-green-50 text-green-600 rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">verified</span>
            </div>
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Laporan Disetujui</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${approvedLaporan} <span class="text-slate-400 text-base lg:text-lg font-normal">mahasiswa</span></p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Quick Actions -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 class="text-base lg:text-lg font-bold text-text-main mb-4 lg:mb-6">Aksi Cepat</h3>
          <div class="grid grid-cols-2 gap-3 lg:gap-4">
            <a href="/mahasiswa-bimbingan.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors group">
              <div class="p-2 lg:p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">groups</span>
              </div>
              <span class="text-xs lg:text-sm font-medium text-text-main text-center">Lihat Mahasiswa</span>
            </a>
            <a href="/bimbingan-approve.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors group">
              <div class="p-2 lg:p-3 bg-yellow-100 text-yellow-600 rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">check_circle</span>
              </div>
              <span class="text-xs lg:text-sm font-medium text-text-main text-center">Approve Bimbingan</span>
            </a>
            <a href="/laporan-approve.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors group">
              <div class="p-2 lg:p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">grading</span>
              </div>
              <span class="text-xs lg:text-sm font-medium text-text-main text-center">Approve Laporan</span>
            </a>
            <a href="/profile.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors group">
              <div class="p-2 lg:p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">person</span>
              </div>
              <span class="text-xs lg:text-sm font-medium text-text-main text-center">Profil Saya</span>
            </a>
          </div>
        </div>

        <!-- Recent Mahasiswa -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-4 lg:mb-6">
            <h3 class="text-base lg:text-lg font-bold text-text-main">Mahasiswa Bimbingan</h3>
            <a href="/mahasiswa-bimbingan.html" class="text-xs text-primary hover:underline">Lihat Semua</a>
          </div>
          ${mahasiswaList.length > 0
        ? `
          <div class="flex flex-col gap-3 lg:gap-4">
            ${mahasiswaList
          .slice(0, 5)
          .map(
            (m) => `
            <div class="flex gap-3 lg:gap-4 items-center p-3 bg-slate-50 rounded-lg">
              <div class="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm lg:text-base shrink-0">${m.nama?.charAt(0).toUpperCase() || "M"}</div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-text-main text-sm lg:text-base truncate">${m.nama || "Mahasiswa"}</p>
                <p class="text-[10px] lg:text-xs text-text-secondary">${m.track || "Belum ada track"}</p>
              </div>
              ${m.pending_count > 0
                ? `<span class="px-2 py-0.5 lg:py-1 bg-yellow-100 text-yellow-700 text-[10px] lg:text-xs font-bold rounded shrink-0">${m.pending_count} pending</span>`
                : '<span class="px-2 py-0.5 lg:py-1 bg-green-100 text-green-700 text-[10px] lg:text-xs rounded shrink-0">OK</span>'
              }
            </div>
            `
          )
          .join("")}
          </div>
          `
        : `
          <div class="text-center py-6 lg:py-8">
            <span class="material-symbols-outlined text-3xl lg:text-4xl text-slate-300">groups</span>
            <p class="text-text-secondary text-xs lg:text-sm mt-2">Belum ada mahasiswa bimbingan</p>
          </div>
          `
      }
        </div>
      </div>
    `;

    return { pendingBimbingan };
  } catch (error) {
    console.error("Error loading dosen dashboard:", error);
    container.innerHTML = `
      <div class="bg-red-50 p-6 lg:p-8 rounded-xl border border-red-200 text-center">
        <span class="material-symbols-outlined text-3xl lg:text-4xl text-red-400">error</span>
        <h3 class="text-base lg:text-lg font-bold text-red-700 mt-2">Gagal Memuat Dashboard</h3>
        <p class="text-red-600 text-xs lg:text-sm mt-1">${error.message || "Terjadi kesalahan"}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Coba Lagi</button>
      </div>
    `;
    return { pendingBimbingan: 0 };
  }
}
