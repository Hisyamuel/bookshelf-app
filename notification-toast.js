class NotificationSystem {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        if (!document.querySelector('.toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        } else {
            this.toastContainer = document.querySelector('.toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message 
     * @param {string} type 
     * @param {number} duration 
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'i'
        };

        toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

        this.toastContainer.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300); 
    }

    /**
     * Show a confirmation dialog
     * @param {string} message 
     * @param {Function} onConfirm 
     * @param {Function} onCancel 
     * @param {Object} options 
     */
    showConfirm(message, onConfirm, onCancel = null, options = {}) {
        const {
            title = 'Konfirmasi',
            confirmText = 'Ya, Lanjutkan',
            cancelText = 'Batal',
            icon = '!',
            prompt = null, // { placeholder, value }
        } = options;

        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';

        const inputHtml = prompt ?
            `<input type="text" class="confirm-input" placeholder="${prompt.placeholder || ''}" value="${prompt.value || ''}">` :
            '';

        overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-header">
          <div class="confirm-icon">${icon}</div>
          <h3 class="confirm-title">${title}</h3>
        </div>
        <p class="confirm-message">${message}</p>
        ${inputHtml}
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
          <button class="confirm-btn confirm-btn-confirm">${confirmText}</button>
        </div>
      </div>
    `;

        document.body.appendChild(overlay);

        const inputEl = overlay.querySelector('.confirm-input');
        if (inputEl) {
            inputEl.focus();
            inputEl.select();
        }

        const close = (confirmed) => {
            overlay.classList.add('hiding');
            setTimeout(() => {
                overlay.remove();
                if (confirmed && onConfirm) {
                    const value = inputEl ? inputEl.value : true;
                    onConfirm(value);
                } else if (!confirmed && onCancel) {
                    onCancel();
                }
            }, 200);
        };

        overlay.querySelector('.confirm-btn-cancel').addEventListener('click', () => close(false));
        overlay.querySelector('.confirm-btn-confirm').addEventListener('click', () => close(true));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close(false);
            }
        });

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
}

const notification = new NotificationSystem();

export const showToast = (message, type, duration) =>
    notification.showToast(message, type, duration);

export const showConfirm = (message, onConfirm, onCancel, options) =>
    notification.showConfirm(message, onConfirm, onCancel, options);

export default notification;
