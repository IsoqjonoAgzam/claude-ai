/**
 * Muzqaymoq Do'koni - Mahsulotlar moduli
 * CRUD operatsiyalari, qidirish, filtrlash va sahifalash
 */

const Products = {
  // Sahifalash sozlamalari
  itemsPerPage: 8,
  currentPage: 1,
  currentFilter: 'all',
  currentSearch: '',

  // Toifalar
  categories: [
    'Klassik muzqaymoq',
    'Fruktli muzqaymoq',
    'Shokoladli muzqaymoq',
    'Maxsus muzqaymoq',
    'Piyola va konuslar',
    'Ichimliklar'
  ],

  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.initDefaultProducts();
    this.renderProducts();
    this.setupEventListeners();
    this.renderCategoryFilter();
    this.checkPermissions();
  },

  /**
   * Rolga asoslangan ruxsatlarni tekshirish
   */
  checkPermissions: function() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    // Sotuvchi faqat ko'rish mumkin
    if (user.rol === 'sotuvchi') {
      var addBtn = document.getElementById('addProductBtn');
      if (addBtn) addBtn.style.display = 'none';

      // Jadvalda tahrirlash/o'chirish ustunini yashirish
      document.body.classList.add('readonly-mode');
    }
  },

  /**
   * Boshlang'ich mahsulotlarni yuklash (agar bo'sh bo'lsa)
   */
  initDefaultProducts: function() {
    var products = Storage.get('products', []);
    if (products.length > 0) return;

    var defaults = [
      {
        id: Storage.generateId(),
        nomi: 'Vanilli muzqaymoq',
        toifa: 'Klassik muzqaymoq',
        narx: 15000,
        qoldiq: 50,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Shokoladli muzqaymoq',
        toifa: 'Shokoladli muzqaymoq',
        narx: 18000,
        qoldiq: 45,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Qulfi muzqaymoq',
        toifa: 'Maxsus muzqaymoq',
        narx: 22000,
        qoldiq: 30,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '4 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Mango sorbet',
        toifa: 'Fruktli muzqaymoq',
        narx: 20000,
        qoldiq: 35,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '3 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Pistachio muzqaymoq',
        toifa: 'Maxsus muzqaymoq',
        narx: 25000,
        qoldiq: 25,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '5 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Tarvuz muzqaymoq',
        toifa: 'Fruktli muzqaymoq',
        narx: 17000,
        qoldiq: 40,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '3 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Oq shokoladli muzqaymoq',
        toifa: 'Shokoladli muzqaymoq',
        narx: 20000,
        qoldiq: 30,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Vaflya konus (katta)',
        toifa: 'Piyola va konuslar',
        narx: 5000,
        qoldiq: 100,
        haroratMin: 0,
        haroratMax: 25,
        saqlashMuddati: '12 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Milkshake shokoladli',
        toifa: 'Ichimliklar',
        narx: 25000,
        qoldiq: 20,
        haroratMin: -5,
        haroratMax: 0,
        saqlashMuddati: '2 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Olcha muzqaymoq',
        toifa: 'Fruktli muzqaymoq',
        narx: 19000,
        qoldiq: 28,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '4 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Karamel muzqaymoq',
        toifa: 'Klassik muzqaymoq',
        narx: 17000,
        qoldiq: 38,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      },
      {
        id: Storage.generateId(),
        nomi: 'Vaflya piyola (kichik)',
        toifa: 'Piyola va konuslar',
        narx: 3000,
        qoldiq: 150,
        haroratMin: 0,
        haroratMax: 25,
        saqlashMuddati: '12 oy',
        rasm: '',
        yaratilgan: new Date().toISOString()
      }
    ];

    Storage.set('products', defaults);
  },

  /**
   * Hodisalar tinglovchilarini sozlash
   */
  setupEventListeners: function() {
    var self = this;

    // Qo'shish tugmasi
    var addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        self.openModal();
      });
    }

    // Modal yopish tugmalari
    var closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        self.closeModal();
      });
    }

    var cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        self.closeModal();
      });
    }

    // Modal tashqarisiga bosish
    var modal = document.getElementById('productModal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          self.closeModal();
        }
      });
    }

    // Forma yuborish
    var form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        self.saveProduct();
      });
    }

    // Qidirish
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.currentSearch = this.value.trim().toLowerCase();
        self.currentPage = 1;
        self.renderProducts();
      });
    }

    // Toifa filtri
    var filterSelect = document.getElementById('categoryFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.currentFilter = this.value;
        self.currentPage = 1;
        self.renderProducts();
      });
    }
  },

  /**
   * Toifa filtrini render qilish
   */
  renderCategoryFilter: function() {
    var filterSelect = document.getElementById('categoryFilter');
    if (!filterSelect) return;

    var html = '<option value="all">Barcha toifalar</option>';
    this.categories.forEach(function(cat) {
      html += '<option value="' + cat + '">' + cat + '</option>';
    });
    filterSelect.innerHTML = html;
  },

  /**
   * Mahsulotlarni filtrlash
   */
  getFilteredProducts: function() {
    var products = Storage.get('products', []);
    var self = this;

    // Qidirish bo'yicha filtrlash
    if (self.currentSearch) {
      products = products.filter(function(p) {
        return p.nomi.toLowerCase().indexOf(self.currentSearch) !== -1;
      });
    }

    // Toifa bo'yicha filtrlash
    if (self.currentFilter !== 'all') {
      products = products.filter(function(p) {
        return p.toifa === self.currentFilter;
      });
    }

    return products;
  },

  /**
   * Mahsulotlar jadvalini render qilish
   */
  renderProducts: function() {
    var products = this.getFilteredProducts();
    var totalItems = products.length;
    var totalPages = Math.ceil(totalItems / this.itemsPerPage);

    // Sahifalash
    var start = (this.currentPage - 1) * this.itemsPerPage;
    var end = start + this.itemsPerPage;
    var pageProducts = products.slice(start, end);

    var tbody = document.getElementById('productsTableBody');
    var emptyState = document.getElementById('emptyState');
    var tableWrapper = document.getElementById('tableWrapper');
    var paginationEl = document.getElementById('pagination');
    var totalCount = document.getElementById('totalCount');

    if (totalCount) {
      totalCount.textContent = totalItems + ' ta mahsulot';
    }

    if (totalItems === 0) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (paginationEl) paginationEl.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (paginationEl) paginationEl.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    var user = Auth.getCurrentUser();
    var isReadonly = user && user.rol === 'sotuvchi';

    var html = '';
    pageProducts.forEach(function(product, index) {
      var rowNum = start + index + 1;
      html += '<tr>';
      html += '<td>' + rowNum + '</td>';
      html += '<td><strong>' + Products.escapeHtml(product.nomi) + '</strong></td>';
      html += '<td><span class="category-badge">' + Products.escapeHtml(product.toifa) + '</span></td>';
      html += '<td>' + product.narx.toLocaleString() + " so'm" + '</td>';
      html += '<td>' + product.qoldiq + ' dona</td>';
      html += '<td>' + product.haroratMin + '&deg;C / ' + product.haroratMax + '&deg;C</td>';

      if (!isReadonly) {
        html += '<td class="actions-cell">';
        html += '<button class="btn-icon btn-edit" onclick="Products.editProduct(\'' + product.id + '\')" title="Tahrirlash">&#9998;</button>';
        html += '<button class="btn-icon btn-delete" onclick="Products.deleteProduct(\'' + product.id + '\')" title="O\'chirish">&#10006;</button>';
        html += '</td>';
      }

      html += '</tr>';
    });

    if (tbody) tbody.innerHTML = html;

    // Sahifalashni render qilish
    this.renderPagination(totalPages);
  },

  /**
   * Sahifalashni render qilish
   */
  renderPagination: function(totalPages) {
    var paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';
    var self = this;
    var html = '';

    // Oldingi tugma
    html += '<button class="pagination-btn' + (this.currentPage === 1 ? ' disabled' : '') + '" ';
    html += 'onclick="Products.goToPage(' + (this.currentPage - 1) + ')" ';
    html += (this.currentPage === 1 ? 'disabled' : '') + '>&laquo;</button>';

    // Sahifa raqamlari
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="pagination-btn' + (i === this.currentPage ? ' active' : '') + '" ';
      html += 'onclick="Products.goToPage(' + i + ')">' + i + '</button>';
    }

    // Keyingi tugma
    html += '<button class="pagination-btn' + (this.currentPage === totalPages ? ' disabled' : '') + '" ';
    html += 'onclick="Products.goToPage(' + (this.currentPage + 1) + ')" ';
    html += (this.currentPage === totalPages ? 'disabled' : '') + '>&raquo;</button>';

    paginationEl.innerHTML = html;
  },

  /**
   * Sahifaga o'tish
   */
  goToPage: function(page) {
    var products = this.getFilteredProducts();
    var totalPages = Math.ceil(products.length / this.itemsPerPage);

    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.renderProducts();
  },

  /**
   * Modalni ochish (qo'shish yoki tahrirlash)
   */
  openModal: function(productId) {
    var modal = document.getElementById('productModal');
    var modalTitle = document.getElementById('modalTitle');
    var form = document.getElementById('productForm');
    var productIdInput = document.getElementById('productId');

    if (!modal || !form) return;

    // Toifa select ni to'ldirish
    var categorySelect = document.getElementById('productCategory');
    if (categorySelect) {
      var catHtml = '<option value="">Toifani tanlang</option>';
      this.categories.forEach(function(cat) {
        catHtml += '<option value="' + cat + '">' + cat + '</option>';
      });
      categorySelect.innerHTML = catHtml;
    }

    if (productId) {
      // Tahrirlash rejimi
      var product = Storage.findInArray('products', productId);
      if (!product) return;

      modalTitle.textContent = 'Mahsulotni tahrirlash';
      productIdInput.value = product.id;
      document.getElementById('productName').value = product.nomi;
      if (categorySelect) categorySelect.value = product.toifa;
      document.getElementById('productPrice').value = product.narx;
      document.getElementById('productStock').value = product.qoldiq;
      document.getElementById('productTempMin').value = product.haroratMin;
      document.getElementById('productTempMax').value = product.haroratMax;
      document.getElementById('productShelfLife').value = product.saqlashMuddati || '';
      document.getElementById('productImage').value = product.rasm || '';
    } else {
      // Qo'shish rejimi
      modalTitle.textContent = 'Yangi mahsulot qo\'shish';
      productIdInput.value = '';
      form.reset();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Modalni yopish
   */
  closeModal: function() {
    var modal = document.getElementById('productModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Mahsulotni saqlash (qo'shish yoki yangilash)
   */
  saveProduct: function() {
    var productId = document.getElementById('productId').value;
    var nomi = document.getElementById('productName').value.trim();
    var toifa = document.getElementById('productCategory').value;
    var narx = parseInt(document.getElementById('productPrice').value);
    var qoldiq = parseInt(document.getElementById('productStock').value);
    var haroratMin = parseInt(document.getElementById('productTempMin').value);
    var haroratMax = parseInt(document.getElementById('productTempMax').value);
    var saqlashMuddati = document.getElementById('productShelfLife').value.trim();
    var rasm = document.getElementById('productImage').value.trim();

    // Validatsiya
    if (!nomi || !toifa || isNaN(narx) || isNaN(qoldiq) || isNaN(haroratMin) || isNaN(haroratMax)) {
      alert('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
      return;
    }

    if (haroratMin > haroratMax) {
      alert('Minimal harorat maksimaldan katta bo\'lishi mumkin emas!');
      return;
    }

    if (productId) {
      // Yangilash
      Storage.updateInArray('products', productId, {
        nomi: nomi,
        toifa: toifa,
        narx: narx,
        qoldiq: qoldiq,
        haroratMin: haroratMin,
        haroratMax: haroratMax,
        saqlashMuddati: saqlashMuddati,
        rasm: rasm,
        yangilangan: new Date().toISOString()
      });
    } else {
      // Yangi mahsulot
      var newProduct = {
        id: Storage.generateId(),
        nomi: nomi,
        toifa: toifa,
        narx: narx,
        qoldiq: qoldiq,
        haroratMin: haroratMin,
        haroratMax: haroratMax,
        saqlashMuddati: saqlashMuddati,
        rasm: rasm,
        yaratilgan: new Date().toISOString()
      };
      Storage.pushToArray('products', newProduct);
    }

    this.closeModal();
    this.renderProducts();
  },

  /**
   * Mahsulotni tahrirlash
   */
  editProduct: function(id) {
    this.openModal(id);
  },

  /**
   * Mahsulotni o'chirish
   */
  deleteProduct: function(id) {
    var product = Storage.findInArray('products', id);
    if (!product) return;

    var confirmed = confirm('"' + product.nomi + '" mahsulotini o\'chirishni tasdiqlaysizmi?');
    if (!confirmed) return;

    Storage.removeFromArray('products', id);
    this.renderProducts();
  },

  /**
   * HTML belgilarini himoyalash (XSS oldini olish)
   */
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
};

// Sahifa yuklanganda modulni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  Products.init();
});
