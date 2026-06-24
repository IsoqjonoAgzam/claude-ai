/**
 * Muzqaymoq Do'koni - Autentifikatsiya moduli
 * Login/Logout logikasi
 */

const Auth = {
  /**
   * Foydalanuvchini tizimga kirish
   * @param {string} login - foydalanuvchi nomi
   * @param {string} parol - parol
   * @returns {object} natija: {success, message, user}
   */
  login: function(login, parol) {
    var users = Storage.get('users', []);
    var user = users.find(function(u) {
      return u.login === login && u.parol === parol;
    });

    if (user) {
      var session = {
        id: user.id,
        login: user.login,
        rol: user.rol,
        ism: user.ism,
        loginTime: new Date().toISOString()
      };
      Storage.set('currentUser', session);
      return { success: true, message: "Muvaffaqiyatli kirdingiz!", user: session };
    }

    return { success: false, message: "Login yoki parol noto'g'ri!", user: null };
  },

  /**
   * Foydalanuvchini tizimdan chiqish
   */
  logout: function() {
    Storage.remove('currentUser');
    window.location.href = 'index.html';
  },

  /**
   * Joriy foydalanuvchini olish
   * @returns {object|null} joriy foydalanuvchi yoki null
   */
  getCurrentUser: function() {
    return Storage.get('currentUser', null);
  },

  /**
   * Foydalanuvchi tizimga kirganligini tekshirish
   * @returns {boolean}
   */
  isLoggedIn: function() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Foydalanuvchi rolini tekshirish
   * @param {string|string[]} roles - ruxsat etilgan rollar
   * @returns {boolean}
   */
  hasRole: function(roles) {
    var user = this.getCurrentUser();
    if (!user) return false;
    if (typeof roles === 'string') roles = [roles];
    return roles.indexOf(user.rol) !== -1;
  },

  /**
   * Himoyalangan sahifada foydalanuvchini tekshirish
   * Agar kirgan bo'lmasa, login sahifasiga yo'naltiradi
   */
  requireAuth: function() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /**
   * Rol nomini o'zbek tilida qaytarish
   * @param {string} rol - rol kodi
   * @returns {string} o'zbek tilidagi nom
   */
  getRoleName: function(rol) {
    var roles = {
      'admin': 'Administrator',
      'menejer': 'Menejer',
      'sotuvchi': 'Sotuvchi'
    };
    return roles[rol] || rol;
  }
};
