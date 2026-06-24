/**
 * Muzqaymoq Do'koni - Dashboard moduli
 * Statistikalar, diagrammalar, so'nggi buyurtmalar
 */

const Dashboard = {
  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.renderStats();
    this.renderRecentOrders();
    this.renderLowStock();
    this.renderWeeklyChart();
  },

  /**
   * Asosiy statistikalarni ko'rsatish
   */
  renderStats: function() {
    var products = Storage.get('products', []);
    var orders = Storage.get('orders', []);
    var today = new Date().toISOString().split('T')[0];

    // Mahsulotlar soni
    var totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) totalProductsEl.textContent = products.length;

    // Haftalik buyurtmalar soni
    var totalOrdersEl = document.getElementById('totalOrders');
    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;

    // Haftalik daromad (faqat berilgan buyurtmalar)
    var revenue = 0;
    orders.forEach(function(order) {
      if (order.status === 'berildi' || order.status === 'tayyor') {
        revenue += order.jami || 0;
      }
    });
    var totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl) totalRevenueEl.textContent = this.formatMoney(revenue);

    // Bugungi buyurtmalar
    var todayCount = orders.filter(function(o) {
      return o.sana && o.sana.startsWith(today);
    }).length;
    var todayOrdersEl = document.getElementById('todayOrders');
    if (todayOrdersEl) todayOrdersEl.textContent = todayCount;
  },

  /**
   * So'nggi 5 buyurtmani ko'rsatish
   */
  renderRecentOrders: function() {
    var orders = Storage.get('orders', []);
    var container = document.getElementById('recentOrdersList');
    if (!container) return;

    // Sanasi bo'yicha tartiblash
    orders.sort(function(a, b) {
      return new Date(b.sana) - new Date(a.sana);
    });

    var recent = orders.slice(0, 5);

    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>Hali buyurtmalar yo\'q</p></div>';
      return;
    }

    var statuses = {
      'yangi': { label: 'Yangi', color: '#3498db', bg: '#e3f2fd' },
      'tayyorlanmoqda': { label: 'Tayyorlanmoqda', color: '#f39c12', bg: '#fff3e0' },
      'tayyor': { label: 'Tayyor', color: '#27ae60', bg: '#e8f5e9' },
      'berildi': { label: 'Berildi', color: '#8e44ad', bg: '#f3e5f5' }
    };

    var html = '<div class="recent-orders-list">';
    recent.forEach(function(order) {
      var statusInfo = statuses[order.status] || statuses['yangi'];
      var dateStr = Dashboard.formatShortDate(order.sana);

      html += '<div class="recent-order-item">';
      html += '<div class="recent-order-info">';
      html += '<span class="recent-order-num">' + order.raqam + '</span>';
      html += '<span class="recent-order-customer">' + Dashboard.escapeHtml(order.mijozIsmi) + '</span>';
      html += '</div>';
      html += '<div class="recent-order-meta">';
      html += '<span class="recent-order-amount">' + order.jami.toLocaleString() + " so'm</span>";
      html += '<span class="status-badge status-sm" style="background:' + statusInfo.bg + ';color:' + statusInfo.color + '">' + statusInfo.label + '</span>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  },

  /**
   * Kam qolgan mahsulotlarni ko'rsatish
   */
  renderLowStock: function() {
    var products = Storage.get('products', []);
    var container = document.getElementById('lowStockList');
    if (!container) return;

    // Qoldig'i 15 dan kam bo'lganlar
    var lowStock = products.filter(function(p) {
      return p.qoldiq <= 15;
    }).sort(function(a, b) {
      return a.qoldiq - b.qoldiq;
    });

    if (lowStock.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9989;</div><p>Barcha mahsulotlar yetarli</p></div>';
      return;
    }

    var html = '<div class="low-stock-list">';
    lowStock.forEach(function(p) {
      var urgency = p.qoldiq <= 5 ? 'critical' : (p.qoldiq <= 10 ? 'warning' : 'low');
      html += '<div class="low-stock-item ' + urgency + '">';
      html += '<span class="low-stock-name">' + Dashboard.escapeHtml(p.nomi) + '</span>';
      html += '<span class="low-stock-qty">' + p.qoldiq + ' dona</span>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  },

  /**
   * Haftalik sotuvlar diagrammasini chizish (CSS bar chart)
   */
  renderWeeklyChart: function() {
    var container = document.getElementById('weeklyChart');
    if (!container) return;

    var orders = Storage.get('orders', []);
    var kunlar = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    var dailySales = [];
    var maxSale = 0;

    // Oxirgi 7 kun
    for (var i = 6; i >= 0; i--) {
      var date = new Date();
      date.setDate(date.getDate() - i);
      var dateStr = date.toISOString().split('T')[0];
      var dayName = kunlar[date.getDay()];

      var daySale = 0;
      orders.forEach(function(o) {
        if (o.sana && o.sana.startsWith(dateStr)) {
          daySale += o.jami || 0;
        }
      });

      dailySales.push({ day: dayName, amount: daySale, date: dateStr });
      if (daySale > maxSale) maxSale = daySale;
    }

    if (maxSale === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Hali sotuvlar ma\'lumoti yo\'q</p></div>';
      return;
    }

    var html = '<div class="chart-container">';
    html += '<div class="chart-bars">';

    dailySales.forEach(function(item) {
      var height = maxSale > 0 ? Math.max(4, (item.amount / maxSale) * 100) : 0;
      var isToday = item.date === new Date().toISOString().split('T')[0];

      html += '<div class="chart-bar-wrapper">';
      html += '<div class="chart-bar-value">' + Dashboard.formatShortMoney(item.amount) + '</div>';
      html += '<div class="chart-bar' + (isToday ? ' today' : '') + '" style="height:' + height + '%"></div>';
      html += '<div class="chart-bar-label">' + item.day + '</div>';
      html += '</div>';
    });

    html += '</div></div>';

    container.innerHTML = html;
  },

  /**
   * Pulni formatlash
   */
  formatMoney: function(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + " mln";
    }
    return amount.toLocaleString() + " so'm";
  },

  /**
   * Qisqa pul formati (diagramma uchun)
   */
  formatShortMoney: function(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return Math.round(amount / 1000) + 'K';
    }
    return amount.toString();
  },

  /**
   * Qisqa sana formati
   */
  formatShortDate: function(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    return day + '.' + month;
  },

  /**
   * HTML escape
   */
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
  }
};

// Sahifa yuklanganda modulni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
  Dashboard.init();
});

// Tab ga qaytganda dashboard ni avtomatik yangilash
window.addEventListener('focus', function() {
  if (typeof Dashboard !== 'undefined') {
    Dashboard.renderStats();
    Dashboard.renderRecentOrders();
    Dashboard.renderLowStock();
    Dashboard.renderWeeklyChart();
  }
});
