// ========================================
// MAHASISWA DASHBOARD COMPONENT (Responsive)
// ========================================

import { mahasiswaAPI } from "../api.js";
import { getTrackDisplayName } from "../utils/formatUtils.js";

// Helper function to format date
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Render mahasiswa dashboard content (responsive)
export async function renderMahasiswaDashboard(container, userData) {
  // Show loading state
  container.innerHTML = `
    <div class="flex items-center justify-center py-12 sm:py-20">
      <div class="text-center">
        <span class="material-symbols-outlined text-3xl sm:text-4xl text-primary animate-spin">sync</span>
        <p class="text-text-secondary mt-2 text-sm sm:text-base">Memuat data dashboard...</p>
      </div>
    </div>
  `;

  try {
    // Fetch bimbingan data
    const bimbinganResult = await mahasiswaAPI.getMyBimbingan();
    const bimbinganList = bimbinganResult.ok ? bimbinganResult.data || [] : [];

    // Count approved bimbingan
    const bimbinganApproved = bimbinganList.filter((b) => b.status === "approved").length;
    const bimbinganPending = bimbinganList.filter((b) => b.status === "pending").length;

    // Get data from userData (fetched on init)
    const proposalStatus = userData?.proposal_status || null;
    const track = userData?.track || null;
    const dosenNama = userData?.dosen_nama || null;
    const dosenNama2 = userData?.dosen_nama_2 || null;
    const laporanStatus = userData?.laporan_status || null;
    const sidangStatus = userData?.sidang_status || null;
    const judul = userData?.judul || null;

    // Calculate progress percentage
    let progress = 0;
    let progressSteps = { proposal: false, bimbingan: false, laporan: false, sidang: false };

    if (proposalStatus === "approved") {
      progress += 25;
      progressSteps.proposal = true;
    }
    if (bimbinganApproved >= 8) {
      progress += 25;
      progressSteps.bimbingan = true;
    } else if (bimbinganApproved > 0) {
      progress += Math.floor((bimbinganApproved / 8) * 25);
    }
    if (laporanStatus === "approved") {
      progress += 25;
      progressSteps.laporan = true;
    }
    if (sidangStatus === "completed") {
      progress += 25;
      progressSteps.sidang = true;
    }

    // Get proposal status display
    const getProposalStatusDisplay = (status) => {
      if (status === "approved") return { text: "Disetujui", color: "green", icon: "check_circle" };
      if (status === "pending") return { text: "Pending", color: "yellow", icon: "pending" };
      if (status === "rejected") return { text: "Ditolak", color: "red", icon: "cancel" };
      return { text: "Belum Submit", color: "slate", icon: "draft" };
    };
    const proposalDisplay = getProposalStatusDisplay(proposalStatus);

    container.innerHTML = `
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Card 1: Status Proposal -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-${proposalDisplay.color}-50 text-${proposalDisplay.color}-600 rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">${proposalDisplay.icon}</span>
            </div>
            <a href="/proposal.html" class="text-xs text-primary hover:underline">Lihat</a>
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Status Proposal</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${proposalDisplay.text}</p>
          </div>
        </div>

        <!-- Card 2: Bimbingan -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-blue-50 text-primary rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">forum</span>
            </div>
            ${bimbinganPending > 0 ? `<span class="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">${bimbinganPending} pending</span>` : ""}
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Bimbingan Selesai</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${bimbinganApproved} <span class="text-slate-400 text-base lg:text-lg font-normal">/ 8 Sesi</span></p>
          </div>
        </div>

        <!-- Card 3: Track -->
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 lg:gap-3 group hover:border-primary/30 transition-colors sm:col-span-2 lg:col-span-1">
          <div class="flex justify-between items-start">
            <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <span class="material-symbols-outlined text-[20px] lg:text-[24px]">work</span>
            </div>
            <a href="/mahasiswa/track.html" class="text-xs text-primary hover:underline">Ubah</a>
          </div>
          <div>
            <p class="text-text-secondary text-xs lg:text-sm font-medium">Track Aktif</p>
            <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">${track ? getTrackDisplayName(track) : "Belum dipilih"}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <!-- Progress Card -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div class="flex flex-col">
                <h3 class="text-text-main text-base lg:text-lg font-bold">Progres Bimbingan</h3>
                ${judul ? `<p class="text-text-secondary text-xs lg:text-sm truncate max-w-[250px] sm:max-w-none">Judul: <span class="font-semibold text-primary">${judul}</span></p>` : '<p class="text-text-secondary text-xs lg:text-sm">Belum ada judul proyek</p>'}
              </div>
              <div class="text-left sm:text-right">
                <span class="text-2xl lg:text-3xl font-bold text-text-main">${progress}%</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 lg:h-3 mb-4 lg:mb-6 overflow-hidden">
              <div class="bg-primary h-2 lg:h-3 rounded-full relative transition-all duration-500" style="width: ${progress}%">
                ${progress > 0 ? '<div class="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>' : ""}
              </div>
            </div>
            <div class="grid grid-cols-4 gap-1 lg:gap-2">
              <div class="flex flex-col items-center gap-1 lg:gap-2">
                <div class="w-full h-1 ${progressSteps.proposal ? "bg-primary" : "bg-slate-200"} rounded"></div>
                <span class="text-[10px] lg:text-xs font-medium ${progressSteps.proposal ? "text-primary" : "text-slate-400"}">Proposal</span>
              </div>
              <div class="flex flex-col items-center gap-1 lg:gap-2">
                <div class="w-full h-1 ${progressSteps.bimbingan ? "bg-primary" : bimbinganApproved > 0 ? "bg-primary/50" : "bg-slate-200"} rounded"></div>
                <span class="text-[10px] lg:text-xs font-medium ${progressSteps.bimbingan || bimbinganApproved > 0 ? "text-primary" : "text-slate-400"}">Bimbingan</span>
              </div>
              <div class="flex flex-col items-center gap-1 lg:gap-2">
                <div class="w-full h-1 ${progressSteps.laporan ? "bg-primary" : "bg-slate-200"} rounded"></div>
                <span class="text-[10px] lg:text-xs font-medium ${progressSteps.laporan ? "text-primary" : "text-slate-400"}">Laporan</span>
              </div>
              <div class="flex flex-col items-center gap-1 lg:gap-2">
                <div class="w-full h-1 ${progressSteps.sidang ? "bg-primary" : "bg-slate-200"} rounded"></div>
                <span class="text-[10px] lg:text-xs font-medium ${progressSteps.sidang ? "text-primary" : "text-slate-400"}">Sidang</span>
              </div>
            </div>
          </div>

          <!-- Dosen Pembimbing -->
          ${dosenNama
        ? `
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
            <h3 class="text-text-main text-base lg:text-lg font-bold mb-3 lg:mb-4">Dosen Pembimbing</h3>
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3 lg:gap-4 p-3 bg-slate-50 rounded-lg">
                <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base lg:text-lg shrink-0">
                  ${dosenNama.charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-text-main text-sm lg:text-base truncate">${dosenNama}</p>
                  <p class="text-xs lg:text-sm text-text-secondary">Pembimbing 1</p>
                </div>
              </div>
              ${dosenNama2
          ? `
              <div class="flex items-center gap-3 lg:gap-4 p-3 bg-slate-50 rounded-lg">
                <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/70 text-white flex items-center justify-center font-bold text-base lg:text-lg shrink-0">
                  ${dosenNama2.charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-text-main text-sm lg:text-base truncate">${dosenNama2}</p>
                  <p class="text-xs lg:text-sm text-text-secondary">Pembimbing 2</p>
                </div>
              </div>
              `
          : ""
        }
            </div>
          </div>
          `
        : ""
      }

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <a href="/bimbingan.html" class="bg-white hover:bg-slate-50 border border-slate-200 p-4 lg:p-5 rounded-xl text-left flex items-center sm:items-start gap-3 lg:gap-4 transition-all hover:shadow-md group">
              <div class="p-2 lg:p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">add_task</span>
              </div>
              <div>
                <h4 class="font-bold text-text-main text-sm lg:text-base">Catat Bimbingan</h4>
                <p class="text-xs text-text-secondary mt-0.5 lg:mt-1 hidden sm:block">Input hasil diskusi terbaru</p>
              </div>
            </a>
            <a href="/laporan.html" class="bg-white hover:bg-slate-50 border border-slate-200 p-4 lg:p-5 rounded-xl text-left flex items-center sm:items-start gap-3 lg:gap-4 transition-all hover:shadow-md group">
              <div class="p-2 lg:p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <span class="material-symbols-outlined text-[20px] lg:text-[24px]">upload_file</span>
              </div>
              <div>
                <h4 class="font-bold text-text-main text-sm lg:text-base">Upload Laporan</h4>
                <p class="text-xs text-text-secondary mt-0.5 lg:mt-1 hidden sm:block">Submit laporan untuk sidang</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Right Column: Bimbingan History -->
        <div class="flex flex-col gap-4 lg:gap-6">
          <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-4 lg:mb-6">
              <h3 class="text-base lg:text-lg font-bold text-text-main">Riwayat Bimbingan</h3>
              <a href="/bimbingan.html" class="text-xs text-primary hover:underline">Lihat Semua</a>
            </div>
            ${bimbinganList.length > 0
        ? `
            <div class="flex flex-col gap-3 lg:gap-4">
              ${bimbinganList
          .slice(0, 5)
          .map(
            (b, idx) => `
              <div class="flex gap-3 lg:gap-4 items-start">
                <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-full ${b.status === "approved" ? "bg-green-100 text-green-600" : b.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"} flex items-center justify-center shrink-0 text-xs lg:text-sm font-bold">
                  ${idx + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs lg:text-sm font-semibold text-text-main truncate">Bimbingan ke-${b.bimbingan_ke || idx + 1}</p>
                  <p class="text-[10px] lg:text-xs text-text-secondary">${formatDate(b.tanggal)}</p>
                </div>
                <span class="px-2 py-0.5 lg:py-1 text-[10px] lg:text-xs font-medium rounded-full shrink-0 ${b.status === "approved" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}">${b.status === "approved" ? "ACC" : b.status === "pending" ? "Pending" : "Ditolak"}</span>
              </div>
              `
          )
          .join("")}
            </div>
            `
        : `
            <div class="text-center py-6 lg:py-8">
              <span class="material-symbols-outlined text-3xl lg:text-4xl text-slate-300">chat_bubble</span>
              <p class="text-text-secondary text-xs lg:text-sm mt-2">Belum ada riwayat bimbingan</p>
              <a href="/bimbingan.html" class="text-primary text-xs lg:text-sm hover:underline mt-2 inline-block">Catat bimbingan pertama</a>
            </div>
            `
      }
          </div>

          <!-- Tips -->
          <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
            <div class="p-3 lg:p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent">
              <div class="flex gap-2 lg:gap-3 mb-2">
                <span class="material-symbols-outlined text-primary text-[20px] lg:text-[24px]">lightbulb</span>
                <h4 class="font-bold text-primary text-xs lg:text-sm">Tips</h4>
              </div>
              <p class="text-[10px] lg:text-xs text-text-secondary leading-relaxed">
                ${bimbinganApproved < 8 ? `Kamu perlu ${8 - bimbinganApproved} sesi bimbingan lagi untuk bisa mengajukan sidang.` : "Bimbingan sudah lengkap! Segera upload laporan untuk mengajukan sidang."}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Return bimbingan pending count for badge update
    return { bimbinganPending };
  } catch (error) {
    console.error("Error loading dashboard:", error);
    container.innerHTML = `
      <div class="bg-red-50 p-6 lg:p-8 rounded-xl border border-red-200 text-center">
        <span class="material-symbols-outlined text-3xl lg:text-4xl text-red-400">error</span>
        <h3 class="text-base lg:text-lg font-bold text-red-700 mt-2">Gagal Memuat Dashboard</h3>
        <p class="text-red-600 text-xs lg:text-sm mt-1">${error.message || "Terjadi kesalahan"}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Coba Lagi</button>
      </div>
    `;
    return { bimbinganPending: 0 };
  }
}
