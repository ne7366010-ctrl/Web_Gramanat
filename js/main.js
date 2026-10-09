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
  $('#ensign-nivoslider').nivoSlider({
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
    Sistemas selector (tabs + mobile chips)
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(document.querySelectorAll('#sistemas .sistemas-tab, #sistemas .sistemas-chip'));
    const panels = Array.from(document.querySelectorAll('#sistemas .sistemas-panel'));

    if (!triggers.length || !panels.length) return;

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

      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === targetId);
        panel.hidden = panel.id !== targetId;
      });
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        activate(trigger.getAttribute('data-target'), false);
      });

      trigger.addEventListener('keydown', (e) => {
        const group = Array.from(trigger.parentElement.children).filter((el) => el.classList.contains('sistemas-tab') || el.classList.contains('sistemas-chip'));
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
  });

  /*---------------------
    Services switch (segmented pill + bento group swap)
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const switchButtons = Array.from(document.querySelectorAll('#services .services-switch-option'));
    const thumb = document.querySelector('#services .services-switch-thumb');
    const groups = Array.from(document.querySelectorAll('#services .services-group'));

    if (!switchButtons.length || !groups.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function moveThumb(activeBtn) {
      if (!thumb) return;
      thumb.style.left = activeBtn.offsetLeft + 'px';
      thumb.style.width = activeBtn.offsetWidth + 'px';
    }

    function switchGroup(targetId, activeBtn) {
      const current = groups.find((g) => !g.hidden);
      const next = document.getElementById(targetId);

      if (!next || current === next) return;

      switchButtons.forEach((btn) => {
        const match = btn === activeBtn;
        btn.classList.toggle('is-active', match);
        btn.setAttribute('aria-selected', match ? 'true' : 'false');
        btn.tabIndex = match ? 0 : -1;
      });
      moveThumb(activeBtn);

      if (prefersReducedMotion) {
        if (current) current.hidden = true;
        next.hidden = false;
        return;
      }

      if (current) {
        current.classList.add('is-leaving');
        setTimeout(() => {
          current.hidden = true;
          current.classList.remove('is-leaving');
        }, 200);
      }

      next.hidden = false;
      next.classList.add('is-entering');
      setTimeout(() => {
        next.classList.remove('is-entering');
      }, 600);
    }

    switchButtons.forEach((btn) => {
      btn.addEventListener('click', () => switchGroup(btn.getAttribute('data-target'), btn));

      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

        e.preventDefault();
        const index = switchButtons.indexOf(btn);
        const nextIndex = e.key === 'ArrowRight'
          ? (index + 1) % switchButtons.length
          : (index - 1 + switchButtons.length) % switchButtons.length;
        const nextBtn = switchButtons[nextIndex];

        switchGroup(nextBtn.getAttribute('data-target'), nextBtn);
        nextBtn.focus();
      });
    });

    window.addEventListener('resize', () => {
      const active = switchButtons.find((btn) => btn.classList.contains('is-active'));
      if (active) moveThumb(active);
    });

    const initialActive = switchButtons.find((btn) => btn.classList.contains('is-active')) || switchButtons[0];
    moveThumb(initialActive);
  });

  /*---------------------
    Scroll reveal (fade-up)
    Shared by #problems, #equipment, #results and #testimonios via the
    .reveal-up class.
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
    const counters = document.querySelectorAll('#results .result-number-value');

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

})(jQuery);
