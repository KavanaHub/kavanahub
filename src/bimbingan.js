// ========================================
// BIMBINGAN PAGE (Clean Code Refactored)
// ========================================

import { mahasiswaAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { showFieldError, clearAllErrors, setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { formatDateShort, getTrackDisplayName, getStatusDisplay } from "./utils/formatUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let sessions = [];
let editingIndex = -1;

// ---------- CONSTANTS ----------
const MAX_SESSIONS = 8;

// ---------- DOM ELEMENTS ----------
const getElements = () => ({
  modal: document.getElementById("session-modal"),
  modalTitle: document.getElementById("modal-title"),
  form: document.getElementById("session-form"),
  btnAddSession: document.getElementById("btn-add-session"),
  sessionsList: document.getElementById("sessions-list"),
  trackInfo: document.getElementById("track-info"),
  pembimbingInfo: document.getElementById("pembimbing-info"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-fill"),
  progressDots: document.getElementById("progress-dots"),
});

// ---------- BIMBINGAN PAGE INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize page with sidebar
  const { isAuthenticated } = initPage({ activeMenu: "bimbingan" });
  if (!isAuthenticated) return;

  // Setup global closeSidebar
  window.closeSidebar = closeSidebar;

  const elements = getElements();

  // Load data
  loadTrackInfo(elements.trackInfo);
  loadPembimbingInfo(elements.pembimbingInfo);
  await loadBimbinganFromAPI();
  updateProgress();

  // Event listeners
  elements.btnAddSession?.addEventListener("click", () => openModal());
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("btn-modal-cancel")?.addEventListener("click", closeModal);
  elements.modal?.addEventListener("click", (e) => e.target === elements.modal && closeModal());
  elements.form?.addEventListener("submit", handleSubmit);
});

// ---------- DATA LOADING ----------
async function loadTrackInfo(container) {
  if (!container) return;

  container.innerHTML = '<p class="text-text-secondary text-sm">Loading...</p>';

  try {
    const result = await mahasiswaAPI.getProfile();

    if (!result.ok || !result.data.track) {
      container.innerHTML = renderNoTrackWarning();
      return;
    }

    const profile = result.data;
    const track = profile.track;
    const isProyek = track.includes("proyek");

    container.innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      <div class="p-2 ${isProyek ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"} rounded-lg text-xl lg:text-2xl">
        ${isProyek ? "📋" : "🏢"}
      </div>
      <h4 class="font-semibold text-text-main text-sm lg:text-base">Track Aktif</h4>
    </div>
    <p class="font-bold text-text-main text-base lg:text-lg">${getTrackDisplayName(track)}</p>
    <p class="text-text-secondary text-xs lg:text-sm mt-1">${isProyek ? "Proyek Kelompok" : "Internship"}</p>
  `;
  } catch (err) {
    console.error("Error loading track info:", err);
    container.innerHTML = renderNoTrackWarning();
  }
}

async function loadPembimbingInfo(container) {
  if (!container) return;

  container.innerHTML = '<p class="text-text-secondary text-sm">Loading...</p>';

  try {
    const result = await mahasiswaAPI.getProfile();

    if (!result.ok) {
      container.innerHTML = renderNoPembimbingWarning();
      return;
    }

    const profile = result.data;

    // Check if proposal is approved and has dosen
    if (profile.status_proposal !== 'approved' || !profile.dosen_nama) {
      container.innerHTML = renderNoPembimbingWarning();
      return;
    }

    container.innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      <div class="p-2 bg-blue-50 text-primary rounded-lg">
        <span class="material-symbols-outlined text-[20px] lg:text-[24px]">person</span>
      </div>
      <h4 class="font-semibold text-text-main text-sm lg:text-base">Dosen Pembimbing</h4>
    </div>
    <p class="font-bold text-text-main text-base lg:text-lg">${profile.dosen_nama}</p>
    <p class="text-text-secondary text-xs lg:text-sm mt-1">Pembimbing Utama</p>
  `;
  } catch (err) {
    console.error("Error loading pembimbing info:", err);
    container.innerHTML = renderNoPembimbingWarning();
  }
}

