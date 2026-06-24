/**
 * Muzqaymoq Do'koni - Hisobotlar moduli
 * Statistikalar, grafiklar, tahlillar
 */

const Reports = {
  currentPeriod: 'today',

  /**
   * Modulni ishga tushirish
   */
  init: function() {
    this.bindEvents();
    this.render();
  },

  /**
   * Hodisalarni bog'lash
   */
  bindEvents: function() {
    var self = this;

    // Davr filtrlari
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.currentPeriod = btn.getAttribute('data-period');
        self.render();
      });
    });

    // Chop etish
    var printBtn = document.getElementById('printBtn');
    if (printBtn) {
      printBtn.addEventListener('click', function() {
        window.print();
      });
    }
  },

  /**
   * Barcha hisobotlarni render qilish
   */
  render: function() {
    var orders = this.getFilteredOrders();
    this.renderStats(orders);
    this.renderDailySalesChart(orders);
    this.renderHourlySalesChart(orders);
    this.renderTopProducts(orders);
    this.renderTopCustomers(orders);
    this.renderPaymentChart(orders);
  },

  /**
   * Sana bo'yicha filtrlangan buyurtmalarni olish
   */
  getFilteredOrders: function() {
    var orders = Storage.get('orders', []);
    var now = new Date();
    var startDate;

    switch (this.currentPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return orders.filter(function(order) {
      if (!order.sana) return false;
      var orderDate = new Date(order.sana);
      return orderDate >= startDate;
    });
  },

  /**
   * Umumiy statistikalarni render qilish
   */
  renderStats: function(orders) {
    // Jami daromad
    var revenue = 0;
    orders.forEach(function(o) {
      revenue += o.jami || 0;
    });

    // Buyurtmalar soni
    var orderCount = orders.length;

    // O'rtacha chek
    var avgCheck = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

    // Unikal mijozlar soni
    var customers = {};
    orders.forEach(function(o) {
      if (o.mijozId) customers[o.mijozId] = true;
    });
    var customerCount = Object.keys(customers).length;

    // DOM ga yozish
    var revenueEl = document.getElementById('reportRevenue');
    var orderCountEl = document.getElementById('reportOrderCount');
    var avgCheckEl = document.getElementById('reportAvgCheck');
    var customerCountEl = document.getElementById('reportCustomerCount');

    if (revenueEl) revenueEl.textContent = this.formatMoney(revenue);
    if (orderCountEl) orderCountEl.textContent = orderCount;
    if (avgCheckEl) avgCheckEl.textContent = this.formatMoney(avgCheck);
    if (customerCountEl) customerCountEl.textContent = customerCount;
  },

  /**
   * Kunlik savdo grafigini render qilish (CSS bar chart)
   */
  renderDailySalesChart: function(orders) {
    var container = document.getElementById('dailySalesChart');
    if (!container) return;

    var kunlar = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    var dailyData = [];
    var maxSale = 0;
    var daysToShow;

    switch (this.currentPeriod) {
      case 'today':
        daysToShow = 1;
        break;
      case 'week':
        daysToShow = 7;
        break;
      case 'month':
        daysToShow = new Date().getDate();
        break;
      default:
        daysToShow = 7;
    }

    // Agar bugun bo'lsa, kunlik chart ko'rsatmaymiz
    if (this.currentPeriod === 'today') {
      container.innerHTML = '<div class="chart-container"><div class="chart-bars">';
      var todayStr = new Date().toISOString().split('T')[0];
      var todaySale = 0;
      orders.forEach(function(o) {
        if (o.sana && o.sana.startsWith(todayStr)) todaySale += o.jami || 0;
      });
      container.innerHTML += '<div class="chart-bar-wrapper">';
      container.innerHTML += '<div class="chart-bar-value">' + this.formatShortMoney(todaySale) + '</div>';
      container.innerHTML += '<div class="chart-bar today" style="height:100%"></div>';
      container.innerHTML += '<div class="chart-bar-label">Bugun</div>';
      container.innerHTML += '</div></div></div>';
      return;
    }

    for (var i = daysToShow - 1; i >= 0; i--) {
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

      var label = this.currentPeriod === 'month' ? date.getDate().toString() : dayName;
      dailyData.push({ label: label, amount: daySale, isToday: i === 0 });
      if (daySale > maxSale) maxSale = daySale;
    }

    if (maxSale === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Bu davr uchun ma\'lumot yo\'q</p></div>';
      return;
    }

    var html = '<div class="chart-container"><div class="chart-bars">';
    dailyData.forEach(function(item) {
      var height = maxSale > 0 ? Math.max(4, (item.amount / maxSale) * 100) : 0;
      html += '<div class="chart-bar-wrapper">';
      html += '<div class="chart-bar-value">' + Reports.formatShortMoney(item.amount) + '</div>';
      html += '<div class="chart-bar' + (item.isToday ? ' today' : '') + '" style="height:' + height + '%"></div>';
      html += '<div class="chart-bar-label">' + item.label + '</div>';
      html += '</div>';
    });
    html += '</div></div>';

    container.innerHTML = html;
  },

  /**
   * Soatlik savdo tahlilini render qilish
   */
  renderHourlySalesChart: function(orders) {
    var container = document.getElementById('hourlySalesChart');
    if (!container) return;

    // Soatlik ma'lumotlar (10:00 - 22:00)
    var hourlyData = {};
    for (var h = 10; h <= 21; h++) {
      hourlyData[h] = { count: 0, amount: 0 };
    }

    orders.forEach(function(o) {
      if (!o.sana) return;
      var hour = new Date(o.sana).getHours();
      if (hourlyData[hour]) {
        hourlyData[hour].count++;
        hourlyData[hour].amount += o.jami || 0;
      }
    });

    var maxCount = 0;
    Object.keys(hourlyData).forEach(function(h) {
      if (hourlyData[h].count > maxCount) maxCount = hourlyData[h].count;
    });

    if (maxCount === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🕐</div><p>Bu davr uchun ma\'lumot yo\'q</p></div>';
      return;
    }

    var html = '<div class="hourly-grid">';
    Object.keys(hourlyData).forEach(function(h) {
      var data = hourlyData[h];
      var percentage = maxCount > 0 ? Math.round((data.count / maxCount) * 100) : 0;
      var intensity = percentage > 75 ? 'high' : (percentage > 40 ? 'medium' : (percentage > 0 ? 'low' : 'none'));

      html += '<div class="hourly-item">';
      html += '<div class="hourly-time">' + h + ':00</div>';
      html += '<div class="hourly-bar-wrapper">';
      html += '<div class="hourly-bar ' + intensity + '" style="width:' + percentage + '%"></div>';
      html += '</div>';
      html += '<div class="hourly-count">' + data.count + ' ta</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  },

  /**
   * TOP-5 eng ko'p sotilgan mahsulotlarni render qilish
   */
  renderTopProducts: function(orders) {
    var container = document.getElementById('topProductsList');
    if (!container) return;

    // Mahsulot bo'yicha statistika
    var productStats = {};
    orders.forEach(function(order) {
      if (!order.mahsulotlar) return;
      order.mahsulotlar.forEach(function(item) {
        if (!productStats[item.mahsulotId]) {
          productStats[item.mahsulotId] = {
            nomi: item.nomi,
            soni: 0,
            summa: 0
          };
        }
        productStats[item.mahsulotId].soni += item.soni;
        productStats[item.mahsulotId].summa += item.summa;
      });
    });

    // TOP-5 ga tartiblash
    var sorted = Object.values(productStats).sort(function(a, b) {
      return b.soni - a.soni;
    }).slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏆</div><p>Ma\'lumot yo\'q</p></div>';
      return;
    }

    var maxQty = sorted[0].soni;
    var html = '<div class="top-list">';

    sorted.forEach(function(item, index) {
      var percentage = maxQty > 0 ? Math.round((item.soni / maxQty) * 100) : 0;
      html += '<div class="top-item">';
      html += '<div class="top-item-header">';
      html += '<span class="top-rank">#' + (index + 1) + '</span>';
      html += '<span class="top-name">' + Reports.escapeHtml(item.nomi) + '</span>';
      html += '<span class="top-value">' + item.soni + ' dona</span>';
      html += '</div>';
      html += '<div class="progress-bar-wrapper">';
      html += '<div class="progress-bar progress-rank-' + (index + 1) + '" style="width:' + percentage + '%"></div>';
      html += '</div>';
      html += '<div class="top-item-footer">';
      html += '<span class="top-amount">' + item.summa.toLocaleString() + " so'm</span>";
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * TOP-5 eng faol mijozlarni render qilish
   */
  renderTopCustomers: function(orders) {
    var container = document.getElementById('topCustomersList');
    if (!container) return;

    // Mijoz bo'yicha statistika
    var customerStats = {};
    orders.forEach(function(order) {
      if (!order.mijozId) return;
      if (!customerStats[order.mijozId]) {
        customerStats[order.mijozId] = {
          ism: order.mijozIsmi,
          buyurtmalar: 0,
          jami: 0
        };
      }
      customerStats[order.mijozId].buyurtmalar++;
      customerStats[order.mijozId].jami += order.jami || 0;
    });

    // TOP-5 ga tartiblash (summa bo'yicha)
    var sorted = Object.values(customerStats).sort(function(a, b) {
      return b.jami - a.jami;
    }).slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>Ma\'lumot yo\'q</p></div>';
      return;
    }

    var maxAmount = sorted[0].jami;
    var html = '<div class="top-list">';

    sorted.forEach(function(item, index) {
      var percentage = maxAmount > 0 ? Math.round((item.jami / maxAmount) * 100) : 0;
      html += '<div class="top-item">';
      html += '<div class="top-item-header">';
      html += '<span class="top-rank">#' + (index + 1) + '</span>';
      html += '<span class="top-name">' + Reports.escapeHtml(item.ism) + '</span>';
      html += '<span class="top-value">' + item.buyurtmalar + ' ta buyurtma</span>';
      html += '</div>';
      html += '<div class="progress-bar-wrapper">';
      html += '<div class="progress-bar progress-rank-' + (index + 1) + '" style="width:' + percentage + '%"></div>';
      html += '</div>';
      html += '<div class="top-item-footer">';
      html += '<span class="top-amount">' + item.jami.toLocaleString() + " so'm</span>";
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * To'lov usullari taqsimotini render qilish (CSS donut chart)
   */
  renderPaymentChart: function(orders) {
    var container = document.getElementById('paymentChart');
    if (!container) return;

    var naqd = 0;
    var karta = 0;

    orders.forEach(function(o) {
      if (o.tolov === 'naqd') {
        naqd++;
      } else if (o.tolov === 'karta') {
        karta++;
      }
    });

    var total = naqd + karta;

    if (total === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">💳</div><p>Ma\'lumot yo\'q</p></div>';
      return;
    }

    var naqdPercent = Math.round((naqd / total) * 100);
    var kartaPercent = 100 - naqdPercent;

    // Naqd summasi va Karta summasi
    var naqdSum = 0;
    var kartaSum = 0;
    orders.forEach(function(o) {
      if (o.tolov === 'naqd') naqdSum += o.jami || 0;
      else if (o.tolov === 'karta') kartaSum += o.jami || 0;
    });

    var html = '<div class="payment-chart-wrapper">';

    // Donut chart (CSS conic-gradient)
    html += '<div class="donut-chart" style="background: conic-gradient(var(--success) 0% ' + naqdPercent + '%, var(--primary) ' + naqdPercent + '% 100%)">';
    html += '<div class="donut-hole">';
    html += '<span class="donut-total">' + total + '</span>';
    html += '<span class="donut-label">buyurtma</span>';
    html += '</div>';
    html += '</div>';

    // Legend
    html += '<div class="payment-legend">';
    html += '<div class="legend-item">';
    html += '<span class="legend-color" style="background: var(--success)"></span>';
    html += '<div class="legend-info">';
    html += '<span class="legend-name">Naqd pul</span>';
    html += '<span class="legend-value">' + naqd + ' ta (' + naqdPercent + '%)</span>';
    html += '<span class="legend-amount">' + naqdSum.toLocaleString() + " so'm</span>";
    html += '</div>';
    html += '</div>';
    html += '<div class="legend-item">';
    html += '<span class="legend-color" style="background: var(--primary)"></span>';
    html += '<div class="legend-info">';
    html += '<span class="legend-name">Plastik karta</span>';
    html += '<span class="legend-value">' + karta + ' ta (' + kartaPercent + '%)</span>';
    html += '<span class="legend-amount">' + kartaSum.toLocaleString() + " so'm</span>";
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
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
   * Qisqa pul formati
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
  Reports.init();
});
