/**
 * Muzqaymoq Do'koni - localStorage Helper Funksiyalari
 * localStorage bilan ishlash uchun yordamchi funksiyalar
 */

const Storage = {
  /**
   * localStorage ga ma'lumot saqlash
   * @param {string} key - kalit nomi
   * @param {*} value - saqlanadigan qiymat
   */
  set: function(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error("localStorage ga yozishda xatolik:", e);
      return false;
    }
  },

  /**
   * localStorage dan ma'lumot olish
   * @param {string} key - kalit nomi
   * @param {*} defaultValue - standart qiymat (topilmasa)
   * @returns {*} saqlangan qiymat yoki standart qiymat
   */
  get: function(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue !== undefined ? defaultValue : null;
      return JSON.parse(item);
    } catch (e) {
      console.error("localStorage dan o'qishda xatolik:", e);
      return defaultValue !== undefined ? defaultValue : null;
    }
  },

  /**
   * localStorage dan ma'lumotni o'chirish
   * @param {string} key - kalit nomi
   */
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error("localStorage dan o'chirishda xatolik:", e);
      return false;
    }
  },

  /**
   * Barcha localStorage ni tozalash
   */
  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error("localStorage ni tozalashda xatolik:", e);
      return false;
    }
  },

  /**
   * Kalit mavjudligini tekshirish
   * @param {string} key - kalit nomi
   * @returns {boolean}
   */
  has: function(key) {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Massivga element qo'shish
   * @param {string} key - massiv kaliti
   * @param {*} item - qo'shiladigan element
   */
  pushToArray: function(key, item) {
    var arr = this.get(key, []);
    arr.push(item);
    return this.set(key, arr);
  },

  /**
   * Massivdan elementni ID bo'yicha o'chirish
   * @param {string} key - massiv kaliti
   * @param {string|number} id - element IDsi
   */
  removeFromArray: function(key, id) {
    var arr = this.get(key, []);
    arr = arr.filter(function(item) {
      return item.id !== id;
    });
    return this.set(key, arr);
  },

  /**
   * Massivdagi elementni yangilash
   * @param {string} key - massiv kaliti
   * @param {string|number} id - element IDsi
   * @param {object} updates - yangilanadigan maydonlar
   */
  updateInArray: function(key, id, updates) {
    var arr = this.get(key, []);
    arr = arr.map(function(item) {
      if (item.id === id) {
        return Object.assign({}, item, updates);
      }
      return item;
    });
    return this.set(key, arr);
  },

  /**
   * Massivdan elementni ID bo'yicha topish
   * @param {string} key - massiv kaliti
   * @param {string|number} id - element IDsi
   * @returns {*} topilgan element yoki null
   */
  findInArray: function(key, id) {
    var arr = this.get(key, []);
    return arr.find(function(item) {
      return item.id === id;
    }) || null;
  },

  /**
   * Yangi unikal ID generatsiya qilish
   * @returns {string} unikal ID
   */
  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Boshlang'ich ma'lumotlarni yuklash (agar mavjud bo'lmasa)
   */
  initializeDefaults: function() {
    // Foydalanuvchilar
    if (!this.has('users')) {
      this.set('users', [
        { id: '1', login: 'admin', parol: 'admin123', rol: 'admin', ism: 'Administrator' },
        { id: '2', login: 'menejer', parol: 'menejer123', rol: 'menejer', ism: 'Menejer' },
        { id: '3', login: 'sotuvchi', parol: 'sotuvchi123', rol: 'sotuvchi', ism: 'Sotuvchi' }
      ]);
    }

    // Mahsulotlar (bo'sh massiv)
    if (!this.has('products')) {
      this.set('products', []);
    }

    // Buyurtmalar (bo'sh massiv)
    if (!this.has('orders')) {
      this.set('orders', []);
    }
  }
};

// Sahifa yuklanganda boshlang'ich ma'lumotlarni yuklash
Storage.initializeDefaults();
