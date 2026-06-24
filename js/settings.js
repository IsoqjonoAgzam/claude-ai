/**
 * Muzqaymoq Do'koni - Sozlamalar moduli
 * Do'kon ma'lumotlari, foydalanuvchilar, import/export, data boshqaruvi
 */

const Settings = {
  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.loadStoreInfo();
    this.loadAlertThreshold();
    this.setupEventListeners();
    this.checkPermissions();
  },

  /**
   * Rolga asoslangan ruxsatlarni tekshirish
   */
  checkPermissions: function() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    // Menejer: faqat do'kon ma'lumotlari va eksport
    if (user.rol === 'menejer') {
      var usersSection = document.getElementById('usersSection');
      var importSection = document.getElementById('importSection');
      var resetSection = document.getElementById('resetSection');
      var thresholdSection = document.getElementById('thresholdSection');

      if (usersSection) usersSection.style.display = 'none';
      if (importSection) importSection.style.display = 'none';
      if (resetSection) resetSection.style.display = 'none';
      if (thresholdSection) thresholdSection.style.display = 'none';
    }
  },

  /**
   * Do'kon ma'lumotlarini yuklash
   */
  loadStoreInfo: function() {
    var storeInfo = Storage.get('storeInfo', {
      nomi: "Muzqaymoq Do'koni",
      manzil: "Toshkent shahri, Chilonzor tumani",
      telefon: "+998 90 123 45 67",
      ishVaqti: "09:00 - 21:00"
    });

    var nomiEl = document.getElementById('storeNomi');
    var manzilEl = document.getElementById('storeManzil');
    var telefonEl = document.getElementById('storeTelefon');
    var ishVaqtiEl = document.getElementById('storeIshVaqti');

    if (nomiEl) nomiEl.value = storeInfo.nomi || '';
    if (manzilEl) manzilEl.value = storeInfo.manzil || '';
    if (telefonEl) telefonEl.value = storeInfo.telefon || '';
    if (ishVaqtiEl) ishVaqtiEl.value = storeInfo.ishVaqti || '';
  },

  /**
   * Ogohlantirish chegarasini yuklash
   */
  loadAlertThreshold: function() {
    var threshold = Storage.get('alertThreshold', 10);
    var thresholdEl = document.getElementById('alertThreshold');
    if (thresholdEl) thresholdEl.value = threshold;
  },

  /**
   * Hodisalar tinglovchilarini sozlash
   */
  setupEventListeners: function() {
    var self = this;

    // Do'kon ma'lumotlarini saqlash
    var storeForm = document.getElementById('storeInfoForm');
    if (storeForm) {
      storeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        self.saveStoreInfo();
      });
    }

    // Parol o'zgartirish
    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        self.changePassword();
      });
    }

    // Eksport tugmasi
    var exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        self.exportData();
      });
    }

    // Import tugmasi
    var importBtn = document.getElementById('importBtn');
    if (importBtn) {
      importBtn.addEventListener('click', function() {
        document.getElementById('importFile').click();
      });
    }

    // Import fayl tanlash
    var importFile = document.getElementById('importFile');
    if (importFile) {
      importFile.addEventListener('change', function(e) {
        self.importData(e);
      });
    }

    // Ma'lumotlarni tozalash
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        self.resetData();
      });
    }

    // Ogohlantirish chegarasini saqlash
    var thresholdForm = document.getElementById('thresholdForm');
    if (thresholdForm) {
      thresholdForm.addEventListener('submit', function(e) {
        e.preventDefault();
        self.saveThreshold();
      });
    }
  },

  /**
   * Do'kon ma'lumotlarini saqlash
   */
  saveStoreInfo: function() {
    var storeInfo = {
      nomi: document.getElementById('storeNomi').value.trim(),
      manzil: document.getElementById('storeManzil').value.trim(),
      telefon: document.getElementById('storeTelefon').value.trim(),
      ishVaqti: document.getElementById('storeIshVaqti').value.trim()
    };

    Storage.set('storeInfo', storeInfo);
    Toast.success("Do'kon ma'lumotlari saqlandi!");
  },

  /**
   * Parolni o'zgartirish (admin uchun)
   */
  changePassword: function() {
    var userSelect = document.getElementById('passwordUser');
    var newPassword = document.getElementById('newPassword');
    var confirmPassword = document.getElementById('confirmPassword');

    if (!userSelect || !newPassword || !confirmPassword) return;

    var userId = userSelect.value;
    var newPass = newPassword.value.trim();
    var confirmPass = confirmPassword.value.trim();

    if (!userId) {
      Toast.warning('Iltimos, foydalanuvchini tanlang!');
      return;
    }

    if (!newPass || newPass.length < 4) {
      Toast.warning('Parol kamida 4 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (newPass !== confirmPass) {
      Toast.error('Parollar mos kelmaydi!');
      return;
    }

    // Foydalanuvchi parolini yangilash
    var users = Storage.get('users', []);
    users = users.map(function(u) {
      if (u.id === userId) {
        u.parol = newPass;
      }
      return u;
    });
    Storage.set('users', users);

    // Formani tozalash
    newPassword.value = '';
    confirmPassword.value = '';

    Toast.success('Parol muvaffaqiyatli o\'zgartirildi!');
  },

  /**
   * Ma'lumotlarni JSON sifatida eksport qilish
   */
  exportData: function() {
    var data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      storeInfo: Storage.get('storeInfo', {}),
      products: Storage.get('products', []),
      orders: Storage.get('orders', []),
      customers: Storage.get('customers', []),
      users: Storage.get('users', []),
      alertThreshold: Storage.get('alertThreshold', 10)
    };

    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'muzqaymoq-dokon-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Toast.success("Ma'lumotlar muvaffaqiyatli eksport qilindi!");
  },

  /**
   * Ma'lumotlarni JSON dan import qilish
   */
  importData: function(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      Toast.error('Faqat JSON fayl yuklash mumkin!');
      event.target.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);

        // Validatsiya
        if (!data.products && !data.orders && !data.customers) {
          Toast.error("Noto'g'ri fayl formati!");
          return;
        }

        // Tasdiqlash
        var confirmed = confirm("Joriy ma'lumotlar import qilingan ma'lumotlar bilan almashtiriladi. Davom etasizmi?");
        if (!confirmed) return;

        // Ma'lumotlarni import qilish
        if (data.storeInfo) Storage.set('storeInfo', data.storeInfo);
        if (data.products) Storage.set('products', data.products);
        if (data.orders) Storage.set('orders', data.orders);
        if (data.customers) Storage.set('customers', data.customers);
        if (data.users) Storage.set('users', data.users);
        if (data.alertThreshold) Storage.set('alertThreshold', data.alertThreshold);

        Toast.success("Ma'lumotlar muvaffaqiyatli import qilindi!");

        // Sahifani yangilash
        setTimeout(function() {
          window.location.reload();
        }, 1500);
      } catch (err) {
        Toast.error("Faylni o'qishda xatolik: " + err.message);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  },

  /**
   * Ma'lumotlarni tozalash (buyurtmalarni o'chirish)
   */
  resetData: function() {
    var confirmed = confirm("Barcha buyurtmalar o'chiriladi. Bu amalni qaytarib bo'lmaydi! Davom etasizmi?");
    if (!confirmed) return;

    var confirmed2 = confirm("Rostdan ham barcha buyurtmalarni o'chirmoqchimisiz?");
    if (!confirmed2) return;

    Storage.set('orders', []);
    Toast.success("Barcha buyurtmalar o'chirildi!");
  },

  /**
   * Ogohlantirish chegarasini saqlash
   */
  saveThreshold: function() {
    var thresholdEl = document.getElementById('alertThreshold');
    if (!thresholdEl) return;

    var value = parseInt(thresholdEl.value);
    if (isNaN(value) || value < 1) {
      Toast.warning("Iltimos, to'g'ri qiymat kiriting (kamida 1)!");
      return;
    }

    Storage.set('alertThreshold', value);
    Toast.success("Ogohlantirish chegarasi " + value + " dona qilib saqlandi!");
  }
};

// Sahifa yuklanganda modulni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  Settings.init();
});
