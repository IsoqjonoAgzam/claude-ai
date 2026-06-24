/**
 * Muzqaymoq Do'koni - Boshlang'ich ma'lumotlar
 * 1 haftalik real ma'lumotlar (do'kon 7 kun ishlagan)
 */

const SampleData = {
  /**
   * Namuna ma'lumotlarni yuklash
   * Har bir kalit uchun alohida tekshiradi - mavjud bo'lsa HECH QACHON ustiga yozmaydi
   * Faqat localStorage da ma'lumot yo'q bo'lgandagina sample data yuklanadi
   */
  init: function() {
    var changed = false;

    // Mijozlar: faqat bo'sh bo'lsa yuklash
    var existingCustomers = Storage.get('customers', []);
    if (!Storage.has('customers') || existingCustomers.length === 0) {
      this.loadCustomers();
      changed = true;
    }

    // Mahsulotlar: faqat bo'sh bo'lsa yuklash
    var existingProducts = Storage.get('products', []);
    if (!Storage.has('products') || existingProducts.length === 0) {
      this.loadProducts();
      changed = true;
    }

    // Buyurtmalar: faqat bo'sh bo'lsa yuklash, MAVJUD buyurtmalarni HECH QACHON o'chirmaymiz
    var existingOrders = Storage.get('orders', []);
    if (!Storage.has('orders') || existingOrders.length === 0) {
      this.loadOrders();
      changed = true;
    }

    if (changed) {
      Storage.set('dataInitialized', true);
    }
  },

  /**
   * Mijozlar ro'yxatini yuklash
   */
  loadCustomers: function() {
    var customers = [
      { id: 'c1', ism: 'Aziz Karimov', telefon: '+998901234567', manzil: 'Toshkent, Chilonzor' },
      { id: 'c2', ism: 'Nilufar Rahimova', telefon: '+998931112233', manzil: 'Toshkent, Yunusobod' },
      { id: 'c3', ism: 'Sardor Toshmatov', telefon: '+998942223344', manzil: 'Toshkent, Mirzo Ulugbek' },
      { id: 'c4', ism: 'Malika Usmanova', telefon: '+998905556677', manzil: 'Toshkent, Sergeli' },
      { id: 'c5', ism: 'Botir Nazarov', telefon: '+998917778899', manzil: 'Toshkent, Bektemir' },
      { id: 'c6', ism: 'Dilnoza Aliyeva', telefon: '+998933334455', manzil: 'Toshkent, Shayxontohur' },
      { id: 'c7', ism: 'Jasur Mirzayev', telefon: '+998946667788', manzil: 'Toshkent, Olmazor' },
      { id: 'c8', ism: 'Zulfiya Karimova', telefon: '+998908889900', manzil: 'Toshkent, Yakkasaroy' }
    ];
    Storage.set('customers', customers);
  },

  /**
   * Mahsulotlarni yuklab, qoldiqlarni buyurtmalarga moslashtirish
   */
  loadProducts: function() {
    var products = [
      {
        id: 'p1',
        nomi: 'Vanilli muzqaymoq',
        toifa: 'Klassik muzqaymoq',
        narx: 15000,
        qoldiq: 24,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p2',
        nomi: 'Shokoladli muzqaymoq',
        toifa: 'Shokoladli muzqaymoq',
        narx: 18000,
        qoldiq: 18,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p3',
        nomi: 'Qulfi muzqaymoq',
        toifa: 'Maxsus muzqaymoq',
        narx: 22000,
        qoldiq: 15,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '4 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p4',
        nomi: 'Mango sorbet',
        toifa: 'Fruktli muzqaymoq',
        narx: 20000,
        qoldiq: 20,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '3 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p5',
        nomi: 'Pistachio muzqaymoq',
        toifa: 'Maxsus muzqaymoq',
        narx: 25000,
        qoldiq: 12,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '5 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p6',
        nomi: 'Tarvuz muzqaymoq',
        toifa: 'Fruktli muzqaymoq',
        narx: 17000,
        qoldiq: 22,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '3 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p7',
        nomi: 'Oq shokoladli muzqaymoq',
        toifa: 'Shokoladli muzqaymoq',
        narx: 20000,
        qoldiq: 16,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p8',
        nomi: 'Vaflya konus (katta)',
        toifa: 'Piyola va konuslar',
        narx: 5000,
        qoldiq: 65,
        haroratMin: 0,
        haroratMax: 25,
        saqlashMuddati: '12 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p9',
        nomi: 'Milkshake shokoladli',
        toifa: 'Ichimliklar',
        narx: 25000,
        qoldiq: 8,
        haroratMin: -5,
        haroratMax: 0,
        saqlashMuddati: '2 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p10',
        nomi: 'Olcha muzqaymoq',
        toifa: 'Fruktli muzqaymoq',
        narx: 19000,
        qoldiq: 14,
        haroratMin: -20,
        haroratMax: -16,
        saqlashMuddati: '4 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p11',
        nomi: 'Karamel muzqaymoq',
        toifa: 'Klassik muzqaymoq',
        narx: 17000,
        qoldiq: 20,
        haroratMin: -22,
        haroratMax: -18,
        saqlashMuddati: '6 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      },
      {
        id: 'p12',
        nomi: 'Vaflya piyola (kichik)',
        toifa: 'Piyola va konuslar',
        narx: 3000,
        qoldiq: 95,
        haroratMin: 0,
        haroratMax: 25,
        saqlashMuddati: '12 oy',
        rasm: '',
        yaratilgan: this.getDate(-8)
      }
    ];

    Storage.set('products', products);
  },

  /**
   * 1 haftalik buyurtmalarni generatsiya qilish
   * Dam olish kunlari ko'proq, ish kunlari kamroq
   * Tushdan keyin va kechqurun ko'proq
   */
  loadOrders: function() {
    var orders = [];
    var orderNum = 1;

    // Har bir kun uchun buyurtmalar
    for (var day = 6; day >= 0; day--) {
      var date = new Date();
      date.setDate(date.getDate() - day);
      var dayOfWeek = date.getDay(); // 0=Yakshanba, 6=Shanba

      // Dam olish kunlari ko'proq buyurtma
      var minOrders, maxOrders;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        minOrders = 6;
        maxOrders = 9;
      } else {
        minOrders = 3;
        maxOrders = 6;
      }

      var numOrders = minOrders + Math.floor(Math.random() * (maxOrders - minOrders + 1));

      for (var i = 0; i < numOrders; i++) {
        var order = this.generateOrder(date, orderNum, day);
        orders.push(order);
        orderNum++;
      }
    }

    Storage.set('orders', orders);
  },

  /**
   * Bitta buyurtma generatsiya qilish
   */
  generateOrder: function(date, orderNum, daysAgo) {
    var customers = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
    var customerNames = {
      'c1': 'Aziz Karimov',
      'c2': 'Nilufar Rahimova',
      'c3': 'Sardor Toshmatov',
      'c4': 'Malika Usmanova',
      'c5': 'Botir Nazarov',
      'c6': 'Dilnoza Aliyeva',
      'c7': 'Jasur Mirzayev',
      'c8': 'Zulfiya Karimova'
    };
    var customerPhones = {
      'c1': '+998901234567',
      'c2': '+998931112233',
      'c3': '+998942223344',
      'c4': '+998905556677',
      'c5': '+998917778899',
      'c6': '+998933334455',
      'c7': '+998946667788',
      'c8': '+998908889900'
    };

    var products = [
      { id: 'p1', nomi: 'Vanilli muzqaymoq', narx: 15000 },
      { id: 'p2', nomi: 'Shokoladli muzqaymoq', narx: 18000 },
      { id: 'p3', nomi: 'Qulfi muzqaymoq', narx: 22000 },
      { id: 'p4', nomi: 'Mango sorbet', narx: 20000 },
      { id: 'p5', nomi: 'Pistachio muzqaymoq', narx: 25000 },
      { id: 'p6', nomi: 'Tarvuz muzqaymoq', narx: 17000 },
      { id: 'p7', nomi: 'Oq shokoladli muzqaymoq', narx: 20000 },
      { id: 'p8', nomi: 'Vaflya konus (katta)', narx: 5000 },
      { id: 'p9', nomi: 'Milkshake shokoladli', narx: 25000 },
      { id: 'p10', nomi: 'Olcha muzqaymoq', narx: 19000 },
      { id: 'p11', nomi: 'Karamel muzqaymoq', narx: 17000 },
      { id: 'p12', nomi: 'Vaflya piyola (kichik)', narx: 3000 }
    ];

    // Tasodifiy mijoz
    var custId = customers[Math.floor(Math.random() * customers.length)];

    // Tasodifiy vaqt (10:00 - 22:00, tushdan keyin ko'proq)
    var hour = this.getRandomHour();
    var minute = Math.floor(Math.random() * 60);

    var orderDate = new Date(date);
    orderDate.setHours(hour, minute, 0, 0);

    // Tasodifiy mahsulotlar (1-4 xil)
    var numItems = 1 + Math.floor(Math.random() * 4);
    var items = [];
    var jami = 0;
    var usedProducts = [];

    for (var i = 0; i < numItems; i++) {
      var prod;
      do {
        prod = products[Math.floor(Math.random() * products.length)];
      } while (usedProducts.indexOf(prod.id) !== -1);

      usedProducts.push(prod.id);
      var qty = 1 + Math.floor(Math.random() * 4);
      var subtotal = prod.narx * qty;
      jami += subtotal;

      items.push({
        mahsulotId: prod.id,
        nomi: prod.nomi,
        narx: prod.narx,
        soni: qty,
        summa: subtotal
      });
    }

    // Status: eski buyurtmalar ko'proq "berildi"
    var status;
    if (daysAgo >= 4) {
      status = 'berildi';
    } else if (daysAgo >= 2) {
      var rand = Math.random();
      if (rand < 0.7) status = 'berildi';
      else if (rand < 0.9) status = 'tayyor';
      else status = 'tayyorlanmoqda';
    } else if (daysAgo === 1) {
      var rand2 = Math.random();
      if (rand2 < 0.4) status = 'berildi';
      else if (rand2 < 0.7) status = 'tayyor';
      else if (rand2 < 0.9) status = 'tayyorlanmoqda';
      else status = 'yangi';
    } else {
      // Bugun
      var rand3 = Math.random();
      if (rand3 < 0.2) status = 'berildi';
      else if (rand3 < 0.4) status = 'tayyor';
      else if (rand3 < 0.7) status = 'tayyorlanmoqda';
      else status = 'yangi';
    }

    // To'lov usuli
    var tolov = Math.random() < 0.6 ? 'naqd' : 'karta';

    return {
      id: 'ord' + orderNum,
      raqam: '#' + String(orderNum).padStart(4, '0'),
      mijozId: custId,
      mijozIsmi: customerNames[custId],
      mijozTelefon: customerPhones[custId],
      mahsulotlar: items,
      jami: jami,
      status: status,
      tolov: tolov,
      sana: orderDate.toISOString(),
      yaratilgan: orderDate.toISOString(),
      izoh: ''
    };
  },

  /**
   * Tasodifiy soat (tushdan keyin ko'proq, 10-22)
   */
  getRandomHour: function() {
    // 60% tushdan keyin (14-22), 40% ertalab (10-14)
    if (Math.random() < 0.6) {
      return 14 + Math.floor(Math.random() * 8); // 14-21
    } else {
      return 10 + Math.floor(Math.random() * 4); // 10-13
    }
  },

  /**
   * N kun oldingi sanani ISO formatda olish
   */
  getDate: function(daysOffset) {
    var d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  }
};

// Ma'lumotlarni yuklash
SampleData.init();