async function loadBimbinganFromAPI() {
  try {
    const result = await mahasiswaAPI.getMyBimbingan();
    if (result.ok && result.data) {
      sessions = result.data.map((b) => ({
        id: b.id,
        date: b.tanggal,
        topic: b.topik || b.kegiatan || "",
        notes: b.catatan || "",
        mingguKe: b.minggu_ke,
        status: b.status,
      }));
      renderSessions();
    }
  } catch (err) {
    console.error("Error loading bimbingan:", err);
    sessions = JSON.parse(sessionStorage.getItem("bimbinganSessions")) || [];
    renderSessions();
  }
}

// ---------- RENDERING ----------
function renderNoTrackWarning() {
  return `
    <div class="flex items-center gap-3 mb-3">
      <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
        <span class="material-symbols-outlined text-[20px] lg:text-[24px]">warning</span>
      </div>
      <h4 class="font-semibold text-text-main text-sm lg:text-base">Track Aktif</h4>
    </div>
    <p class="text-yellow-600 text-sm font-medium">Belum ada track dipilih</p>
    <a href="/mahasiswa/track.html" class="text-primary text-xs hover:underline mt-2 inline-block">Pilih Track →</a>
  `;
}

function renderNoPembimbingWarning() {
  return `
    <div class="flex items-center gap-3 mb-3">
      <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
        <span class="material-symbols-outlined text-[20px] lg:text-[24px]">warning</span>
      </div>
      <h4 class="font-semibold text-text-main text-sm lg:text-base">Dosen Pembimbing</h4>
    </div>
    <p class="text-yellow-600 text-sm font-medium">Belum ada proposal</p>
    <a href="/proposal.html" class="text-primary text-xs hover:underline mt-2 inline-block">Upload Proposal →</a>
  `;
}

