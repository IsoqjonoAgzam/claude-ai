/**
 * Muzqaymoq Do'koni - Mijozlar menyusi logikasi
 * Savat, buyurtma berish, mahsulotlarni ko'rsatish
 */

const Menu = {
  cart: [],
  currentCategory: 'Barchasi',

  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.renderProducts();
    this.setupEventListeners();
  },

  /**
   * Barcha hodisalar tinglovchilari
   */
  setupEventListeners: function() {
    var self = this;

    // Toifalar filtri
    var tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        self.currentCategory = tab.getAttribute('data-category');
        self.renderProducts();
      });
    });

    // Savat ochish
    document.getElementById('openCart').addEventListener('click', function() {
      self.openCartPanel();
    });

    // Savat yopish
    document.getElementById('closeCart').addEventListener('click', function() {
      self.closeCartPanel();
    });
    document.getElementById('cartOverlay').addEventListener('click', function() {
      self.closeCartPanel();
    });

    // Buyurtma berish tugmasi
    document.getElementById('btnOrder').addEventListener('click', function() {
      self.closeCartPanel();
      self.openOrderModal();
    });

    // Modal yopish
    document.getElementById('closeOrderModal').addEventListener('click', function() {
      self.closeOrderModal();
    });
    document.getElementById('orderModalOverlay').addEventListener('click', function() {
      self.closeOrderModal();
    });

    // Buyurtma formasi
    document.getElementById('orderForm').addEventListener('submit', function(e) {
      e.preventDefault();
      self.submitOrder();
    });

    // Menyuga qaytish
    document.getElementById('btnBackMenu').addEventListener('click', function() {
      self.resetAll();
    });
  },

  /**
   * Mahsulot uchun emoji tanlash (toifaga qarab)
   */
  getProductEmoji: function(product) {
    var toifa = product.toifa || '';
    if (toifa.indexOf('Shokoladli') !== -1) return '🍫';
    if (toifa.indexOf('Fruktli') !== -1) return '🍓';
    if (toifa.indexOf('Klassik') !== -1) return '🍦';
    if (toifa.indexOf('Maxsus') !== -1) return '🌟';
    if (toifa.indexOf('Piyola') !== -1) return '🧇';
    if (toifa.indexOf('Ichimlik') !== -1) return '🥤';
    return '🍨';
  },

  /**
   * Mahsulotlarni ko'rsatish
   */
  renderProducts: function() {
    var products = Storage.get('products', []);
    var grid = document.getElementById('productsGrid');
    var emptyState = document.getElementById('emptyState');

    // Toifa bo'yicha filtrlash
    var filtered = products;
    if (this.currentCategory !== 'Barchasi') {
      filtered = products.filter(function(p) {
        return p.toifa === Menu.currentCategory;
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var p = filtered[i];
      var emoji = this.getProductEmoji(p);
      var outOfStock = p.qoldiq <= 0;
      var priceFormatted = this.formatPrice(p.narx);

      html += '<div class="product-card' + (outOfStock ? ' out-of-stock' : '') + '">';
      if (outOfStock) {
        html += '<span class="out-of-stock-badge">Tugagan</span>';
      }
      html += '<span class="product-emoji">' + emoji + '</span>';
      html += '<div class="product-name">' + this.escapeHtml(p.nomi) + '</div>';
      html += '<div class="product-price">' + priceFormatted + '</div>';
      html += '<button class="btn-add-cart" data-id="' + p.id + '"' + (outOfStock ? ' disabled' : '') + '>';
      html += outOfStock ? 'Tugagan' : 'Savatga qo\'shish';
      html += '</button>';
      html += '</div>';
    }

    grid.innerHTML = html;

    // Tugmalarga hodisa qo'shish
    var self = this;
    var buttons = grid.querySelectorAll('.btn-add-cart:not([disabled])');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var productId = btn.getAttribute('data-id');
        self.addToCart(productId);
        btn.classList.add('added');
        setTimeout(function() { btn.classList.remove('added'); }, 400);
      });
    });
  },

  /**
   * Savatga mahsulot qo'shish
   */
  addToCart: function(productId) {
    var products = Storage.get('products', []);
    var product = products.find(function(p) { return p.id === productId; });
    if (!product) return;

    // Qoldiqni tekshirish
    var cartItem = this.cart.find(function(item) { return item.id === productId; });
    var currentQty = cartItem ? cartItem.qty : 0;

    if (currentQty >= product.qoldiq) {
      this.showToast('Mahsulot qoldig\'i yetarli emas!', 'error');
      return;
    }

    if (cartItem) {
      cartItem.qty += 1;
    } else {
      this.cart.push({
        id: product.id,
        nomi: product.nomi,
        narx: product.narx,
        toifa: product.toifa,
        qty: 1
      });
    }

    this.updateCartBar();
    this.showToast(product.nomi + ' savatga qo\'shildi', 'success');
  },

  /**
   * Savatdan mahsulot o'chirish
   */
  removeFromCart: function(productId) {
    this.cart = this.cart.filter(function(item) { return item.id !== productId; });
    this.updateCartBar();
    this.renderCartPanel();
  },

  /**
   * Miqdorni o'zgartirish
   */
  changeQty: function(productId, delta) {
    var item = this.cart.find(function(i) { return i.id === productId; });
    if (!item) return;

    var products = Storage.get('products', []);
    var product = products.find(function(p) { return p.id === productId; });

    var newQty = item.qty + delta;
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (product && newQty > product.qoldiq) {
      this.showToast('Mahsulot qoldig\'i yetarli emas!', 'error');
      return;
    }

    item.qty = newQty;
    this.updateCartBar();
    this.renderCartPanel();
  },

  /**
   * Savat bar ni yangilash
   */
  updateCartBar: function() {
    var bar = document.getElementById('cartBar');
    var countEl = document.getElementById('cartCount');
    var totalEl = document.getElementById('cartTotal');

    var totalItems = 0;
    var totalSum = 0;

    for (var i = 0; i < this.cart.length; i++) {
      totalItems += this.cart[i].qty;
      totalSum += this.cart[i].narx * this.cart[i].qty;
    }

    if (totalItems > 0) {
      bar.style.display = 'block';
      countEl.textContent = totalItems;
      totalEl.textContent = this.formatPrice(totalSum);
    } else {
      bar.style.display = 'none';
    }
  },

  /**
   * Savat panelini ochish
   */
  openCartPanel: function() {
    this.renderCartPanel();
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartPanel').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Savat panelini yopish
   */
  closeCartPanel: function() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartPanel').classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Savat paneli ichini ko'rsatish
   */
  renderCartPanel: function() {
    var container = document.getElementById('cartItems');
    var totalEl = document.getElementById('cartPanelTotal');

    if (this.cart.length === 0) {
      container.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Savat bo\'sh</p></div>';
      totalEl.textContent = '0 so\'m';
      document.getElementById('btnOrder').disabled = true;
      return;
    }

    document.getElementById('btnOrder').disabled = false;
    var html = '';
    var total = 0;

    for (var i = 0; i < this.cart.length; i++) {
      var item = this.cart[i];
      var subtotal = item.narx * item.qty;
      total += subtotal;
      var emoji = this.getProductEmoji(item);

      html += '<div class="cart-item">';
      html += '<span class="cart-item-emoji">' + emoji + '</span>';
      html += '<div class="cart-item-info">';
      html += '<div class="cart-item-name">' + this.escapeHtml(item.nomi) + '</div>';
      html += '<div class="cart-item-price">' + this.formatPrice(item.narx) + ' x ' + item.qty + ' = ' + this.formatPrice(subtotal) + '</div>';
      html += '</div>';
      html += '<div class="cart-item-controls">';
      html += '<button class="qty-btn" data-id="' + item.id + '" data-action="minus">-</button>';
      html += '<span class="qty-value">' + item.qty + '</span>';
      html += '<button class="qty-btn" data-id="' + item.id + '" data-action="plus">+</button>';
      html += '</div>';
      html += '<button class="cart-item-remove" data-id="' + item.id + '">✕</button>';
      html += '</div>';
    }

    container.innerHTML = html;
    totalEl.textContent = this.formatPrice(total);

    // Hodisalar
    var self = this;
    container.querySelectorAll('.qty-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        var action = btn.getAttribute('data-action');
        self.changeQty(id, action === 'plus' ? 1 : -1);
      });
    });

    container.querySelectorAll('.cart-item-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        self.removeFromCart(id);
      });
    });
  },

  /**
   * Buyurtma modal oynasini ochish
   */
  openOrderModal: function() {
    this.renderOrderSummary();
    document.getElementById('orderModalOverlay').classList.add('active');
    document.getElementById('orderModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Buyurtma modal oynasini yopish
   */
  closeOrderModal: function() {
    document.getElementById('orderModalOverlay').classList.remove('active');
    document.getElementById('orderModal').classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Buyurtma xulosasini ko'rsatish
   */
  renderOrderSummary: function() {
    var itemsEl = document.getElementById('orderSummaryItems');
    var totalEl = document.getElementById('orderSummaryTotal');

    var html = '';
    var total = 0;

    for (var i = 0; i < this.cart.length; i++) {
      var item = this.cart[i];
      var subtotal = item.narx * item.qty;
      total += subtotal;

      html += '<div class="order-summary-item">';
      html += '<span>' + this.escapeHtml(item.nomi) + ' x' + item.qty + '</span>';
      html += '<span>' + this.formatPrice(subtotal) + '</span>';
      html += '</div>';
    }

    itemsEl.innerHTML = html;
    totalEl.textContent = this.formatPrice(total);
  },

  /**
   * Buyurtmani yuborish
   */
  submitOrder: function() {
    var name = document.getElementById('customerName').value.trim();
    var phone = document.getElementById('customerPhone').value.trim();
    var payment = document.querySelector('input[name="payment"]:checked').value;
    var note = document.getElementById('orderNote').value.trim();

    // Validatsiya
    if (!name) {
      this.showToast('Iltimos, ismingizni kiriting', 'error');
      return;
    }
    if (!phone) {
      this.showToast('Iltimos, telefon raqamni kiriting', 'error');
      return;
    }
    if (this.cart.length === 0) {
      this.showToast('Savat bo\'sh!', 'error');
      return;
    }

    // Mijozni qo'shish yoki topish
    var customerId = this.findOrCreateCustomer(name, phone);

    // Buyurtma raqamini generatsiya qilish
    var orders = Storage.get('orders', []);
    var maxNum = 0;
    for (var i = 0; i < orders.length; i++) {
      var raqam = orders[i].raqam || '';
      var num = parseInt(raqam.replace('#', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    var newNum = maxNum + 1;
    var orderRaqam = '#' + String(newNum).padStart(4, '0');

    // Mahsulotlar massivini tayyorlash
    var mahsulotlar = [];
    var jami = 0;
    for (var j = 0; j < this.cart.length; j++) {
      var item = this.cart[j];
      var summa = item.narx * item.qty;
      jami += summa;
      mahsulotlar.push({
        mahsulotId: item.id,
        nomi: item.nomi,
        narx: item.narx,
        soni: item.qty,
        summa: summa
      });
    }

    // Buyurtma ob'ekti
    var order = {
      id: Storage.generateId(),
      raqam: orderRaqam,
      mijozId: customerId,
      mijozIsmi: name,
      mijozTelefon: phone,
      mahsulotlar: mahsulotlar,
      jami: jami,
      status: 'yangi',
      tolov: payment,
      sana: new Date().toISOString(),
      yaratilgan: new Date().toISOString(),
      izoh: note
    };

    // Buyurtmani saqlash
    Storage.pushToArray('orders', order);

    // Mahsulot qoldiqlarini kamaytirish
    this.updateProductStock();

    // Muvaffaqiyat ekranini ko'rsatish
    this.closeOrderModal();
    this.showSuccess(orderRaqam);
  },

  /**
   * Mijozni topish yoki yangi yaratish
   */
  findOrCreateCustomer: function(name, phone) {
    var customers = Storage.get('customers', []);

    // Telefon bo'yicha qidirish
    var existing = customers.find(function(c) {
      return c.telefon === phone;
    });

    if (existing) {
      // Ism o'zgargan bo'lsa yangilash
      if (existing.ism !== name) {
        Storage.updateInArray('customers', existing.id, { ism: name });
      }
      return existing.id;
    }

    // Yangi mijoz yaratish
    var newCustomer = {
      id: Storage.generateId(),
      ism: name,
      telefon: phone,
      manzil: ''
    };
    Storage.pushToArray('customers', newCustomer);
    return newCustomer.id;
  },

  /**
   * Mahsulot qoldiqlarini kamaytirish
   */
  updateProductStock: function() {
    var products = Storage.get('products', []);

    for (var i = 0; i < this.cart.length; i++) {
      var cartItem = this.cart[i];
      for (var j = 0; j < products.length; j++) {
        if (products[j].id === cartItem.id) {
          products[j].qoldiq = Math.max(0, products[j].qoldiq - cartItem.qty);
          break;
        }
      }
    }

    Storage.set('products', products);
  },

  /**
   * Muvaffaqiyat ekranini ko'rsatish
   */
  showSuccess: function(orderNum) {
    document.getElementById('successOrderNum').textContent = 'Buyurtma: ' + orderNum;
    document.getElementById('successScreen').classList.add('active');
  },

  /**
   * Hammani qayta tiklash
   */
  resetAll: function() {
    this.cart = [];
    this.currentCategory = 'Barchasi';

    // UI ni tozalash
    document.getElementById('successScreen').classList.remove('active');
    document.getElementById('orderForm').reset();
    document.getElementById('cartBar').style.display = 'none';

    // Toifani qaytarish
    var tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    tabs[0].classList.add('active');

    // Mahsulotlarni qayta yuklash
    this.renderProducts();
    document.body.style.overflow = '';
  },

  /**
   * Toast xabar ko'rsatish
   */
  showToast: function(message, type) {
    // Avvalgi toast ni olib tashlash
    var existing = document.querySelector('.menu-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'menu-toast ' + (type || '');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Ko'rsatish
    setTimeout(function() { toast.classList.add('show'); }, 10);

    // Yashirish
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  },

  /**
   * Narxni formatlash
   */
  formatPrice: function(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so\'m';
  },

  /**
   * XSS dan himoya
   */
  escapeHtml: function(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  Menu.init();
});
