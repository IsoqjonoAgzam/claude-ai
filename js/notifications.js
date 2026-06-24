/**
 * Muzqaymoq Do'koni - Toast bildirishnomalar tizimi
 * Sahifa yuqori o'ng burchagida chiqadigan xabarlar
 * Turlari: success, error, warning, info
 */

const Toast = {
  // Bildirishnomalar konteyneri
  container: null,

  /**
   * Bildirishnomalar konteynerini yaratish
   */
  init: function() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.id = 'toastContainer';
    document.body.appendChild(this.container);
  },

  /**
   * Toast bildirishnoma ko'rsatish
   * @param {string} message - xabar matni
   * @param {string} type - turi: success, error, warning, info
   * @param {number} duration - ko'rsatish vaqti (ms), default 3000
   */
  show: function(message, type, duration) {
    this.init();

    type = type || 'info';
    duration = duration || 3000;

    var icons = {
      success: '&#10004;',
      error: '&#10006;',
      warning: '&#9888;',
      info: '&#8505;'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
      '<span class="toast-message">' + message + '</span>' +
      '<button class="toast-close" onclick="Toast.dismiss(this.parentElement)">&times;</button>';

    this.container.appendChild(toast);

    // Animatsiya bilan paydo bo'lish
    requestAnimationFrame(function() {
      toast.classList.add('toast-show');
    });

    // Avtomatik yo'qolish
    var self = this;
    var timer = setTimeout(function() {
      self.dismiss(toast);
    }, duration);

    toast.setAttribute('data-timer', timer);
  },

  /**
   * Muvaffaqiyat xabari
   * @param {string} message - xabar matni
   */
  success: function(message) {
    this.show(message, 'success');
  },

  /**
   * Xatolik xabari
   * @param {string} message - xabar matni
   */
  error: function(message) {
    this.show(message, 'error');
  },

  /**
   * Ogohlantirish xabari
   * @param {string} message - xabar matni
   */
  warning: function(message) {
    this.show(message, 'warning');
  },

  /**
   * Ma'lumot xabari
   * @param {string} message - xabar matni
   */
  info: function(message) {
    this.show(message, 'info');
  },

  /**
   * Bildirishnomani yopish
   * @param {HTMLElement} toast - toast elementi
   */
  dismiss: function(toast) {
    if (!toast || toast.classList.contains('toast-hide')) return;

    // Taymerni tozalash
    var timer = toast.getAttribute('data-timer');
    if (timer) clearTimeout(parseInt(timer));

    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    setTimeout(function() {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }
};
