/**
 * Muzqaymoq Do'koni - Asosiy ilova logikasi
 */

const App = {
  /**
   * Ilovani ishga tushirish
   */
  init: function() {
    // Autentifikatsiyani tekshirish
    if (!Auth.requireAuth()) return;

    // Foydalanuvchi ma'lumotlarini ko'rsatish
    this.renderUserInfo();

    // Navigatsiyani sozlash
    this.setupNavigation();

    // Mobil menyuni sozlash
    this.setupMobileMenu();

    // Sanani ko'rsatish
    this.renderDate();

    // Joriy sahifani belgilash
    this.highlightCurrentPage();

    // Sozlamalar linkini tekshirish
    this.checkSettingsAccess();
  },

  /**
   * Foydalanuvchi ma'lumotlarini sidebar da ko'rsatish
   */
  renderUserInfo: function() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    var nameEl = document.getElementById('userName');
    var roleEl = document.getElementById('userRole');
    var avatarEl = document.getElementById('userAvatar');

    if (nameEl) nameEl.textContent = user.ism;
    if (roleEl) roleEl.textContent = Auth.getRoleName(user.rol);
    if (avatarEl) avatarEl.textContent = user.ism.charAt(0).toUpperCase();
  },

  /**
   * Navigatsiya havolalarini sozlash
   */
  setupNavigation: function() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  /**
   * Mobil menyu tugmasini sozlash
   */
  setupMobileMenu: function() {
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  },

  /**
   * Bugungi sanani ko'rsatish
   */
  renderDate: function() {
    var dateEl = document.getElementById('currentDate');
    if (!dateEl) return;

    var now = new Date();
    var oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    var formatted = now.getDate() + ' ' + oylar[now.getMonth()] + ', ' + now.getFullYear();
    dateEl.textContent = formatted;
  },

  /**
   * Joriy sahifani navigatsiyada belgilash
   */
  highlightCurrentPage: function() {
    var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    var navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  /**
   * Sozlamalar linkini rolga qarab ko'rsatish/yashirish
   * Sotuvchi: ko'rinmasin
   * Menejer va Admin: ko'rinsin
   */
  checkSettingsAccess: function() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    var settingsItems = document.querySelectorAll('.nav-settings');
    settingsItems.forEach(function(item) {
      if (user.rol === 'sotuvchi') {
        item.style.display = 'none';
      }
    });
  }
};

// Sahifa yuklanganda ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
