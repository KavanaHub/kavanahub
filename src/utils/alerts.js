// ========================================
// SWEETALERT2 + ANIMATE.CSS INTEGRATION
// Beautiful alerts with smooth animations
// ========================================

import Swal from 'sweetalert2';
import 'animate.css';

// Custom SweetAlert2 mixin with Animate.css animations
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    showClass: {
        popup: 'animate__animated animate__fadeInRight animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutRight animate__faster'
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Custom modal with animations
const AnimatedSwal = Swal.mixin({
    showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
    },
    customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        confirmButton: 'swal-custom-confirm',
        cancelButton: 'swal-custom-cancel',
        actions: 'swal-custom-actions'
    }
});

// ========================================
// TOAST NOTIFICATIONS
// ========================================

export const showToast = {
    success: (message) => {
        Toast.fire({
            icon: 'success',
            title: message,
            background: '#10B981',
            color: '#fff',
            iconColor: '#fff'
        });
    },

    error: (message) => {
        Toast.fire({
            icon: 'error',
            title: message,
            background: '#EF4444',
            color: '#fff',
            iconColor: '#fff'
        });
    },

    warning: (message) => {
        Toast.fire({
            icon: 'warning',
            title: message,
            background: '#F59E0B',
            color: '#fff',
            iconColor: '#fff'
        });
    },

    info: (message) => {
        Toast.fire({
            icon: 'info',
            title: message,
            background: '#3B82F6',
            color: '#fff',
            iconColor: '#fff'
        });
    }
};

// ========================================
// MODAL DIALOGS
// ========================================

export const showModal = {
    // Success modal
    success: (title, text) => {
        return AnimatedSwal.fire({
            icon: 'success',
            title: title || 'Berhasil!',
            text: text,
            confirmButtonText: 'OK',
            confirmButtonColor: '#10B981'
        });
    },

    // Error modal
    error: (title, text) => {
        return AnimatedSwal.fire({
            icon: 'error',
            title: title || 'Error!',
            text: text,
            confirmButtonText: 'OK',
            confirmButtonColor: '#EF4444'
        });
    },

    // Warning modal
    warning: (title, text) => {
        return AnimatedSwal.fire({
            icon: 'warning',
            title: title || 'Peringatan!',
            text: text,
            confirmButtonText: 'OK',
            confirmButtonColor: '#F59E0B'
        });
    },

    // Info modal
    info: (title, text) => {
        return AnimatedSwal.fire({
            icon: 'info',
            title: title || 'Informasi',
            text: text,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6'
        });
    },

    // Confirmation dialog
    confirm: async (title, text, confirmText = 'Ya', cancelText = 'Batal') => {
        const result = await AnimatedSwal.fire({
            icon: 'question',
            title: title || 'Konfirmasi',
            text: text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: '#7C3AED',
            cancelButtonColor: '#6B7280',
            reverseButtons: true
        });
        return result.isConfirmed;
    },

    // Delete confirmation (red theme)
    confirmDelete: async (title, text) => {
        const result = await AnimatedSwal.fire({
            icon: 'warning',
            title: title || 'Hapus Data?',
            text: text || 'Data yang dihapus tidak dapat dikembalikan!',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            reverseButtons: true
        });
        return result.isConfirmed;
    },

    // Input modal
    input: async (title, placeholder, inputType = 'text') => {
        const result = await AnimatedSwal.fire({
            title: title,
            input: inputType,
            inputPlaceholder: placeholder,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#7C3AED',
            cancelButtonColor: '#6B7280',
            inputValidator: (value) => {
                if (!value) {
                    return 'Input tidak boleh kosong!';
                }
            }
        });
        return result.isConfirmed ? result.value : null;
    },

    // Textarea input
    textarea: async (title, placeholder) => {
        const result = await AnimatedSwal.fire({
            title: title,
            input: 'textarea',
            inputPlaceholder: placeholder,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#7C3AED',
            cancelButtonColor: '#6B7280'
        });
        return result.isConfirmed ? result.value : null;
    }
};

// ========================================
// LOADING INDICATOR
// ========================================

export const showLoading = {
    start: (title = 'Loading...') => {
        AnimatedSwal.fire({
            title: title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },

    stop: () => {
        Swal.close();
    }
};

// ========================================
// ANIMATION UTILITIES
// ========================================

export const animate = {
    // Add animation to element
    element: (el, animation, duration = 1000) => {
        return new Promise((resolve) => {
            const animationName = `animate__${animation}`;
            const node = typeof el === 'string' ? document.querySelector(el) : el;

            if (!node) return resolve();

            node.classList.add('animate__animated', animationName);
            node.style.setProperty('--animate-duration', `${duration}ms`);

            const handleAnimationEnd = (event) => {
                event.stopPropagation();
                node.classList.remove('animate__animated', animationName);
                resolve();
            };

            node.addEventListener('animationend', handleAnimationEnd, { once: true });
        });
    },

    // Fade in
    fadeIn: (el, duration = 500) => animate.element(el, 'fadeIn', duration),
    fadeInUp: (el, duration = 500) => animate.element(el, 'fadeInUp', duration),
    fadeInDown: (el, duration = 500) => animate.element(el, 'fadeInDown', duration),
    fadeInLeft: (el, duration = 500) => animate.element(el, 'fadeInLeft', duration),
    fadeInRight: (el, duration = 500) => animate.element(el, 'fadeInRight', duration),

    // Fade out
    fadeOut: (el, duration = 500) => animate.element(el, 'fadeOut', duration),
    fadeOutUp: (el, duration = 500) => animate.element(el, 'fadeOutUp', duration),
    fadeOutDown: (el, duration = 500) => animate.element(el, 'fadeOutDown', duration),

    // Bounce
    bounce: (el, duration = 800) => animate.element(el, 'bounce', duration),
    bounceIn: (el, duration = 800) => animate.element(el, 'bounceIn', duration),

    // Zoom
    zoomIn: (el, duration = 500) => animate.element(el, 'zoomIn', duration),
    zoomOut: (el, duration = 500) => animate.element(el, 'zoomOut', duration),

    // Pulse / attention seekers
    pulse: (el, duration = 500) => animate.element(el, 'pulse', duration),
    shake: (el, duration = 500) => animate.element(el, 'shakeX', duration),
    wobble: (el, duration = 800) => animate.element(el, 'wobble', duration),
    heartBeat: (el, duration = 800) => animate.element(el, 'heartBeat', duration),

    // Slide
    slideInUp: (el, duration = 500) => animate.element(el, 'slideInUp', duration),
    slideInDown: (el, duration = 500) => animate.element(el, 'slideInDown', duration),
    slideInLeft: (el, duration = 500) => animate.element(el, 'slideInLeft', duration),
    slideInRight: (el, duration = 500) => animate.element(el, 'slideInRight', duration),
    slideOutUp: (el, duration = 500) => animate.element(el, 'slideOutUp', duration),
    slideOutDown: (el, duration = 500) => animate.element(el, 'slideOutDown', duration),

    // Flip
    flipInX: (el, duration = 800) => animate.element(el, 'flipInX', duration),
    flipInY: (el, duration = 800) => animate.element(el, 'flipInY', duration)
};

// ========================================
// STAGGERED ANIMATIONS (for lists)
// ========================================

export const animateList = async (selector, animation = 'fadeInUp', staggerDelay = 100) => {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        setTimeout(() => {
            animate.element(elements[i], animation, 500);
        }, i * staggerDelay);
    }
};

// Re-export Swal for custom usage
export { Swal };
