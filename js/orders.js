/**
 * Muzqaymoq Do'koni - Buyurtmalar moduli
 * Buyurtmalar CRUD, qidirish, filtrlash, status boshqaruvi
 */

const Orders = {
  // Sahifalash sozlamalari
  itemsPerPage: 10,
  currentPage: 1,
  currentFilter: 'all',
  currentSearch: '',

  // Statuslar
  statuses: {
    'yangi': { label: 'Yangi', color: '#3498db', bg: '#e3f2fd' },
    'tayyorlanmoqda': { label: 'Tayyorlanmoqda', color: '#f39c12', bg: '#fff3e0' },
    'tayyor': { label: 'Tayyor', color: '#27ae60', bg: '#e8f5e9' },
    'berildi': { label: 'Berildi', color: '#8e44ad', bg: '#f3e5f5' }
  },

  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.renderOrders();
    this.setupEventListeners();
    this.checkPermissions();
    this.renderStats();
  },

  /**
   * Rolga asoslangan ruxsatlarni tekshirish
   */
  checkPermissions: function() {
    var user = Auth.getCurrentUser();
    if (!user) return;

    // Sotuvchi buyurtma yaratishi va statusni o'zgartirishi mumkin
    // lekin o'chira olmaydi
    if (user.rol === 'sotuvchi') {
      document.body.classList.add('sotuvchi-mode');
    }
  },

  /**
   * Hodisalar tinglovchilarini sozlash
   */
  setupEventListeners: function() {
    var self = this;

    // Yangi buyurtma tugmasi
    var addBtn = document.getElementById('addOrderBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        self.openOrderModal();
      });
    }

    // Qidirish
    var searchInput = document.getElementById('orderSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        self.currentSearch = this.value.trim().toLowerCase();
        self.currentPage = 1;
        self.renderOrders();
      });
    }

    // Status filtri
    var filterSelect = document.getElementById('statusFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', function() {
        self.currentFilter = this.value;
        self.currentPage = 1;
        self.renderOrders();
      });
    }

    // Modal yopish
    var closeModal = document.getElementById('closeOrderModal');
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        self.closeModal('orderModal');
      });
    }

    var cancelOrderBtn = document.getElementById('cancelOrderBtn');
    if (cancelOrderBtn) {
      cancelOrderBtn.addEventListener('click', function() {
        self.closeModal('orderModal');
      });
    }

    // Modal tashqarisiga bosish
    var orderModal = document.getElementById('orderModal');
    if (orderModal) {
      orderModal.addEventListener('click', function(e) {
        if (e.target === orderModal) {
          self.closeModal('orderModal');
        }
      });
    }

    // Detail modal yopish
    var closeDetail = document.getElementById('closeDetailModal');
    if (closeDetail) {
      closeDetail.addEventListener('click', function() {
        self.closeModal('orderDetailModal');
      });
    }

    var detailModal = document.getElementById('orderDetailModal');
    if (detailModal) {
      detailModal.addEventListener('click', function(e) {
        if (e.target === detailModal) {
          self.closeModal('orderDetailModal');
        }
      });
    }

    // Mahsulot qo'shish
    var addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', function() {
        self.addOrderItem();
      });
    }

    // Buyurtmani saqlash
    var orderForm = document.getElementById('orderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        self.saveOrder();
      });
    }
  },

  /**
   * Statistikani ko'rsatish
   */
  renderStats: function() {
    var orders = Storage.get('orders', []);
    var today = new Date().toISOString().split('T')[0];

    var totalEl = document.getElementById('ordersTotal');
    var todayEl = document.getElementById('ordersToday');
    var activeEl = document.getElementById('ordersActive');

    if (totalEl) totalEl.textContent = orders.length;

    if (todayEl) {
      var todayCount = orders.filter(function(o) {
        return o.sana && o.sana.startsWith(today);
      }).length;
      todayEl.textContent = todayCount;
    }

    if (activeEl) {
      var activeCount = orders.filter(function(o) {
        return o.status === 'yangi' || o.status === 'tayyorlanmoqda' || o.status === 'tayyor';
      }).length;
      activeEl.textContent = activeCount;
    }
  },

  /**
   * Buyurtmalarni filtrlash
   */
  getFilteredOrders: function() {
    var orders = Storage.get('orders', []);
    var self = this;

    // Qidirish
    if (self.currentSearch) {
      orders = orders.filter(function(o) {
        return (o.raqam && o.raqam.toLowerCase().indexOf(self.currentSearch) !== -1) ||
               (o.mijozIsmi && o.mijozIsmi.toLowerCase().indexOf(self.currentSearch) !== -1) ||
               (o.mijozTelefon && o.mijozTelefon.indexOf(self.currentSearch) !== -1);
      });
    }

    // Status filtri
    if (self.currentFilter !== 'all') {
      orders = orders.filter(function(o) {
        return o.status === self.currentFilter;
      });
    }

    // Sanasi bo'yicha tartiblash (yangi birinchi)
    orders.sort(function(a, b) {
      return new Date(b.sana) - new Date(a.sana);
    });

    return orders;
  },

  /**
   * Buyurtmalar jadvalini render qilish
   */
  renderOrders: function() {
    var orders = this.getFilteredOrders();
    var totalItems = orders.length;
    var totalPages = Math.ceil(totalItems / this.itemsPerPage);

    var start = (this.currentPage - 1) * this.itemsPerPage;
    var end = start + this.itemsPerPage;
    var pageOrders = orders.slice(start, end);

    var tbody = document.getElementById('ordersTableBody');
    var emptyState = document.getElementById('ordersEmptyState');
    var tableWrapper = document.getElementById('ordersTableWrapper');
    var paginationEl = document.getElementById('ordersPagination');
    var totalCount = document.getElementById('ordersCount');

    if (totalCount) {
      totalCount.textContent = totalItems + ' ta buyurtma';
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
    var isSotuvchi = user && user.rol === 'sotuvchi';

    var html = '';
    pageOrders.forEach(function(order) {
      var statusInfo = Orders.statuses[order.status] || Orders.statuses['yangi'];
      var dateStr = Orders.formatDate(order.sana);

      html += '<tr>';
      html += '<td><strong>' + Orders.escapeHtml(order.raqam) + '</strong></td>';
      html += '<td>' + Orders.escapeHtml(order.mijozIsmi) + '</td>';
      html += '<td>' + order.mahsulotlar.length + ' xil</td>';
      html += '<td><strong>' + order.jami.toLocaleString() + " so'm</strong></td>";
      html += '<td><span class="status-badge" style="background:' + statusInfo.bg + ';color:' + statusInfo.color + '">' + statusInfo.label + '</span></td>';
      html += '<td>' + (order.tolov === 'naqd' ? 'Naqd' : 'Karta') + '</td>';
      html += '<td>' + dateStr + '</td>';
      html += '<td class="actions-cell">';
      html += '<button class="btn-icon btn-edit" onclick="Orders.viewOrder(\'' + order.id + '\')" title="Ko\'rish">&#128065;</button>';

      if (!isSotuvchi) {
        html += '<button class="btn-icon btn-delete" onclick="Orders.deleteOrder(\'' + order.id + '\')" title="O\'chirish">&#10006;</button>';
      }

      html += '</td>';
      html += '</tr>';
    });

    if (tbody) tbody.innerHTML = html;
    this.renderPagination(totalPages);
  },

  /**
   * Sahifalashni render qilish
   */
  renderPagination: function(totalPages) {
    var paginationEl = document.getElementById('ordersPagination');
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';
    var html = '';

    html += '<button class="pagination-btn' + (this.currentPage === 1 ? ' disabled' : '') + '" ';
    html += 'onclick="Orders.goToPage(' + (this.currentPage - 1) + ')" ';
    html += (this.currentPage === 1 ? 'disabled' : '') + '>&laquo;</button>';

    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="pagination-btn' + (i === this.currentPage ? ' active' : '') + '" ';
      html += 'onclick="Orders.goToPage(' + i + ')">' + i + '</button>';
    }

    html += '<button class="pagination-btn' + (this.currentPage === totalPages ? ' disabled' : '') + '" ';
    html += 'onclick="Orders.goToPage(' + (this.currentPage + 1) + ')" ';
    html += (this.currentPage === totalPages ? 'disabled' : '') + '>&raquo;</button>';

    paginationEl.innerHTML = html;
  },

  /**
   * Sahifaga o'tish
   */
  goToPage: function(page) {
    var orders = this.getFilteredOrders();
    var totalPages = Math.ceil(orders.length / this.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.renderOrders();
  },

  /**
   * Buyurtma yaratish modalini ochish
   */
  openOrderModal: function() {
    var modal = document.getElementById('orderModal');
    if (!modal) return;

    // Formani tozalash
    var form = document.getElementById('orderForm');
    if (form) form.reset();

    // Mijoz selectini to'ldirish
    var customerSelect = document.getElementById('orderCustomer');
    if (customerSelect) {
      var customers = Storage.get('customers', []);
      var html = '<option value="">Mijozni tanlang</option>';
      customers.forEach(function(c) {
        html += '<option value="' + c.id + '">' + c.ism + ' (' + c.telefon + ')</option>';
      });
      html += '<option value="new">+ Yangi mijoz</option>';
      customerSelect.innerHTML = html;
    }

    // Yangi mijoz maydoni yashirish
    var newCustomerFields = document.getElementById('newCustomerFields');
    if (newCustomerFields) newCustomerFields.style.display = 'none';

    // Mijoz tanlanganda
    if (customerSelect) {
      customerSelect.onchange = function() {
        if (newCustomerFields) {
          newCustomerFields.style.display = this.value === 'new' ? 'block' : 'none';
        }
      };
    }

    // Mahsulotlar listini tozalash
    var itemsList = document.getElementById('orderItemsList');
    if (itemsList) itemsList.innerHTML = '';

    // Birinchi mahsulot qatorini qo'shish
    this.addOrderItem();

    // Jami 0
    var totalEl = document.getElementById('orderTotal');
    if (totalEl) totalEl.textContent = "0 so'm";

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Mahsulot qatori qo'shish
   */
  addOrderItem: function() {
    var itemsList = document.getElementById('orderItemsList');
    if (!itemsList) return;

    var products = Storage.get('products', []);
    var itemIndex = itemsList.children.length;

    var div = document.createElement('div');
    div.className = 'order-item-row';
    div.setAttribute('data-index', itemIndex);

    var prodOptions = '<option value="">Mahsulotni tanlang</option>';
    products.forEach(function(p) {
      prodOptions += '<option value="' + p.id + '" data-narx="' + p.narx + '" data-qoldiq="' + p.qoldiq + '">' + p.nomi + ' (' + p.narx.toLocaleString() + " so'm)</option>";
    });

    div.innerHTML = '<div class="order-item-fields">' +
      '<div class="form-group item-product">' +
      '<select class="item-select" onchange="Orders.updateItemTotal(this)">' + prodOptions + '</select>' +
      '</div>' +
      '<div class="form-group item-qty">' +
      '<input type="number" class="item-quantity" min="1" value="1" onchange="Orders.updateItemTotal(this)" oninput="Orders.updateItemTotal(this)">' +
      '</div>' +
      '<div class="item-subtotal">0</div>' +
      '<button type="button" class="btn-icon btn-delete item-remove" onclick="Orders.removeOrderItem(this)">&#10006;</button>' +
      '</div>';

    itemsList.appendChild(div);
  },

  /**
   * Mahsulot qatorini o'chirish
   */
  removeOrderItem: function(btn) {
    var row = btn.closest('.order-item-row');
    if (row) {
      row.remove();
      this.calculateTotal();
    }
  },

  /**
   * Element summasini yangilash
   */
  updateItemTotal: function(el) {
    var row = el.closest('.order-item-row');
    if (!row) return;

    var select = row.querySelector('.item-select');
    var qtyInput = row.querySelector('.item-quantity');
    var subtotalEl = row.querySelector('.item-subtotal');

    var selectedOption = select.options[select.selectedIndex];
    var narx = selectedOption ? parseInt(selectedOption.getAttribute('data-narx')) || 0 : 0;
    var qty = parseInt(qtyInput.value) || 0;
    var subtotal = narx * qty;

    subtotalEl.textContent = subtotal.toLocaleString() + " so'm";
    this.calculateTotal();
  },

  /**
   * Umumiy summani hisoblash
   */
  calculateTotal: function() {
    var items = document.querySelectorAll('.order-item-row');
    var total = 0;

    items.forEach(function(row) {
      var select = row.querySelector('.item-select');
      var qtyInput = row.querySelector('.item-quantity');
      var selectedOption = select.options[select.selectedIndex];
      var narx = selectedOption ? parseInt(selectedOption.getAttribute('data-narx')) || 0 : 0;
      var qty = parseInt(qtyInput.value) || 0;
      total += narx * qty;
    });

    var totalEl = document.getElementById('orderTotal');
    if (totalEl) totalEl.textContent = total.toLocaleString() + " so'm";

    return total;
  },

  /**
   * Buyurtmani saqlash
   */
  saveOrder: function() {
    var customerSelect = document.getElementById('orderCustomer');
    var paymentSelect = document.getElementById('orderPayment');
    var noteInput = document.getElementById('orderNote');

    var custValue = customerSelect ? customerSelect.value : '';
    var mijozIsmi = '';
    var mijozTelefon = '';
    var mijozId = '';

    if (custValue === 'new') {
      mijozIsmi = document.getElementById('newCustomerName').value.trim();
      mijozTelefon = document.getElementById('newCustomerPhone').value.trim();
      if (!mijozIsmi || !mijozTelefon) {
        Toast.warning("Iltimos, mijoz ma'lumotlarini to'ldiring!");
        return;
      }
      // Yangi mijozni saqlash
      mijozId = Storage.generateId();
      var newCustomer = {
        id: mijozId,
        ism: mijozIsmi,
        telefon: mijozTelefon,
        manzil: ''
      };
      Storage.pushToArray('customers', newCustomer);
    } else if (custValue) {
      var customers = Storage.get('customers', []);
      var customer = customers.find(function(c) { return c.id === custValue; });
      if (customer) {
        mijozId = customer.id;
        mijozIsmi = customer.ism;
        mijozTelefon = customer.telefon;
      }
    } else {
      Toast.warning('Iltimos, mijozni tanlang!');
      return;
    }

    // Mahsulotlarni yig'ish
    var itemRows = document.querySelectorAll('.order-item-row');
    var mahsulotlar = [];
    var jami = 0;
    var valid = true;

    itemRows.forEach(function(row) {
      var select = row.querySelector('.item-select');
      var qtyInput = row.querySelector('.item-quantity');
      var prodId = select.value;
      var qty = parseInt(qtyInput.value) || 0;

      if (!prodId) {
        valid = false;
        return;
      }

      var selectedOption = select.options[select.selectedIndex];
      var narx = parseInt(selectedOption.getAttribute('data-narx')) || 0;
      var nomi = selectedOption.textContent.split(' (')[0];
      var subtotal = narx * qty;

      mahsulotlar.push({
        mahsulotId: prodId,
        nomi: nomi,
        narx: narx,
        soni: qty,
        summa: subtotal
      });

      jami += subtotal;
    });

    if (!valid || mahsulotlar.length === 0) {
      Toast.warning('Iltimos, kamida bitta mahsulot tanlang!');
      return;
    }

    // Buyurtma raqamini generatsiya qilish
    var orders = Storage.get('orders', []);
    var maxNum = 0;
    orders.forEach(function(o) {
      var num = parseInt(o.raqam.replace('#', ''));
      if (num > maxNum) maxNum = num;
    });

    var newOrder = {
      id: Storage.generateId(),
      raqam: '#' + String(maxNum + 1).padStart(4, '0'),
      mijozId: mijozId,
      mijozIsmi: mijozIsmi,
      mijozTelefon: mijozTelefon,
      mahsulotlar: mahsulotlar,
      jami: jami,
      status: 'yangi',
      tolov: paymentSelect ? paymentSelect.value : 'naqd',
      sana: new Date().toISOString(),
      yaratilgan: new Date().toISOString(),
      izoh: noteInput ? noteInput.value.trim() : ''
    };

    Storage.pushToArray('orders', newOrder);

    // Mahsulot qoldiqlarini kamaytirish
    mahsulotlar.forEach(function(item) {
      var products = Storage.get('products', []);
      var product = products.find(function(p) { return p.id === item.mahsulotId; });
      if (product) {
        var newQty = Math.max(0, product.qoldiq - item.soni);
        Storage.updateInArray('products', item.mahsulotId, { qoldiq: newQty });
      }
    });

    this.closeModal('orderModal');
    this.renderOrders();
    this.renderStats();
  },

  /**
   * Buyurtma tafsilotlarini ko'rish
   */
  viewOrder: function(orderId) {
    var order = Storage.findInArray('orders', orderId);
    if (!order) return;

    var modal = document.getElementById('orderDetailModal');
    if (!modal) return;

    var statusInfo = this.statuses[order.status] || this.statuses['yangi'];
    var dateStr = this.formatDateTime(order.sana);

    var html = '<div class="detail-header">';
    html += '<div class="detail-order-num">' + this.escapeHtml(order.raqam) + '</div>';
    html += '<span class="status-badge" style="background:' + statusInfo.bg + ';color:' + statusInfo.color + '">' + statusInfo.label + '</span>';
    html += '</div>';

    html += '<div class="detail-section">';
    html += '<h4>Mijoz ma\'lumotlari</h4>';
    html += '<p><strong>Ismi:</strong> ' + this.escapeHtml(order.mijozIsmi) + '</p>';
    html += '<p><strong>Telefon:</strong> ' + this.escapeHtml(order.mijozTelefon) + '</p>';
    html += '</div>';

    html += '<div class="detail-section">';
    html += '<h4>Buyurtma tarkibi</h4>';
    html += '<table class="detail-table"><thead><tr><th>Mahsulot</th><th>Narx</th><th>Soni</th><th>Summa</th></tr></thead><tbody>';

    order.mahsulotlar.forEach(function(item) {
      html += '<tr>';
      html += '<td>' + Orders.escapeHtml(item.nomi) + '</td>';
      html += '<td>' + item.narx.toLocaleString() + "</td>";
      html += '<td>' + item.soni + '</td>';
      html += '<td><strong>' + item.summa.toLocaleString() + "</strong></td>";
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<div class="detail-total">Jami: ' + order.jami.toLocaleString() + " so'm</div>";
    html += '</div>';

    html += '<div class="detail-section">';
    html += '<p><strong>To\'lov:</strong> ' + (order.tolov === 'naqd' ? 'Naqd pul' : 'Karta') + '</p>';
    html += '<p><strong>Sana:</strong> ' + dateStr + '</p>';
    if (order.izoh) {
      html += '<p><strong>Izoh:</strong> ' + this.escapeHtml(order.izoh) + '</p>';
    }
    html += '</div>';

    // Status o'zgartirish
    var user = Auth.getCurrentUser();
    var canChangeStatus = true;

    if (user && user.rol === 'sotuvchi') {
      // Sotuvchi faqat tayyor va berildi qila oladi
      canChangeStatus = true;
    }

    if (canChangeStatus) {
      html += '<div class="detail-section">';
      html += '<h4>Statusni o\'zgartirish</h4>';
      html += '<div class="status-buttons">';

      var statusKeys = Object.keys(this.statuses);
      var self = this;

      statusKeys.forEach(function(key) {
        var info = self.statuses[key];
        var isActive = order.status === key;
        var disabled = '';

        // Sotuvchi faqat tayyor va berildi qila oladi
        if (user && user.rol === 'sotuvchi' && (key === 'yangi' || key === 'tayyorlanmoqda')) {
          if (!isActive) disabled = ' disabled';
        }

        html += '<button class="btn-status' + (isActive ? ' active' : '') + '" style="--status-color:' + info.color + ';--status-bg:' + info.bg + '" onclick="Orders.changeStatus(\'' + orderId + '\', \'' + key + '\')"' + disabled + '>' + info.label + '</button>';
      });

      html += '</div></div>';
    }

    var detailBody = document.getElementById('orderDetailBody');
    if (detailBody) detailBody.innerHTML = html;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Buyurtma statusini o'zgartirish
   */
  changeStatus: function(orderId, newStatus) {
    Storage.updateInArray('orders', orderId, { status: newStatus });
    this.viewOrder(orderId);
    this.renderOrders();
    this.renderStats();
  },

  /**
   * Buyurtmani o'chirish
   */
  deleteOrder: function(orderId) {
    var order = Storage.findInArray('orders', orderId);
    if (!order) return;

    var user = Auth.getCurrentUser();
    if (user && user.rol === 'sotuvchi') {
      Toast.error("Sizda buyurtmani o'chirish huquqi yo'q!");
      return;
    }

    var confirmed = confirm(order.raqam + " buyurtmani o'chirishni tasdiqlaysizmi?");
    if (!confirmed) return;

    Storage.removeFromArray('orders', orderId);
    this.renderOrders();
    this.renderStats();
  },

  /**
   * Modalni yopish
   */
  closeModal: function(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Sanani formatlash (qisqa)
   */
  formatDate: function(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var hour = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    return day + '.' + month + ' ' + hour + ':' + min;
  },

  /**
   * Sanani to'liq formatlash
   */
  formatDateTime: function(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    var oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    var day = d.getDate();
    var month = oylar[d.getMonth()];
    var year = d.getFullYear();
    var hour = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    return day + ' ' + month + ' ' + year + ', ' + hour + ':' + min;
  },

  /**
   * HTML belgilarini himoyalash
   */
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
  }
};

// Sahifa yuklanganda modulni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  Orders.init();
});
