(function($) {
  "use strict";

  /*---------------------
   Preloader
  --------------------- */
  // Was tied to window 'load', which waits for every resource on the
  // page — including the external Google Fonts stylesheet and the
  // Google Maps iframe in #contact. If either is slow or unreachable
  // (no/weak internet when opening the file locally), 'load' never
  // fires and the fixed, full-screen, z-index:99999 #preloader never
  // goes away — it visually blocks the whole page, which looks exactly
  // like "scroll doesn't work". DOMContentLoaded only waits on the HTML
  // document itself, so the preloader now clears regardless of those
  // external resources. A timeout is kept as a second safety net.
  function hidePreloader() {
    var pre_loader = $('#preloader');
    if (!pre_loader.length || pre_loader.data('hidden')) return;
    pre_loader.data('hidden', true);
    pre_loader.fadeOut('slow', function() {
      $(this).remove();
    });
  }

  $(document).on('DOMContentLoaded', hidePreloader);
  // jQuery fires its own ready handler even if DOMContentLoaded already
  // happened before this script ran (common with file:// + external
  // resources), so this is the reliable primary trigger.
  $(hidePreloader);
  setTimeout(hidePreloader, 3000);

  $(window).on('load', function() {
    hidePreloader();

    // Inicializar sliders después de que la página esté cargada
    initPropertySliders();
  });

  /*---------------------
   Nivo slider
  --------------------- */
  // The hero is a single real slide (the other two are empty
  // placeholders) — manualAdvance stops the auto-rotate timer, and
  // directionNav/controlNav remove the now-pointless arrows and dots.
  // index.html no longer loads the plugin (its hero is a plain section
  // now), so only run this on the pages that still include it.
  if ($.fn.nivoSlider) $('#ensign-nivoslider').nivoSlider({
    effect: 'random',
    slices: 15,
    boxCols: 12,
    boxRows: 8,
    animSpeed: 500,
    startSlide: 0,
    directionNav: false,
    controlNav: false,
    controlNavThumbs: false,
    manualAdvance: true,
  });

  /*---------------------
   Header Area
  --------------------- */

  document.addEventListener('DOMContentLoaded', function() {
    // Selectores
    const mobileNav = document.querySelector(".hamburger");
    const navbar = document.querySelector(".menubar");
    const nav = document.querySelector('nav');
    const desktopSubmenus = document.querySelectorAll('nav ul li .submenu');
    
    
    // Variables de estado
    let lastScroll = 0;
    let isMobileMenuOpen = false;
    let scrollTimeout = null;
    let isScrolling = false;

    // Función para cerrar todos los submenús
    const closeAllSubmenus = () => {
      document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.style.opacity = '0';
        submenu.style.maxHeight = '0';
        submenu.classList.remove("submenu-active");
      });
      
      document.querySelectorAll('.submenu-toggle').forEach(toggle => {
        toggle.classList.remove("active");
      });
    };

    // Función para alternar el menú móvil
    const toggleNav = (forceClose = false) => {
      if (forceClose) {
        isMobileMenuOpen = false;
        navbar.classList.remove("active");
        mobileNav.classList.remove("hamburger-active");
        closeAllSubmenus();
      } else {
        isMobileMenuOpen = !isMobileMenuOpen;
        navbar.classList.toggle("active");
        mobileNav.classList.toggle("hamburger-active");

        if (isMobileMenuOpen) {
          nav.classList.remove('scroll-down');
          nav.classList.add('scroll-up');
        }
      }

      // Screen readers: keep the hamburger <button>'s state in sync.
      mobileNav.setAttribute('aria-expanded', isMobileMenuOpen ? 'true' : 'false');
      mobileNav.setAttribute('aria-label', isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú');
    };

    // Evento para el botón hamburguesa
    if (mobileNav) {
      mobileNav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleNav();
      });
    }

    // Control de submenús
    const submenuToggles = document.querySelectorAll(".submenu-toggle");

    submenuToggles.forEach(toggle => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const parentLi = toggle.closest('li');
        const submenu = parentLi.querySelector(".submenu");
        
        // Solo alternar si no estamos en scroll
        if (!isScrolling) {
          toggle.classList.toggle("active");
          
          if (submenu.classList.contains("submenu-active")) {
            submenu.style.opacity = '0';
            submenu.style.maxHeight = '0';
            setTimeout(() => {
              submenu.classList.remove("submenu-active");
            }, 300);
          } else {
            // Cerrar otros submenús primero
            submenuToggles.forEach(otherToggle => {
              if (otherToggle !== toggle) {
                otherToggle.classList.remove("active");
                const otherSubmenu = otherToggle.closest('li').querySelector(".submenu");
                if (otherSubmenu) {
                  otherSubmenu.style.opacity = '0';
                  otherSubmenu.style.maxHeight = '0';
                  setTimeout(() => {
                    otherSubmenu.classList.remove("submenu-active");
                  }, 300);
                }
              }
            });
            
            // Abrir el submenú actual
            submenu.classList.add("submenu-active");
            setTimeout(() => {
              submenu.style.opacity = '1';
              submenu.style.maxHeight = '500px';
            }, 10);
          }
        }
      });
    });

    // Desktop flyout parents ("Comercios y PyMEs", ...) only open their
    // flyout on hover; their href="#" would otherwise jump to the top.
    document.querySelectorAll('.has-flyout > a[href="#"]').forEach((link) => {
      link.addEventListener('click', (e) => e.preventDefault());
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menubar') && !e.target.closest('.hamburger')) {
        toggleNav(true);
      }
      
      // Cerrar submenús de desktop al hacer clic fuera
      if (window.innerWidth > 991 && !e.target.closest('.has-submenu')) {
        closeAllSubmenus();
      }
    });

    // Control del scroll mejorado
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      isScrolling = true;
      
      // Limpiar el timeout si existe
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Cerrar submenús de desktop al hacer scroll
      if (window.innerWidth > 991) {
        closeAllSubmenus();
      }
      
      // Si estamos en la parte superior
      if (currentScroll <= 0) {
        nav.classList.remove('scroll-up');
        nav.classList.remove('scroll-down');
        isScrolling = false;
        return;
      }
      
      // Si el menú móvil está abierto y hacemos scroll, cerrarlo
      if (isMobileMenuOpen && Math.abs(currentScroll - lastScroll) > 5) {
        toggleNav(true);
      }
      
      // Hacia abajo
      if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
      } 
      // Hacia arriba
      else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
      }
      
      lastScroll = currentScroll;
      
      // Marcar cuando termina el scroll
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    });

    // Prevenir que el menú reaparezca automáticamente
    setInterval(() => {
      if (!isScrolling && lastScroll > 0 && !isMobileMenuOpen) {
        if (nav.classList.contains('scroll-up')) {
          nav.classList.remove('scroll-down');
          nav.classList.add('scroll-up');
        }
      }
    }, 500);

    // Cerrar submenús al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) {
        closeAllSubmenus();
      }
    });
  });

  /*---------------------
   Scrollspy js
  --------------------- */
  var Body = $('body');
  Body.scrollspy({
    target: '.navbar-collapse',
    offset: 80
  });

  /*---------------------
    Venobox
  --------------------- */
  var veno_box = $('.venobox');
  veno_box.venobox();

  /*---------------------
  Page Scroll
  --------------------- */
  var page_scroll = $('a.page-scroll');
  page_scroll.on('click', function(event) {
    var $anchor = $(this);
    var href = $anchor.attr('href');
    var $target = href && href !== '#' ? $(href) : $();
    if ($target.length) {
      $('html, body').stop().animate({
        scrollTop: $target.offset().top - 55
      }, 1500, 'easeInOutExpo');
    }
    event.preventDefault();
  });

  /*---------------------
    Footer year
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const footerYear = document.getElementById('footerYear');

    if (!footerYear) return;

    footerYear.textContent = new Date().getFullYear();
  });

  /*---------------------
    Back to top button
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('backToTopBtn');
    let scrollTimeout = null;

    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > 600) {
        backToTopBtn.classList.add('show');

        if (scrollTimeout) clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
          backToTopBtn.classList.remove('show');
        }, 3000);
      } else {
        backToTopBtn.classList.remove('show');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });

  /*---------------------
    Sistemas selector (horizontal pills)
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(document.querySelectorAll('#sistemas .sistemas-pill'));
    const panels = Array.from(document.querySelectorAll('#sistemas .sistemas-panel'));

    if (!triggers.length || !panels.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activePanel = panels.find((panel) => panel.classList.contains('is-active')) || panels[0];
    let leaveTimer = null;
    let enterTimer = null;

    function activate(targetId, focusTrigger) {
      triggers.forEach((trigger) => {
        const isMatch = trigger.getAttribute('data-target') === targetId;
        trigger.classList.toggle('is-active', isMatch);
        trigger.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        trigger.tabIndex = isMatch ? 0 : -1;

        if (isMatch && focusTrigger) {
          trigger.focus();
        }
      });

      const next = panels.find((panel) => panel.id === targetId);
      if (!next || next === activePanel) return;

      const outgoing = activePanel;
      activePanel = next;

      if (leaveTimer) clearTimeout(leaveTimer);
      if (enterTimer) clearTimeout(enterTimer);

      // A panel interrupted mid-transition by a fast second click is
      // neither the new outgoing nor the new target — snap it away
      // instantly instead of leaving it half-visible.
      panels.forEach((panel) => {
        if (panel === outgoing || panel === next) return;
        panel.classList.remove('is-leaving', 'is-entering', 'is-active');
        panel.hidden = true;
      });

      if (prefersReducedMotion) {
        if (outgoing) {
          outgoing.classList.remove('is-active', 'is-leaving', 'is-entering');
          outgoing.hidden = true;
        }
        next.classList.remove('is-leaving', 'is-entering');
        next.classList.add('is-active');
        next.hidden = false;
        return;
      }

      if (outgoing) {
        outgoing.classList.remove('is-active', 'is-entering');
        outgoing.classList.add('is-leaving');
        leaveTimer = setTimeout(() => {
          outgoing.hidden = true;
          outgoing.classList.remove('is-leaving');
        }, 180);
      }

      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      next.hidden = false;
      next.classList.add('is-entering');
      enterTimer = setTimeout(() => {
        next.classList.remove('is-entering');
      }, 500);
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        activate(trigger.getAttribute('data-target'), false);
      });

      trigger.addEventListener('keydown', (e) => {
        const group = Array.from(trigger.parentElement.children).filter((el) => el.classList.contains('sistemas-pill'));
        const index = group.indexOf(trigger);
        let nextIndex = null;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (index + 1) % group.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = (index - 1 + group.length) % group.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = group.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          activate(group[nextIndex].getAttribute('data-target'), true);
        }
      });
    });

    // #segmentos card links: open the matching business-type tab here, so
    // it's already selected when the visitor reaches this section (the
    // links themselves go on to the diagnóstico).
    document.querySelectorAll('[data-sistemas-target]').forEach((link) => {
      link.addEventListener('click', () => {
        activate(link.getAttribute('data-sistemas-target'), false);
      });
    });
  });

  /*---------------------
    Sistemas POS scene (interactive mock point-of-sale per business,
    shown when img/media/sistema-[negocio].jpg is missing)
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const scenes = Array.from(document.querySelectorAll('#sistemas .sistemas-pos-scene'));

    if (!scenes.length) return;

    const POS_DATA = {
      restaurantes: {
        name: 'Café Aroma',
        categories: ['Bebidas', 'Comidas', 'Postres'],
        products: [
          { id: 'cafe', emoji: '☕', name: 'Café americano', price: 1.50 },
          { id: 'croissant', emoji: '🥐', name: 'Croissant', price: 1.75 },
          { id: 'sandwich', emoji: '🥪', name: 'Sándwich', price: 3.25 },
          { id: 'jugo', emoji: '🥤', name: 'Jugo natural', price: 2.00 },
          { id: 'pastel', emoji: '🍰', name: 'Pastel', price: 2.50 },
          { id: 'pupusa', emoji: '🌮', name: 'Pupusa revuelta', price: 0.75 },
        ],
        initialOrder: ['cafe', 'croissant', 'sandwich'],
      },
      tiendas: {
        name: 'Minisúper La Esquina',
        categories: ['Lácteos', 'Abarrotes', 'Limpieza'],
        products: [
          { id: 'leche', emoji: '🥛', name: 'Leche', price: 1.10 },
          { id: 'pan', emoji: '🍞', name: 'Pan de caja', price: 2.25 },
          { id: 'huevos', emoji: '🥚', name: 'Huevos 12u', price: 2.80 },
          { id: 'jugo', emoji: '🧃', name: 'Jugo', price: 0.85 },
          { id: 'arroz', emoji: '🍚', name: 'Arroz 1lb', price: 0.65 },
          { id: 'jabon', emoji: '🧼', name: 'Jabón', price: 0.95 },
        ],
        initialOrder: ['leche', 'pan', 'huevos'],
      },
      farmacias: {
        name: 'Farmacia Salud',
        categories: ['Medicamentos', 'Cuidado', 'Higiene'],
        products: [
          { id: 'acetaminofen', emoji: '💊', name: 'Acetaminofén', price: 1.50 },
          { id: 'alcohol', emoji: '🧴', name: 'Alcohol gel', price: 2.25 },
          { id: 'curitas', emoji: '🩹', name: 'Curitas', price: 1.20 },
          { id: 'termometro', emoji: '🌡️', name: 'Termómetro', price: 6.50 },
          { id: 'mascarillas', emoji: '😷', name: 'Mascarillas', price: 3.00 },
          { id: 'vitaminac', emoji: '🧪', name: 'Vitamina C', price: 4.75 },
        ],
        initialOrder: ['acetaminofen', 'alcohol', 'curitas'],
      },
      ferreterias: {
        name: 'Ferretería El Tornillo',
        categories: ['Herramientas', 'Materiales', 'Pintura'],
        products: [
          { id: 'martillo', emoji: '🔨', name: 'Martillo', price: 8.50 },
          { id: 'tornillos', emoji: '🔩', name: 'Tornillos 100u', price: 3.25 },
          { id: 'desarmador', emoji: '🪛', name: 'Desarmador', price: 4.00 },
          { id: 'cubeta', emoji: '🪣', name: 'Cubeta', price: 2.75 },
          { id: 'brocha', emoji: '🖌️', name: 'Brocha', price: 1.90 },
          { id: 'cinta', emoji: '📏', name: 'Cinta métrica', price: 5.25 },
        ],
        initialOrder: ['martillo', 'tornillos', 'desarmador'],
      },
      boutiques: {
        name: 'Boutique Bella',
        categories: ['Ropa', 'Calzado', 'Accesorios'],
        products: [
          { id: 'camiseta', emoji: '👕', name: 'Camiseta', price: 12.00 },
          { id: 'vestido', emoji: '👗', name: 'Vestido', price: 28.00 },
          { id: 'jeans', emoji: '👖', name: 'Jeans', price: 24.00 },
          { id: 'tenis', emoji: '👟', name: 'Tenis', price: 35.00 },
          { id: 'bolso', emoji: '👜', name: 'Bolso', price: 22.00 },
          { id: 'gorra', emoji: '🧢', name: 'Gorra', price: 9.50 },
        ],
        initialOrder: ['camiseta', 'vestido', 'jeans'],
      },
      servicios: {
        name: 'Consultorio Integral',
        categories: ['Consultas', 'Trámites', 'Asesorías'],
        products: [
          { id: 'consulta', emoji: '🩺', name: 'Consulta', price: 25.00 },
          { id: 'certificado', emoji: '📄', name: 'Certificado', price: 10.00 },
          { id: 'asesoria', emoji: '💼', name: 'Asesoría', price: 40.00 },
          { id: 'tramite', emoji: '🗂️', name: 'Trámite', price: 15.00 },
          { id: 'declaracion', emoji: '🧾', name: 'Declaración', price: 30.00 },
          { id: 'seguimiento', emoji: '📞', name: 'Seguimiento', price: 8.00 },
        ],
        initialOrder: ['consulta', 'certificado', 'asesoria'],
      },
    };

    function escapeHtml(str) {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
    }

    function money(n) {
      return '$' + n.toFixed(2);
    }

    function qrCellsHTML() {
      const n = 7;
      let html = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const inFinder = (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
          const isRing = inFinder && (r === 1 || c === 1 || r === n - 2 || c === n - 2);
          const on = inFinder ? !isRing : Math.random() < 0.45;
          html += '<span class="pos-qr-cell' + (on ? ' is-on' : '') + '"></span>';
        }
      }
      return html;
    }

    function buildSceneHTML(data) {
      const categoriesHTML = data.categories
        .map((cat, i) => '<button type="button" class="pos-category' + (i === 0 ? ' is-active' : '') + '">' + escapeHtml(cat) + '</button>')
        .join('');

      const productsHTML = data.products
        .map(
          (p) =>
            '<button type="button" class="pos-product" data-id="' +
            p.id +
            '" aria-label="Agregar ' +
            escapeHtml(p.name) +
            ', ' +
            money(p.price) +
            '">' +
            '<span class="pos-product-emoji" aria-hidden="true">' +
            p.emoji +
            '</span>' +
            '<span class="pos-product-name">' +
            escapeHtml(p.name) +
            '</span>' +
            '<span class="pos-product-price">' +
            money(p.price) +
            '</span>' +
            '</button>'
        )
        .join('');

      return (
        '<div class="pos-stage">' +
        '<div class="pos-hardware">' +
        '<div class="pos-terminal" aria-hidden="true">' +
        '<div class="pos-terminal-screen">$0.00</div>' +
        '<div class="pos-terminal-pad"><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="pos-tablet">' +
        '<div class="pos-tablet-frame">' +
        '<div class="pos-screen">' +
        '<div class="pos-screen-topbar">' +
        '<span class="pos-business-name">' +
        escapeHtml(data.name) +
        '</span>' +
        '<span class="pos-clock"></span>' +
        '<span class="pos-user"><i class="fa-solid fa-user" aria-hidden="true"></i>Caja 1</span>' +
        '</div>' +
        '<div class="pos-screen-body">' +
        '<div class="pos-screen-left">' +
        '<div class="pos-categories">' +
        categoriesHTML +
        '</div>' +
        '<div class="pos-products">' +
        productsHTML +
        '</div>' +
        '</div>' +
        '<div class="pos-screen-right">' +
        '<div class="pos-ticket-lines"></div>' +
        '<div class="pos-ticket-totals">' +
        '<div class="pos-ticket-row"><span>Subtotal</span><span class="pos-subtotal">$0.00</span></div>' +
        '<div class="pos-ticket-row"><span>IVA 13%</span><span class="pos-iva">$0.00</span></div>' +
        '<div class="pos-ticket-row pos-ticket-total"><span>Total</span><span class="pos-total">$0.00</span></div>' +
        '</div>' +
        '<button type="button" class="pos-invoice-btn" aria-label="Facturar la orden actual">' +
        '<span class="pos-invoice-btn-label">Facturar</span>' +
        '<span class="pos-invoice-btn-spinner" aria-hidden="true"></span>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pos-tablet-neck"></div>' +
        '<div class="pos-tablet-foot"></div>' +
        '</div>' +
        '<div class="pos-printer">' +
        '<div class="pos-printer-receipt" aria-hidden="true">' +
        '<div class="pos-receipt-head">FACTURA ELECTRÓNICA · DTE</div>' +
        '<div class="pos-receipt-business">' +
        escapeHtml(data.name) +
        '</div>' +
        '<div class="pos-receipt-lines"></div>' +
        '<div class="pos-receipt-total"></div>' +
        '<div class="pos-receipt-qr"></div>' +
        '<div class="pos-receipt-thanks">¡Gracias por su compra!</div>' +
        '</div>' +
        '<div class="pos-printer-body"><div class="pos-printer-slot"></div></div>' +
        '</div>' +
        '<div class="pos-glow" aria-hidden="true"></div>' +
        '</div>' +
        '<div class="pos-notifications" aria-hidden="true">' +
        '<div class="pos-notification pos-notification-invoice"><i class="fa-solid fa-circle-check"></i><span>Factura enviada a Hacienda</span></div>' +
        '<div class="pos-notification pos-notification-sale"><i class="fa-solid fa-bag-shopping"></i><span>Venta registrada · <span class="pos-notification-amount">$0.00</span></span></div>' +
        '</div>' +
        '</div>'
      );
    }

    function initScene(scene) {
      const business = scene.getAttribute('data-business');
      const data = POS_DATA[business];

      if (!data) return;

      scene.innerHTML = buildSceneHTML(data);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const clockEl = scene.querySelector('.pos-clock');

      function updateClock() {
        const now = new Date();
        clockEl.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }

      updateClock();
      setInterval(updateClock, 15000);

      function productById(id) {
        return data.products.find((p) => p.id === id);
      }

      let order = [];

      function resetOrder() {
        order = data.initialOrder.map((id) => ({ id, qty: 1 }));
      }

      resetOrder();

      const linesEl = scene.querySelector('.pos-ticket-lines');
      const subtotalEl = scene.querySelector('.pos-subtotal');
      const ivaEl = scene.querySelector('.pos-iva');
      const totalEl = scene.querySelector('.pos-total');
      const saleAmountEl = scene.querySelector('.pos-notification-amount');

      function renderTicket() {
        // Diffed against existing nodes (by product id) instead of a full
        // innerHTML rebuild, so a newly-added line can play an entrance
        // (@starting-style in CSS) and a changed quantity can flash,
        // rather than every line silently teleporting into existence.
        const seenIds = new Set();

        order.forEach((line) => {
          const p = productById(line.id);
          const label = line.qty + '× ' + p.name;
          const priceText = money(p.price * line.qty);

          seenIds.add(line.id);

          let el = linesEl.querySelector('.pos-ticket-line[data-id="' + line.id + '"]');

          if (el) {
            const labelEl = el.querySelector('.pos-ticket-line-label');
            const priceEl = el.querySelector('.pos-ticket-line-price');
            const changed = labelEl.textContent !== label || priceEl.textContent !== priceText;

            labelEl.textContent = label;
            priceEl.textContent = priceText;

            if (changed && !prefersReduced) {
              el.classList.remove('is-updated');
              void el.offsetWidth;
              el.classList.add('is-updated');
            }
          } else {
            el = document.createElement('div');
            el.className = 'pos-ticket-line';
            el.setAttribute('data-id', line.id);

            const labelEl = document.createElement('span');
            labelEl.className = 'pos-ticket-line-label';
            labelEl.textContent = label;

            const priceEl = document.createElement('span');
            priceEl.className = 'pos-ticket-line-price';
            priceEl.textContent = priceText;

            el.appendChild(labelEl);
            el.appendChild(priceEl);
            linesEl.appendChild(el);
          }
        });

        Array.from(linesEl.children).forEach((el) => {
          if (!seenIds.has(el.getAttribute('data-id'))) el.remove();
        });

        const subtotal = order.reduce((sum, line) => sum + productById(line.id).price * line.qty, 0);
        const iva = subtotal * 0.13;
        const total = subtotal + iva;
        const totalText = money(total);

        subtotalEl.textContent = money(subtotal);
        ivaEl.textContent = money(iva);

        if (totalEl.textContent !== totalText) {
          totalEl.textContent = totalText;
          if (!prefersReduced) {
            totalEl.classList.remove('is-updated');
            void totalEl.offsetWidth;
            totalEl.classList.add('is-updated');
          }
        }

        if (saleAmountEl) saleAmountEl.textContent = totalText;
      }

      renderTicket();

      scene.querySelectorAll('.pos-product').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const existing = order.find((l) => l.id === id);

          if (existing) {
            existing.qty += 1;
          } else {
            order.push({ id, qty: 1 });
          }

          renderTicket();

          if (!prefersReduced) {
            btn.classList.remove('is-pulsing');
            void btn.offsetWidth;
            btn.classList.add('is-pulsing');
          }
        });
      });

      scene.querySelectorAll('.pos-category').forEach((tab) => {
        tab.addEventListener('click', () => {
          scene.querySelectorAll('.pos-category').forEach((t) => t.classList.remove('is-active'));
          tab.classList.add('is-active');
        });
      });

      const invoiceBtn = scene.querySelector('.pos-invoice-btn');
      const receipt = scene.querySelector('.pos-printer-receipt');
      const receiptLines = scene.querySelector('.pos-receipt-lines');
      const receiptTotal = scene.querySelector('.pos-receipt-total');
      const receiptQr = scene.querySelector('.pos-receipt-qr');
      const invoiceNotif = scene.querySelector('.pos-notification-invoice');
      const saleNotif = scene.querySelector('.pos-notification-sale');

      let printing = false;
      let resetTimer = null;

      function pulseNotification(el) {
        if (!el || prefersReduced) return;
        el.classList.remove('is-pulsing');
        void el.offsetWidth;
        el.classList.add('is-pulsing');
      }

      invoiceBtn.addEventListener('click', () => {
        if (printing || !order.length) return;

        printing = true;
        invoiceBtn.classList.add('is-loading');
        invoiceBtn.disabled = true;

        const doPrint = () => {
          receiptLines.innerHTML = order
            .map((line) => {
              const p = productById(line.id);
              return '<div class="pos-receipt-line"><span>' + line.qty + '× ' + escapeHtml(p.name) + '</span><span>' + money(p.price * line.qty) + '</span></div>';
            })
            .join('');
          receiptTotal.textContent = 'Total ' + totalEl.textContent;
          receiptQr.innerHTML = qrCellsHTML();

          invoiceBtn.classList.remove('is-loading');
          invoiceBtn.disabled = false;

          receipt.classList.add('is-printed');
          pulseNotification(invoiceNotif);

          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            receipt.classList.remove('is-printed');
            resetOrder();
            renderTicket();
            printing = false;
          }, 4000);
        };

        if (prefersReduced) {
          doPrint();
        } else {
          setTimeout(doPrint, 800);
        }
      });

      const notifications = [invoiceNotif, saleNotif].filter(Boolean);
      const stage = scene.querySelector('.pos-stage');

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                if (stage) stage.classList.add('is-visible');
                notifications.forEach((el, i) => {
                  setTimeout(() => el.classList.add('is-visible'), prefersReduced ? 0 : 200 + i * 300);
                });
                observer.disconnect();
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(scene);
      } else {
        if (stage) stage.classList.add('is-visible');
        notifications.forEach((el) => el.classList.add('is-visible'));
      }
    }

    scenes.forEach(initScene);
  });

  /*---------------------
    Sistemas visual cards (ticket/DTE/sales floating over the photo):
    staggered scroll-reveal, the "Facturar" demo on the ticket card,
    and a desktop-only mouse parallax between the photo and the cards.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const visuals = Array.from(document.querySelectorAll('#sistemas .sistemas-panel-visual'));

    if (!visuals.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    visuals.forEach((visual) => {
      const cards = Array.from(visual.querySelectorAll('.sistemas-visual-card'));
      const ticketBtn = visual.querySelector('.sistemas-ticket-btn');
      const dteCard = visual.querySelector('.sistemas-visual-card-dte');
      const dteTimeEl = visual.querySelector('.sistemas-dte-time');

      function updateDteTime() {
        if (!dteTimeEl) return;
        const now = new Date();
        dteTimeEl.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }

      updateDteTime();
      setInterval(updateDteTime, 15000);

      // Scroll-reveal: all three cards fade/float in together the first
      // time the panel's visual scrolls into view (stagger timing lives
      // in CSS via each card's --card-delay custom property).
      if (cards.length) {
        const reveal = () => cards.forEach((card) => card.classList.add('is-visible'));

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
          reveal();
        } else {
          const revealObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  reveal();
                  revealObserver.disconnect();
                }
              });
            },
            { threshold: 0.3 }
          );
          revealObserver.observe(visual);
        }
      }

      // "Facturar" on the ticket card: 0.8s spinner, then the DTE card
      // (already on screen) pulses to confirm — same demo pattern as
      // the POS-scene fallback's own Facturar button.
      if (ticketBtn) {
        let busy = false;

        ticketBtn.addEventListener('click', () => {
          if (busy) return;

          busy = true;
          ticketBtn.classList.add('is-loading');
          ticketBtn.disabled = true;

          const finish = () => {
            ticketBtn.classList.remove('is-loading');
            ticketBtn.disabled = false;
            updateDteTime();

            if (dteCard && !prefersReducedMotion) {
              dteCard.classList.remove('is-pulsing');
              void dteCard.offsetWidth;
              dteCard.classList.add('is-pulsing');
            }

            busy = false;
          };

          if (prefersReducedMotion) {
            finish();
          } else {
            setTimeout(finish, 800);
          }
        });
      }

      // Desktop-only parallax: the photo drifts up to ~4px, the card
      // layer up to ~10px (cards read as "closer" than the photo).
      // Smoothed by the CSS transition already on both elements rather
      // than tracking the cursor 1:1.
      if (!canHover || prefersReducedMotion) return;

      const photoFrame = visual.querySelector('.sistemas-visual-photo-frame');
      const cardsLayer = visual.querySelector('.sistemas-visual-cards');

      if (!photoFrame || !cardsLayer) return;

      let rafId = null;
      let lastEvent = null;

      function applyParallax() {
        rafId = null;
        if (!lastEvent) return;

        const rect = visual.getBoundingClientRect();
        const px = (lastEvent.clientX - rect.left) / rect.width - 0.5;
        const py = (lastEvent.clientY - rect.top) / rect.height - 0.5;

        photoFrame.style.transform = 'translate(' + (px * 8).toFixed(1) + 'px, ' + (py * 8).toFixed(1) + 'px)';
        cardsLayer.style.transform = 'translate(' + (px * 20).toFixed(1) + 'px, ' + (py * 20).toFixed(1) + 'px)';
      }

      visual.addEventListener('mousemove', (e) => {
        lastEvent = e;
        if (rafId === null) rafId = requestAnimationFrame(applyParallax);
      });

      visual.addEventListener('mouseleave', () => {
        lastEvent = null;
        photoFrame.style.transform = '';
        cardsLayer.style.transform = '';
      });
    });
  });

  /*---------------------
    Diagnóstico "Encuentra tu solución" (#verificador)
    Intro → 3 questions (radio groups, Continuar/Anterior) → a
    preliminary orientation → WhatsApp. Orientation = first matching
    rule in DIAG_RULES (needs weigh most, business type adds context,
    current invoicing adapts the note). #segmentos cards preselect the
    business type. Events go to dataLayer with answer codes only.
  --------------------- */

  // Orientation texts. None of them promises features, prices, savings
  // or tax compliance; every one hands the decision to an adviser.
  const DIAG_PROFILES = {
    evaluacion: {
      title: 'Revisemos tu sistema actual',
      text: 'Ya usas un sistema de facturación. Antes de cambiar nada, conviene revisar con un asesor si responde a lo que necesitas hoy o si te conviene otra alternativa.',
    },
    personalizada: {
      title: 'Te orientamos paso a paso',
      text: 'Con tus respuestas aún no hay una dirección clara, y es normal. Un asesor puede hacerte algunas preguntas sobre tu forma de trabajar y orientarte desde ahí.',
    },
    administrativa: {
      title: 'Facturación con gestión administrativa',
      text: 'Tu operación parece requerir algo más que facturar: usuarios, procesos o reportes. Antes de proponerte una alternativa, conviene revisar tus procesos con un asesor.',
    },
    ventas: {
      title: 'Facturación conectada a tus ventas',
      text: 'Te conviene evaluar soluciones en las que la facturación forme parte de tu proceso de venta y, si lo necesitas, del control de inventario. Un asesor revisará cómo vendes y atiendes para orientarte.',
    },
    sencilla: {
      title: 'Facturación electrónica sencilla',
      text: 'Tu prioridad es emitir tus documentos electrónicos de forma simple. Evaluaremos alternativas con las funciones que realmente necesita tu operación.',
    },
  };

  // First match wins. a = { tipo, factura, gestion } (answer codes).
  const DIAG_RULES = [
    // Already has a system and doesn't ask for more: start by reviewing it.
    ['evaluacion', (a) => a.factura === 'sistema' && (a.gestion === 'solo_facturacion' || a.gestion === 'orientacion')],
    // Not enough to go on: unsure what they need plus an unclear business
    // or invoicing situation, or both business and invoicing unclear.
    ['personalizada', (a) => (a.gestion === 'orientacion' && (a.tipo === 'otro' || a.factura === 'no_seguro')) ||
      (a.tipo === 'otro' && a.factura === 'no_seguro')],
    // Stated needs decide; when they ask for guidance, the business type does.
    ['administrativa', (a) => a.gestion === 'procesos' || (a.gestion === 'orientacion' && a.tipo === 'empresa')],
    ['ventas', (a) => a.gestion === 'ventas_inventario' || (a.gestion === 'orientacion' && a.tipo === 'comercio')],
    ['sencilla', () => true],
  ];

  // Business-type context for answers that pull in different directions.
  const DIAG_CONTEXT = [
    [(a, p) => a.tipo === 'servicios' && p === 'ventas', 'Como ofreces servicios, el asesor confirmará contigo si realmente necesitas control de ventas o inventario.'],
    [(a, p) => a.tipo === 'comercio' && p === 'sencilla', 'Si además necesitas controlar tus ventas o tu inventario, el asesor lo revisará contigo.'],
    [(a, p) => a.tipo === 'empresa' && p === 'sencilla', 'Como tu empresa tiene procesos administrativos, el asesor revisará si conviene integrar otras áreas además de la facturación.'],
    [(a) => a.tipo === 'otro', 'Como tu actividad no está en la lista, el asesor confirmará qué aplica a tu caso.'],
  ];

  // How they invoice today adapts the message.
  const DIAG_NOTES = {
    sistema: 'También revisaremos si tu sistema actual puede cubrir estas necesidades.',
    facturador_mh: 'Hoy usas el facturador de Hacienda; te explicaremos en qué casos conviene otra solución.',
    fisico: 'Como hoy trabajas con documentos físicos, te orientamos para planificar el paso a documentos electrónicos.',
    iniciando: 'Como estás iniciando, conviene elegir una solución que pueda crecer con tu negocio.',
    no_seguro: 'Revisaremos contigo cómo facturas hoy para orientarte mejor.',
  };

  function diagProfile(a) {
    return DIAG_RULES.find(([, test]) => test(a))[0];
  }

  // Extra lines under the orientation: business context, then invoicing.
  function diagNotes(a, profile) {
    if (profile === 'personalizada') return [];
    const notes = [];
    const ctx = DIAG_CONTEXT.find(([test]) => test(a, profile));
    if (ctx) notes.push(ctx[1]);
    if (profile !== 'evaluacion' && DIAG_NOTES[a.factura]) notes.push(DIAG_NOTES[a.factura]);
    return notes;
  }

  // Exposed for testing the 80 combinations from the console.
  window.gramanatDiagnostico = { profile: diagProfile, notes: diagNotes, profiles: DIAG_PROFILES };

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('verificador');
    if (!root || !root.classList.contains('gn-diag')) return;

    const card = root.querySelector('.gn-diag-card');
    const progress = root.querySelector('.gn-diag-progress');
    const bars = Array.from(root.querySelectorAll('.gn-diag-bars span'));
    const stepLabel = root.querySelector('.gn-diag-step-label');
    const panels = {};
    root.querySelectorAll('[data-panel]').forEach((p) => { panels[p.dataset.panel] = p; });
    const QUESTIONS = ['tipo', 'factura', 'gestion'];
    const SEGMENT_TIPO = {
      'Profesionales independientes': 'servicios',
      'Comercios y MiPyMEs': 'comercio',
      'Empresas': 'empresa',
    };
    const WA_NUMBER = '50370043346';
    const WA_INTRO = 'Hola, visité la web de Gramanat y completé el diagnóstico. Me gustaría recibir asesoría para encontrar una solución adecuada para mi negocio.';

    let step = 'intro';
    let editing = false;
    let started = false;
    let origin = 'directo';

    const track = (event, params) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event }, params));
    };

    const answerOf = (name) => {
      const checked = root.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : null;
    };
    const answers = () => ({ tipo: answerOf('tipo'), factura: answerOf('factura'), gestion: answerOf('gestion') });
    const labelOf = (name) => {
      const checked = root.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.closest('label').textContent.replace(/\s+/g, ' ').trim() : '';
    };

    function syncNext(n) {
      const next = panels[n] && panels[n].querySelector('[data-diag="next"]');
      if (next) next.disabled = !answerOf(QUESTIONS[n - 1]);
    }

    function show(target) {
      step = target;
      Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== String(target); });

      const n = target === 'result' ? 4 : Number(target) || 0;
      progress.hidden = target === 'intro';
      bars.forEach((bar, i) => bar.classList.toggle('is-on', i < n));
      progress.setAttribute('aria-valuenow', String(Math.min(Math.max(n, 1), 3)));
      stepLabel.textContent = n >= 1 && n <= 3 ? `Paso ${n} de 3` : 'Resultado';
      if (n >= 1 && n <= 3) syncNext(n);

      // Move focus to the new question/result title for keyboard and
      // screen-reader users; bring the card's top into view if needed.
      const heading = panels[target].querySelector('.gn-diag-q, .gn-diag-res-title, [data-diag="start"]');
      if (heading && target !== 'intro') heading.focus({ preventScroll: true });
      const top = card.getBoundingClientRect().top;
      if (top < 90) window.scrollBy({ top: top - 100, behavior: 'smooth' });
    }

    function start(preTipo) {
      if (preTipo) {
        const input = root.querySelector(`input[name="tipo"][value="${preTipo}"]`);
        if (input) input.checked = true;
      }
      panels[1].querySelector('.gn-diag-pre').hidden = !preTipo;
      if (!started) {
        started = true;
        track('diagnosis_start', { origen: origin, tipo_preseleccionado: preTipo || 'ninguno' });
      }
      show(1);
    }

    function reset() {
      root.querySelectorAll('.gn-diag-opt input').forEach((input) => { input.checked = false; });
      started = false;
      editing = false;
    }

    function showResult() {
      const a = answers();
      const profileKey = diagProfile(a);
      const profile = DIAG_PROFILES[profileKey];
      const notes = diagNotes(a, profileKey);
      const result = panels.result;

      result.querySelector('.gn-diag-res-title').textContent = profile.title;
      QUESTIONS.forEach((q) => { result.querySelector(`[data-answer="${q}"]`).textContent = labelOf(q); });
      result.querySelector('.gn-diag-orient').textContent = profile.text;
      const note = result.querySelector('.gn-diag-note');
      note.textContent = notes.join(' ');
      note.hidden = notes.length === 0;

      const message = [
        WA_INTRO,
        '',
        `Tipo de negocio: ${labelOf('tipo')}`,
        `Cómo facturo hoy: ${labelOf('factura')}`,
        `Necesito gestionar: ${labelOf('gestion')}`,
        `Orientación inicial: ${profile.title}`,
        '',
        'Me gustaría una asesoría personalizada para mi caso.',
      ].join('\n');
      const cta = result.querySelector('.gn-diag-cta');
      cta.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
      cta.dataset.orientacion = profileKey;

      track('diagnosis_result', { orientacion: profileKey, tipo: a.tipo, factura: a.factura, gestion: a.gestion });
      editing = false;
      show('result');
    }

    root.querySelectorAll('.gn-diag-opt input').forEach((input) => {
      input.addEventListener('change', () => syncNext(Number(step)));
    });

    root.addEventListener('click', (e) => {
      const action = e.target.closest('[data-diag]');
      const edit = e.target.closest('[data-edit]');
      if (edit) {
        editing = true;
        show(Number(edit.dataset.edit));
        return;
      }
      if (!action) return;

      if (action.dataset.diag === 'start') {
        start(null);
      } else if (action.dataset.diag === 'next') {
        const n = Number(step);
        track('diagnosis_step_complete', { paso: n, respuesta: answerOf(QUESTIONS[n - 1]) });
        if (n === 3 || editing) showResult(); else show(n + 1);
      } else if (action.dataset.diag === 'prev') {
        show(Number(step) - 1);
      } else if (action.dataset.diag === 'restart') {
        reset();
        show('intro');
        panels.intro.querySelector('[data-diag="start"]').focus({ preventScroll: true });
      }
    });

    // Every link into the diagnóstico records where the visitor came
    // from; #segmentos cards (data-segmento) also preselect the type.
    document.querySelectorAll('a[href="#verificador"]').forEach((link) => {
      link.addEventListener('click', () => {
        origin = link.dataset.cta || (link.closest('nav, .menubar') ? 'menu' : 'enlace');
        const preTipo = SEGMENT_TIPO[link.dataset.segmento];
        if (preTipo) {
          reset();
          start(preTipo);
          // The anchor jump runs after this handler and resets focus to
          // the page; put it back on question 1 once it has happened.
          setTimeout(() => panels[1].querySelector('.gn-diag-q').focus({ preventScroll: true }), 60);
        }
      });
    });

    show('intro');
  });

  /*---------------------
    Planes price blocks — reads each card's data-precio/data-periodo
    and fills in "Cotización gratis" (no price set yet) or
    "Desde $X/periodo" (once a real price is added to the markup).
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('#planes .planes-card');

    cards.forEach((card) => {
      const precio = (card.getAttribute('data-precio') || '').trim();
      const periodo = card.getAttribute('data-periodo') || '/mes';
      const mainEl = card.querySelector('.planes-price-main');
      const subEl = card.querySelector('.planes-price-sub');

      if (!mainEl) return;

      if (precio) {
        mainEl.textContent = 'Desde $' + precio + periodo;
        if (subEl) subEl.textContent = '';
      } else {
        mainEl.textContent = 'Cotización gratis';
        if (subEl) subEl.textContent = 'Precio según tu tipo de negocio';
      }
    });
  });

  /*---------------------
    Scroll reveal (fade-up)
    Shared by #problems, #equipment, #results, #testimonios and
    #planes via the .reveal-up class.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.reveal-up');

    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach((item) => observer.observe(item));
  });

  /*---------------------
    Results strip counters
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('#results .result-number-value[data-count-to]');

    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURATION = 1500;

    const setFinal = (el) => {
      el.textContent = el.getAttribute('data-count-to');
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(setFinal);
      return;
    }

    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((counter) => observer.observe(counter));
  });

  /*---------------------
    #services bento: invoice card total count-up. Mirrors the results-
    strip counter above (same IntersectionObserver + reduced-motion
    guard), but formats a 2-decimal dollar amount instead of a plain
    integer. The 1100ms start delay matches the CSS stagger the rest of
    the mini-invoice uses (--svc-i:6 on .svc-dte-total), so the number
    starts counting right as that row fades in.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.svc-dte-total-amount[data-count-to]');

    if (!el) return;

    const target = parseFloat(el.getAttribute('data-count-to')) || 0;
    const format = (value) => '$' + value.toFixed(2);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const START_DELAY = 1100;
    const DURATION = 700;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      el.textContent = format(target);
      return;
    }

    const animateCount = () => {
      setTimeout(() => {
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = format(eased * target);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = format(target);
          }
        };

        requestAnimationFrame(step);
      }, START_DELAY);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    observer.observe(el);
  });

  /*---------------------
    Faq accordion
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('#faq .faq-item');

    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach((other) => {
          other.classList.remove('is-open');
          other.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  /*---------------------
    Faq category filters
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('#faq .faq-filter-pill');
    const items = document.querySelectorAll('#faq .faq-item');

    if (!pills.length || !items.length) return;

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter;

        pills.forEach((p) => {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-pressed', 'true');

        items.forEach((item) => {
          const matches = filter === 'todas' || item.dataset.category === filter;

          if (matches) {
            item.hidden = false;
            requestAnimationFrame(() => item.classList.remove('is-filtered-out'));
          } else {
            item.classList.add('is-filtered-out');
            window.setTimeout(() => {
              if (item.classList.contains('is-filtered-out')) item.hidden = true;
            }, 250);
          }
        });
      });
    });
  });

  /*---------------------
    Faq WhatsApp links (per-question "any doubts?" link + the aside's
    quick-question pills) — built here so the message text stays out of
    the HTML and is always encoded correctly.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '50370043346';

    document.querySelectorAll('#faq .faq-whatsapp-link').forEach((link) => {
      const question = link.closest('.faq-item')?.querySelector('.faq-question-text')?.textContent.trim();

      if (!question) return;

      const message = `Hola Gramanat, tengo una duda: ${question}`;
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    });

    document.querySelectorAll('#faq .faq-quick-btn[data-wa-message]').forEach((btn) => {
      const message = btn.dataset.waMessage;
      btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    });
  });

  /*----------------------
   Parallax
  -----------------------*/
  var well_lax = $('.wellcome-area');
  well_lax.parallax("50%", 0.4);
  var well_text = $('.wellcome-text');
  well_text.parallax("50%", 0.6);

  /*----------------------
   collapse
  -----------------------*/
  var panel_test = $('.panel-heading a');
  panel_test.on('click', function() {
    panel_test.removeClass('active');
    $(this).addClass('active');
  });

  /*---------------------
   Testimonial carousel
  ----------------------*/
  var test_carousel = $('.testimonial-carousel');
  test_carousel.owlCarousel({
    loop: true,
    nav: false,
    dots: true,
    autoplay: true,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 1
      },
      1000: {
        items: 1
      }
    }
  });
  
  /*-----------------------
   isotope active
  ------------------------*/
  // portfolio start
  $(window).on("load", function() {
    var $container = $('.awesome-project-content');
    if (!$container.length) return;
    $container.isotope({
      filter: '*',
      animationOptions: {
        duration: 750,
        easing: 'linear',
        queue: false
      }
    });
    var pro_menu = $('.project-menu li a');
    pro_menu.on("click", function() {
      var pro_menu_active = $('.project-menu li a.active');
      pro_menu_active.removeClass('active');
      $(this).addClass('active');
      var selector = $(this).attr('data-filter');
      $container.isotope({
        filter: selector,
        animationOptions: {
          duration: 750,
          easing: 'linear',
          queue: false
        }
      });
      return false;
    });

  });
  //portfolio end

  /*-----------------------
   Circular Bars - Knob
  ------------------------*/
  if (typeof($.fn.knob) != 'undefined') {
    var knob_tex = $('.knob');
    knob_tex.each(function() {
      var $this = $(this),
        knobVal = $this.attr('data-rel');

      $this.knob({
        'draw': function() {
          $(this.i).val(this.cv + '%')
        }
      });

      $this.appear(function() {
        $({
          value: 0
        }).animate({
          value: knobVal
        }, {
          duration: 2000,
          easing: 'swing',
          step: function() {
            $this.val(Math.ceil(this.value)).trigger('change');
          }
        });
      }, {
        accX: 0,
        accY: -150
      });
    });
  }

  /*---------------------
   Inicializar sliders de propiedades
   (SOLO navegación manual - sin autodesplazamiento)
  --------------------- */
  function initPropertySliders() {
    const sliders = document.querySelectorAll('.projcard-slider');
    
    sliders.forEach(slider => {
      const slides = slider.querySelector('.projcard-slides');
      const prevBtn = slider.querySelector('.slider-arrow.prev');
      const nextBtn = slider.querySelector('.slider-arrow.next');
      const dots = slider.querySelectorAll('.slider-dot');
      let currentSlide = 0;
      const totalSlides = 3;
      
      // Función para cambiar slide
      function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        slides.style.transform = `translateX(-${index * 33.333}%)`;
        currentSlide = index;
        
        // Actualizar dots
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
      
      // Event listeners para flechas
      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
          goToSlide(currentSlide - 1);
        });
        
        nextBtn.addEventListener('click', () => {
          goToSlide(currentSlide + 1);
        });
      }
      
      // Event listeners para dots
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          goToSlide(index);
        });
      });
    });
  }

  /*---------------------
    Contact cards: live WhatsApp open/closed status (computed in
    America/El_Salvador regardless of the visitor's own timezone) and
    the schedule card's "today" highlight.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const liveStatus = document.querySelector('#contact .contact-live-status');
    const liveText = document.querySelector('#contact .contact-live-text');
    const liveNote = document.querySelector('#contact .contact-live-note');
    const scheduleItems = document.querySelectorAll('#contact .contact-schedule-list li');

    if (!liveStatus && !scheduleItems.length) return;

    const svNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/El_Salvador' }));
    const day = svNow.getDay();
    const hour = svNow.getHours();
    const minutes = hour * 60 + svNow.getMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const isSaturday = day === 6;
    const isOpen = (isWeekday && minutes >= 480 && minutes < 1020) ||
      (isSaturday && minutes >= 480 && minutes < 720);

    if (liveStatus && liveText) {
      liveStatus.classList.toggle('is-open', isOpen);

      if (isOpen) {
        const closeTime = isSaturday ? '12:00 m.d.' : '5:00 p.m.';
        liveText.textContent = `Abiertos ahora · cerramos a las ${closeTime}`;
        if (liveNote) liveNote.hidden = true;
      } else {
        let when = 'mañana';
        if ((isWeekday || isSaturday) && hour < 8) {
          when = 'hoy';
        } else if (isSaturday) {
          when = 'el lunes';
        }

        liveText.textContent = `Cerrado ahora · abrimos ${when} a las 8:00 a.m.`;
        if (liveNote) {
          liveNote.hidden = false;
          liveNote.textContent = 'Déjanos tu mensaje y te respondemos al abrir';
        }
      }
    }

    if (scheduleItems.length) {
      const todayKey = isWeekday ? 'weekday' : isSaturday ? 'saturday' : 'sunday';

      scheduleItems.forEach((li) => {
        const isToday = li.dataset.scheduleDay === todayKey;
        li.classList.toggle('is-today', isToday);
        const badge = li.querySelector('.contact-schedule-today-badge');
        if (badge) badge.hidden = !isToday;
      });
    }
  });

  /*---------------------
    Contact cards: copy email to clipboard
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.querySelector('#contact .contact-copy-btn');

    if (!copyBtn) return;

    const label = copyBtn.querySelector('.contact-copy-btn-text');
    const defaultText = label ? label.textContent : '';

    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.copy;

      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        return;
      }

      if (!label) return;

      copyBtn.classList.add('is-copied');
      label.textContent = '¡Copiado! ✓';

      window.setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        label.textContent = defaultText;
      }, 2000);
    });
  });

  /*---------------------
    Contact WhatsApp strip: phone mockup chat sequence.
    Plays once, starting when the mockup scrolls into view. Respects
    prefers-reduced-motion (everything shown immediately, no timers).
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const phone = document.getElementById('contactPhone');

    if (!phone) return;

    const client = phone.querySelector('.contact-phone-bubble-client');
    const typing = phone.querySelector('.contact-phone-bubble-typing');
    const gramanat = phone.querySelector('.contact-phone-bubble-gramanat');
    const quickReplies = phone.querySelector('.contact-phone-quick-replies');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      [client, typing, gramanat, quickReplies].forEach((el) => {
        if (el) el.classList.add('is-visible');
      });
      if (typing) typing.classList.remove('is-visible');
      return;
    }

    const playSequence = () => {
      const timers = [
        [500, () => client && client.classList.add('is-visible')],
        [1500, () => typing && typing.classList.add('is-visible')],
        [3000, () => {
          if (typing) typing.classList.remove('is-visible');
          if (gramanat) gramanat.classList.add('is-visible');
        }],
        [4000, () => quickReplies && quickReplies.classList.add('is-visible')],
      ];

      timers.forEach(([delay, run]) => window.setTimeout(run, delay));
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playSequence();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(phone);
  });

  /*---------------------
    Contact WhatsApp strip: quick-reply links (same encodeURIComponent
    pattern used for the #faq WhatsApp links above).
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#contact .contact-phone-quick-btn[data-wa-message]').forEach((btn) => {
      const message = btn.dataset.waMessage;
      btn.href = `https://wa.me/50370043346?text=${encodeURIComponent(message)}`;
    });
  });

  /*---------------------
    Hero background video
    No src is set in the HTML — only assigned here, and only on desktop
    (>=768px) with prefers-reduced-motion not set, so the file is never
    requested on mobile or with reduced motion. If it's missing or fails
    to load, the video is hidden, revealing .hero-content::before's
    existing photo background underneath.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-bg-video');

    if (!video) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) return;

    const src = video.dataset.src;

    if (!src) return;

    video.addEventListener('error', () => {
      video.style.display = 'none';
    });

    video.src = src;
    video.load();
  });

  /*---------------------
    Floating WhatsApp button: step aside while a CTA sits under it
    Watches only the bottom band of the viewport where the button lives
    (rootMargin trims everything above it). Any CTA inside that band that
    also reaches the button's column hides it (.is-tucked) — it comes
    back as soon as the CTA scrolls out of the band. Mostly matters on
    phones, where full-width buttons always reach the right edge.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const floatBtn = document.querySelector('.whatsapp-float');

    if (!floatBtn || !('IntersectionObserver' in window)) return;

    // CTAs, plus the trust strip's benefits (its right column sits
    // exactly under the button on phones).
    const ctas = Array.from(document.querySelectorAll(
      '.gn-btn, .gn-seg-link, .ready-btn, .cta-demo, a[href*="wa.me/"], button[type="submit"], #verificador button, .gn-trust-list li'
    )).filter((el) => el !== floatBtn && !el.closest('nav, .menubar'));

    const covering = new Set();
    let observer = null;

    const watch = () => {
      if (observer) observer.disconnect();
      covering.clear();
      floatBtn.classList.remove('is-tucked');

      // From the fixed bottom/right offsets, not getBoundingClientRect(),
      // so a mid-transition transform can't skew the band. Band = from
      // 16px above the button down to the viewport bottom.
      const cs = getComputedStyle(floatBtn);
      const bandTop = Math.max(0, window.innerHeight - parseFloat(cs.bottom) - floatBtn.offsetHeight - 16);
      const floatLeft = document.documentElement.clientWidth - parseFloat(cs.right) - floatBtn.offsetWidth - 16;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const reachesColumn = entry.boundingClientRect.right > floatLeft;
          if (entry.isIntersecting && reachesColumn) {
            covering.add(entry.target);
          } else {
            covering.delete(entry.target);
          }
        });
        floatBtn.classList.toggle('is-tucked', covering.size > 0);
      }, { rootMargin: `-${Math.round(bandTop)}px 0px 0px 0px` });

      ctas.forEach((el) => observer.observe(el));
    };

    watch();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(watch, 200);
    });
  });

})(jQuery);
