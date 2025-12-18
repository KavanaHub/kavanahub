// ========================================
// API HELPER - Kavana Bimbingan Online
// ========================================

// Base API URL
const API_BASE_URL = 'https://kavana-backend-j8ktr.ondigitalocean.app';

// ========================================
// TOKEN MANAGEMENT
// ========================================

export function getToken() {
    return sessionStorage.getItem('authToken');
}

export function setToken(token) {
    sessionStorage.setItem('authToken', token);
}

export function clearToken() {
    sessionStorage.removeItem('authToken');
}

export function isLoggedIn() {
    return !!getToken();
}

// ========================================
// BASE API REQUEST
// ========================================

async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            console.error(`API Error (${endpoint}):`, data);
            return { ok: false, error: data.message || 'Request failed', status: response.status };
        }

        return { ok: true, data };
    } catch (err) {
        console.error(`API Error (${endpoint}):`, err);
        return { ok: false, error: err.message || 'Network error' };
    }
}

// ========================================
// AUTH API
// ========================================

export const authAPI = {
    login: async (email, password) => {
        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.ok && result.data.token) {
            setToken(result.data.token);
            sessionStorage.setItem('userRole', result.data.role);
            sessionStorage.setItem('userId', result.data.user_id);
        }

        return result;
    },

    register: async (data) => {
        return apiRequest('/api/auth/register/mahasiswa', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getProfile: () => apiRequest('/api/auth/profile'),

    updateProfile: (data) => apiRequest('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),

    changePassword: (oldPassword, newPassword) => apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    }),

    logout: () => {
        clearToken();
        sessionStorage.clear();
    }
};

// ========================================
// MAHASISWA API
// ========================================

export const mahasiswaAPI = {
    getProfile: () => apiRequest('/api/mahasiswa/profile'),

    setTrack: (track) => apiRequest('/api/mahasiswa/track', {
        method: 'PATCH',
        body: JSON.stringify({ track })
    }),

    getProposalStatus: () => apiRequest('/api/mahasiswa/profile'),

    submitProposal: (data) => apiRequest('/api/mahasiswa/proposal', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getMyBimbingan: () => apiRequest('/api/mahasiswa/bimbingan'),

    createBimbingan: (data) => apiRequest('/api/mahasiswa/bimbingan', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    submitLaporan: (data) => apiRequest('/api/mahasiswa/laporan', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Kelompok
    createKelompok: (nama) => apiRequest('/api/mahasiswa/kelompok', {
        method: 'POST',
        body: JSON.stringify({ nama })
    }),

    joinKelompok: (kelompok_id) => apiRequest('/api/mahasiswa/kelompok/join', {
        method: 'POST',
        body: JSON.stringify({ kelompok_id })
    }),

    getMyKelompok: () => apiRequest('/api/mahasiswa/kelompok'),

    getAvailableKelompok: () => apiRequest('/api/mahasiswa/kelompok/available'),

    // Periode Aktif - cek apakah mahasiswa eligible untuk proyek/internship
    getPeriodeAktif: () => apiRequest('/api/mahasiswa/periode-aktif')
};

// ========================================
// DOSEN API
// ========================================

export const dosenAPI = {
    getProfile: () => apiRequest('/api/dosen/profile'),

    getMahasiswaBimbingan: () => apiRequest('/api/dosen/mahasiswa'),

    getBimbinganList: () => apiRequest('/api/dosen/bimbingan'),

    approveBimbingan: (id, status, catatan) => apiRequest(`/api/dosen/bimbingan/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, catatan })
    }),

    getLaporanList: () => apiRequest('/api/dosen/laporan'),

    approveLaporan: (mahasiswaId, status) => apiRequest(`/api/dosen/laporan/${mahasiswaId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    })
};

// ========================================
// KOORDINATOR API
// ========================================

export const koordinatorAPI = {
    getProfile: () => apiRequest('/api/koordinator/profile'),

    getStats: () => apiRequest('/api/koordinator/stats'),

    getPendingProposals: () => apiRequest('/api/koordinator/proposal/pending'),

    validateProposal: (mahasiswaId, status, catatan) => apiRequest('/api/koordinator/proposal/validate', {
        method: 'PATCH',
        body: JSON.stringify({ mahasiswa_id: mahasiswaId, status, catatan })
    }),

    getMahasiswaList: () => apiRequest('/api/koordinator/mahasiswa'),

    getDosenList: () => apiRequest('/api/koordinator/dosen'),

    assignDosen: (mahasiswaId, dosenId, dosenId2) => apiRequest('/api/koordinator/assign-dosen', {
        method: 'POST',
        body: JSON.stringify({
            mahasiswa_id: mahasiswaId,
            dosen_id: dosenId,
            dosen_id_2: dosenId2 || null
        })
    }),

    scheduleSidang: (data) => apiRequest('/api/koordinator/sidang/schedule', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Jadwal/Periode API
    getJadwalList: () => apiRequest('/api/koordinator/jadwal'),

    getJadwalActive: () => apiRequest('/api/koordinator/jadwal/active'),

    createJadwal: (data) => apiRequest('/api/koordinator/jadwal', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateJadwal: (id, data) => apiRequest(`/api/koordinator/jadwal/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    completeJadwal: (id) => apiRequest(`/api/koordinator/jadwal/${id}/complete`, {
        method: 'POST'
    })
};

// ========================================
// KAPRODI API
// ========================================

export const kaprodiAPI = {
    getProfile: () => apiRequest('/api/kaprodi/profile'),

    getStats: () => apiRequest('/api/kaprodi/stats'),

    getMahasiswaList: () => apiRequest('/api/kaprodi/mahasiswa'),

    getDosenList: () => apiRequest('/api/kaprodi/dosen')
};

// ========================================
// PUBLIC API (no auth required)
// ========================================

export const publicAPI = {
    getDosenList: async () => {
        // Try koordinator endpoint first (if logged in)
        const token = getToken();
        if (token) {
            const result = await apiRequest('/api/koordinator/dosen');
            if (result.ok) return result;
        }

        // Fallback to kaprodi
        return apiRequest('/api/kaprodi/dosen');
    }
};

// ========================================
// UPLOAD API
// ========================================

export const uploadAPI = {
    uploadProfile: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/profile/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        return { ok: response.ok, data };
    }
};