function updateProgress() {
  const count = sessions.length;
  const percentage = (count / MAX_SESSIONS) * 100;

  document.getElementById("progress-text").textContent = `${count} / ${MAX_SESSIONS} Sesi`;
  document.getElementById("progress-fill").style.width = `${percentage}%`;

  // Update dots
  const dotsContainer = document.getElementById("progress-dots");
  dotsContainer.innerHTML = Array.from({ length: MAX_SESSIONS }, (_, i) => {
    const isCompleted = i < count;
    return `<div class="flex items-center justify-center w-full h-8 lg:h-10 rounded-lg text-xs lg:text-sm font-bold transition-colors ${isCompleted ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
      }">${i + 1}</div>`;
  }).join("");

  // Disable add button if max reached
  const btnAdd = document.getElementById("btn-add-session");
  if (count >= MAX_SESSIONS && btnAdd) {
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="material-symbols-outlined text-[18px]">check</span> Bimbingan Selesai`;
    btnAdd.classList.remove("bg-primary", "hover:bg-primary/90");
    btnAdd.classList.add("bg-green-500", "cursor-not-allowed");
  }
}

function renderSessions() {
  const listEl = document.getElementById("sessions-list");
  if (!listEl) return;

  if (sessions.length === 0) {
    listEl.innerHTML = renderEmptyState();
    return;
  }

  listEl.innerHTML = sessions.map((session, index) => renderSessionCard(session, index)).join("");
}

function renderEmptyState() {
  return `
    <div class="text-center py-8 lg:py-12">
      <span class="material-symbols-outlined text-4xl lg:text-5xl text-slate-300">edit_note</span>
      <h3 class="text-base lg:text-lg font-bold text-text-main mt-3">Belum Ada Bimbingan</h3>
      <p class="text-text-secondary text-xs lg:text-sm mt-1">Klik tombol "Tambah Bimbingan" untuk mencatat sesi pertama</p>
    </div>
  `;
}

function renderSessionCard(session, index) {
  const status = getStatusDisplay(session.status);

  return `
    <div class="flex gap-3 lg:gap-4 p-3 lg:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div class="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-${status.color}-500 text-white flex items-center justify-center font-bold text-sm lg:text-base shrink-0">${index + 1}</div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span class="text-xs lg:text-sm text-text-secondary">${formatDateShort(session.date)}</span>
          <span class="px-2 py-0.5 text-[10px] lg:text-xs font-medium rounded-full bg-${status.color}-100 text-${status.color}-700">${status.text}</span>
        </div>
        <p class="font-semibold text-text-main text-sm lg:text-base truncate">${session.topic}</p>
        <p class="text-text-secondary text-xs lg:text-sm mt-1 line-clamp-2">${session.notes}</p>
        ${session.next ? `<p class="text-primary text-xs mt-2"><span class="font-medium">Rencana:</span> ${session.next}</p>` : ""}
      </div>
      <div class="flex flex-col sm:flex-row gap-2 shrink-0">
        <button onclick="editSession(${index})" class="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-colors">
          <span class="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onclick="deleteSession(${index})" class="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  `;
}

// ---------- MODAL HANDLERS ----------
function openModal(index = -1) {
  editingIndex = index;
  const modal = document.getElementById("session-modal");
  const form = document.getElementById("session-form");
  const title = document.getElementById("modal-title");

  form.reset();
  clearAllErrors();

  if (index >= 0 && sessions[index]) {
    title.textContent = `Edit Bimbingan ke-${index + 1}`;
    document.getElementById("session-date").value = sessions[index].date;
    document.getElementById("session-topic").value = sessions[index].topic;
    document.getElementById("session-notes").value = sessions[index].notes;
    document.getElementById("session-next").value = sessions[index].next || "";
  } else {
    title.textContent = `Tambah Bimbingan ke-${sessions.length + 1}`;
    document.getElementById("session-date").value = new Date().toISOString().split("T")[0];
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("session-modal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
  editingIndex = -1;
}

// ---------- FORM SUBMISSION ----------
async function handleSubmit(e) {
  e.preventDefault();

  const date = document.getElementById("session-date").value;
  const topic = document.getElementById("session-topic").value.trim();
  const notes = document.getElementById("session-notes").value.trim();
  const next = document.getElementById("session-next").value.trim();

  // Validation
  let isValid = true;
  clearAllErrors();

  if (!date) {
    showFieldError("session-date", "Tanggal wajib diisi");
    isValid = false;
  }
  if (!topic) {
    showFieldError("session-topic", "Topik wajib diisi");
    isValid = false;
  }
  if (!notes) {
    showFieldError("session-notes", "Catatan wajib diisi");
    isValid = false;
  }

  if (!isValid) return;

  const submitBtn = document.querySelector('#session-form button[type="submit"]');
  setButtonLoading(submitBtn, "Menyimpan...");

  try {
    // Calculate minggu_ke based on existing sessions count
    const mingguKe = sessions.length + 1;

    const result = await mahasiswaAPI.createBimbingan({
      tanggal: date,
      minggu_ke: mingguKe,
      topik: topic,
      catatan: notes,
    });

    if (result.ok) {
      closeModal();
      showToast.success("Bimbingan berhasil disimpan");
      await loadBimbinganFromAPI();
      updateProgress();
    } else {
      showModal.error("Gagal Menyimpan", result.error || "Terjadi kesalahan");
    }
  } catch (err) {
    console.error("Submit error:", err);
    // Fallback to sessionStorage
    const sessionData = { date, topic, notes, next, status: "pending" };
    if (editingIndex >= 0) {
      sessions[editingIndex] = sessionData;
    } else {
      sessions.push(sessionData);
    }
    sessionStorage.setItem("bimbinganSessions", JSON.stringify(sessions));
    closeModal();
    renderSessions();
    updateProgress();
  } finally {
    resetButtonLoading(submitBtn);
  }
}

// ---------- GLOBAL FUNCTIONS ----------
window.editSession = (index) => openModal(index);

window.deleteSession = async (index) => {
  const confirmed = await showModal.confirmDelete(
    "Hapus Bimbingan?",
    "Apakah Anda yakin ingin menghapus sesi bimbingan ini?"
  );
  if (confirmed) {
    sessions.splice(index, 1);
    sessionStorage.setItem("bimbinganSessions", JSON.stringify(sessions));
    showToast.success("Bimbingan berhasil dihapus");
    renderSessions();
    updateProgress();
  }
};
