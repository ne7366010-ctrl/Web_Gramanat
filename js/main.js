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
      text: 'Ya utilizas un sistema de facturación. Antes de considerar un cambio, es importante evaluar si responde a las necesidades de tu negocio, qué funciones aprovechas y cuáles podrías necesitar.\n\nEn Gramanat te orientamos para identificar si tu sistema actual se adapta a tu operación o si conviene explorar otras alternativas.',
    },
    personalizada: {
      title: 'Te orientamos paso a paso',
      text: 'Con tus respuestas aún no hay una dirección clara, y es normal. Un asesor puede hacerte algunas preguntas sobre tu forma de trabajar y orientarte desde ahí.',
    },
    administrativa: {
      title: 'Facturación con gestión administrativa',
      // "tu negocio" here; the "empresa" variant says "tu empresa".
      text: 'Según tus respuestas, tu negocio necesita evaluar una solución que, además de la facturación electrónica, contemple la administración de usuarios, el control de operaciones y la generación de reportes.\n\nEn Gramanat analizamos tus necesidades para orientarte hacia una alternativa que se adapte a tu forma de trabajar.',
    },
    // Doesn't assume a POS, printer or inventory: equipment is something
    // to evaluate, not a given.
    ventas: {
      title: 'Facturación conectada a tus ventas',
      text: 'Según tus respuestas, podría convenirte una solución que integre la facturación electrónica con la gestión de ventas de tu negocio. En Gramanat podemos ayudarte a evaluar qué funcionalidades necesitas, cómo registrar tus operaciones y si requieres equipos adicionales.',
    },
    sencilla: {
      title: 'Facturación electrónica sencilla',
      text: 'Por lo que nos compartiste, tu prioridad es contar con una solución de facturación electrónica que se adapte a tu negocio, sin incorporar funciones o equipos innecesarios.\n\nEn Gramanat evaluamos tu operación para ayudarte a elegir una alternativa adecuada a tus necesidades.',
    },
  };

  // Text variants inside a result category: same orientation (and rules),
  // wording adapted to a specific situation. First match wins.
  const DIAG_VARIANTS = {
    administrativa: [
      ['empresa', (a) => a.tipo === 'empresa', {
        title: 'Facturación con gestión administrativa',
        text: 'Según tus respuestas, tu empresa necesita evaluar una solución que, además de la facturación electrónica, contemple la administración de usuarios, el control de operaciones y la generación de reportes.\n\nEn Gramanat analizamos tus necesidades para orientarte hacia una alternativa que se adapte a tu forma de trabajar.',
      }],
    ],
    personalizada: [
      // Just starting and asks for guidance: help them choose from day one.
      ['inicio', (a) => a.factura === 'iniciando', {
        title: 'Te ayudamos a elegir desde el inicio',
        text: 'Como estás comenzando tu negocio, es importante conocer cómo venderás tus productos o servicios, cómo cobrarás y qué necesitas controlar antes de elegir un sistema de facturación electrónica. En Gramanat te orientamos para identificar una solución adecuada a tu operación, evitando incorporar funciones o equipos innecesarios.',
      }],
      // Uses Hacienda's free invoicing tool and asks for guidance: review
      // whether it is enough before assuming a change (two paragraphs).
      // Professional services get wording about their activity.
      ['facturador_mh_servicios', (a) => a.factura === 'facturador_mh' && a.tipo === 'servicios', {
        title: 'Te ayudamos a elegir la mejor opción para tu negocio',
        text: 'Actualmente utilizas el facturador de Hacienda. Antes de considerar otra solución, es importante evaluar si esta herramienta cubre las necesidades de tu actividad profesional o si necesitas funciones adicionales.\n\nEn Gramanat te ayudamos a identificar qué funcionalidades se adaptan a tu forma de trabajar para que puedas tomar una decisión con mayor claridad.',
      }],
      ['facturador_mh', (a) => a.factura === 'facturador_mh', {
        title: 'Te ayudamos a elegir la mejor opción para tu negocio',
        text: 'Actualmente utilizas el facturador de Hacienda. Antes de considerar otro sistema, es importante evaluar si esta herramienta responde a las necesidades de tu negocio o si te conviene una solución con funciones adicionales.\n\nEn Gramanat te ayudamos a revisar cómo trabajas, qué necesitas controlar y qué alternativas pueden adaptarse mejor a tu operación.',
      }],
    ],
  };

  // First match wins. a = { tipo, factura, gestion } (answer codes).
  // A concrete need in question 3 always decides; "Otro" (with its typed
  // activity) and "No estoy seguro" only matter when the visitor asks
  // for guidance instead of naming a need.
  const DIAG_RULES = [
    // Already has a system and only needs invoicing (or asks for
    // guidance): start by reviewing that system.
    ['evaluacion', (a) => a.factura === 'sistema' && (a.gestion === 'solo_facturacion' || a.gestion === 'orientacion')],
    // Stated needs.
    ['administrativa', (a) => a.gestion === 'procesos'],
    ['ventas', (a) => a.gestion === 'ventas_inventario'],
    ['sencilla', (a) => a.gestion === 'solo_facturacion'],
    // Asks for guidance: the business category points the way, unless it
    // is "Otro" (a free-text activity we don't classify), they're unsure
    // how they invoice, or they use Hacienda's facturador (first check
    // whether it is enough, whatever the business type) — then an
    // adviser starts from their situation.
    ['personalizada', (a) => a.tipo === 'otro' || a.factura === 'no_seguro' || a.factura === 'facturador_mh'],
    ['administrativa', (a) => a.tipo === 'empresa'],
    ['ventas', (a) => a.tipo === 'comercio'],
    ['sencilla', () => true],
  ];

  // Business-type context for answers that pull in different directions.
  const DIAG_CONTEXT = [
    [(a, p) => a.tipo === 'servicios' && p === 'ventas', 'Como ofreces servicios, el asesor confirmará contigo si realmente necesitas control de ventas o inventario.'],
    [(a, p) => a.tipo === 'comercio' && p === 'sencilla', 'Si además necesitas controlar tus ventas o tu inventario, el asesor lo revisará contigo.'],
    [(a, p) => a.tipo === 'empresa' && p === 'sencilla', 'Como tu empresa tiene procesos administrativos, el asesor revisará si conviene integrar otras áreas además de la facturación.'],
    // No line for "Otro": the typed activity shows in the summary and the
    // WhatsApp message, and nothing should suggest the business "doesn't fit".
  ];

  // How they invoice today adapts the message.
  const DIAG_NOTES = {
    sistema: 'También revisaremos si tu sistema actual puede cubrir estas necesidades.',
    facturador_mh: 'Hoy usas el facturador de Hacienda; te explicaremos en qué casos conviene otra solución.',
    fisico: 'Como hoy trabajas con documentos físicos, te orientamos para planificar el paso a documentos electrónicos.',
    iniciando: 'Como estás iniciando, conviene elegir una solución que pueda crecer con tu negocio.',
    no_seguro: 'Como aún no tienes claro cómo facturas actualmente, un asesor también puede orientarte sobre ese aspecto.',
  };

  // Result-specific wording of an invoicing note (overrides DIAG_NOTES).
  const DIAG_NOTES_BY_PROFILE = {
    administrativa: {
      fisico: 'Como actualmente utilizas documentos físicos, también podemos orientarte sobre cómo preparar la transición hacia la facturación electrónica.',
    },
    sencilla: {
      no_seguro: 'Como aún no tienes claro cómo facturas actualmente, primero revisaremos contigo ese proceso para orientarte mejor.',
    },
  };

  function diagProfile(a) {
    return DIAG_RULES.find(([, test]) => test(a))[0];
  }

  // Title and text shown for a result: its variant if one applies.
  function diagContent(a, profile) {
    const variant = (DIAG_VARIANTS[profile] || []).find(([, test]) => test(a));
    return variant
      ? { variant: variant[0], title: variant[2].title, text: variant[2].text }
      : { variant: null, title: DIAG_PROFILES[profile].title, text: DIAG_PROFILES[profile].text };
  }

  // Extra lines under the orientation: business context, then invoicing.
  function diagNotes(a, profile) {
    if (profile === 'personalizada') return [];
    const notes = [];
    const ctx = DIAG_CONTEXT.find(([test]) => test(a, profile));
    if (ctx) notes.push(ctx[1]);
    const note = (DIAG_NOTES_BY_PROFILE[profile] || {})[a.factura] || DIAG_NOTES[a.factura];
    if (profile !== 'evaluacion' && note) notes.push(note);
    return notes;
  }

  // Exposed for testing the 80 combinations from the console.
  window.gramanatDiagnostico = { profile: diagProfile, notes: diagNotes, content: diagContent, profiles: DIAG_PROFILES };

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
    const WA_INTRO = '¡Hola! 👋 Completé el diagnóstico en la página web de Gramanat y me gustaría recibir asesoría para mi negocio.';

    let step = 'intro';
    let editing = false;
    let started = false;
    let origin = 'directo';
    // Per run: the answer each step was first completed with, and the
    // orientation first shown. Lets analytics tell first progress apart
    // from going back and changing an answer (no double counting).
    let completed = {};
    let shownProfile = null;

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

    // "Otro tipo de negocio": free-text activity. Untrusted input: only
    // ever written with textContent or encodeURIComponent, and never sent
    // to analytics (events carry the category code 'otro' only).
    const otherBox = root.querySelector('.gn-diag-other');
    const otherInput = root.querySelector('#gn-diag-otro');
    const otherText = () => (otherInput ? otherInput.value : '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

    // Shown only while "Otro" is selected; hiding keeps the typed text,
    // so it's back if the visitor picks "Otro" again or returns here.
    function syncOther() {
      if (otherBox) otherBox.hidden = answerOf('tipo') !== 'otro';
    }

    function syncNext(n) {
      const next = panels[n] && panels[n].querySelector('[data-diag="next"]');
      if (!next) return;
      const answer = answerOf(QUESTIONS[n - 1]);
      next.disabled = !answer || (n === 1 && answer === 'otro' && !otherText());
    }

    function show(target) {
      step = target;
      Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== String(target); });
      // Lets the CSS give the result screen a wider card and, on phones,
      // a compact section header.
      root.classList.toggle('is-result', target === 'result');

      const n = target === 'result' ? 4 : Number(target) || 0;
      progress.hidden = target === 'intro';
      bars.forEach((bar, i) => bar.classList.toggle('is-on', i < n));
      progress.setAttribute('aria-valuenow', String(Math.min(Math.max(n, 1), 3)));
      stepLabel.textContent = n >= 1 && n <= 3 ? `Paso ${n} de 3` : 'Resultado';
      if (n === 1) syncOther();
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
      if (otherInput) otherInput.value = '';
      started = false;
      editing = false;
      completed = {};
      shownProfile = null;
    }

    // diagnosis_step_complete: only the first time a step is completed in
    // this run. diagnosis_answer_change: a later, different answer to an
    // already completed step. Same answer again: nothing is recorded.
    function trackStep(n, answer) {
      if (!(n in completed)) {
        completed[n] = answer;
        track('diagnosis_step_complete', { paso: n, respuesta: answer });
      } else if (completed[n] !== answer) {
        track('diagnosis_answer_change', { paso: n, respuesta_anterior: completed[n], respuesta: answer });
        completed[n] = answer;
      }
    }

    function showResult() {
      const a = answers();
      const profileKey = diagProfile(a);
      const profile = diagContent(a, profileKey);
      const notes = diagNotes(a, profileKey);
      const result = panels.result;

      // "Otro": the typed activity personalises the summary and the
      // WhatsApp message; the orientation still comes from the category
      // answers (free text is never interpreted).
      const activity = a.tipo === 'otro' ? otherText() : '';
      // Display only: first letter upper-cased ("taller" → "Taller"); the
      // typed value and the WhatsApp message keep it exactly as written.
      const activityShown = activity.replace(/\p{L}/u, (c) => c.toLocaleUpperCase('es'));
      const tipoSummary = activity ? `Otro — ${activityShown}` : labelOf('tipo');
      const tipoMessage = activity || labelOf('tipo');

      result.querySelector('.gn-diag-res-title').textContent = profile.title;
      QUESTIONS.forEach((q) => { result.querySelector(`[data-answer="${q}"]`).textContent = labelOf(q); });
      result.querySelector('[data-answer="tipo"]').textContent = tipoSummary;
      // One block per paragraph ("\n\n" in the text), so the CSS controls
      // the gap between them.
      const orient = result.querySelector('.gn-diag-orient');
      orient.replaceChildren(...profile.text.split('\n\n').map((para) => {
        const span = document.createElement('span');
        span.className = 'gn-diag-orient-p';
        span.textContent = para;
        return span;
      }));
      const note = result.querySelector('.gn-diag-note');
      note.textContent = notes.join(' ');
      note.hidden = notes.length === 0;

      const message = [
        WA_INTRO,
        '',
        '📋 Mi información:',
        '',
        `🏪 Tipo de negocio: ${tipoMessage}`,
        '',
        `🧾 Facturación actual: ${labelOf('factura')}`,
        '',
        `⚙️ Necesito gestionar: ${labelOf('gestion')}`,
        '',
        `💡 Orientación recibida: ${profile.title}`,
        '',
        '¿Podrían ayudarme a evaluar las opciones disponibles y recibir una cotización personalizada?',
        '',
        '¡Muchas gracias!',
      ].join('\n');
      const cta = result.querySelector('.gn-diag-cta');
      // api.whatsapp.com/send, not wa.me: wa.me's redirect turns every emoji
      // in the text into "�"; this endpoint keeps them.
      cta.href = `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(message)}`;
      cta.dataset.orientacion = profileKey;

      // First result of the run → diagnosis_result; a later recalculation
      // that changes the orientation → diagnosis_result_change.
      if (!shownProfile) {
        track('diagnosis_result', { orientacion: profileKey, variante: profile.variant || 'general', tipo: a.tipo, factura: a.factura, gestion: a.gestion });
      } else if (shownProfile !== profileKey) {
        track('diagnosis_result_change', { orientacion_anterior: shownProfile, orientacion: profileKey });
      }
      shownProfile = profileKey;
      editing = false;
      show('result');
    }

    root.querySelectorAll('.gn-diag-opt input').forEach((input) => {
      input.addEventListener('change', () => {
        if (input.name === 'tipo') {
          syncOther();
          // Picking "Otro" by pointer: go straight to the text field.
          // (Arrow-key users stay in the radio group.)
          if (input.value === 'otro' && otherInput && !input.matches(':focus-visible')) {
            otherInput.focus({ preventScroll: true });
          }
        }
        syncNext(Number(step));
      });
    });

    if (otherInput) otherInput.addEventListener('input', () => syncNext(1));

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
        trackStep(n, answerOf(QUESTIONS[n - 1]));
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
        } else if (step === 'intro') {
          // Hero, menu and the general CTA land on the intro: put focus on
          // "Comenzar diagnóstico" so Enter starts it.
          setTimeout(() => panels.intro.querySelector('[data-diag="start"]').focus({ preventScroll: true }), 60);
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
    Sistemas y soluciones: motion graphic
    The MP4 is only requested when the section gets near the viewport
    (data-src → src), plays muted in a loop while at least a quarter of
    it is on screen and pauses when it scrolls away. Autoplay is started
    from here (play() can be refused, so the button stays usable). With
    "reduce motion" it never starts on its own: the poster stays and the
    button offers to play it. The visitor's pause is respected.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const frame = document.querySelector('.gn-sol-media-frame');
    const video = frame && frame.querySelector('.gn-sol-media-video');
    const toggle = frame && frame.querySelector('.gn-sol-media-toggle');

    if (!video || !toggle) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = reduceMotion.matches;
    let inView = false;

    video.removeAttribute('autoplay');
    video.muted = true;
    toggle.hidden = false;

    const load = () => {
      if (video.getAttribute('src')) return;
      video.src = video.dataset.src;
      video.load();
    };

    const setPlaying = (playing) => {
      frame.classList.toggle('is-playing', playing);
      if (playing) frame.classList.add('has-played');
      toggle.setAttribute('aria-label', playing ? 'Pausar animación' : 'Reproducir animación');
    };

    const play = () => {
      load();
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(() => setPlaying(false));
    };

    video.addEventListener('playing', () => setPlaying(true));
    video.addEventListener('pause', () => setPlaying(false));
    setPlaying(false);

    toggle.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    if (!('IntersectionObserver' in window)) {
      if (!userPaused) play();
      return;
    }

    // Start downloading a little before the frame scrolls in.
    const nearObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        if (!userPaused) load();
        nearObserver.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    nearObserver.observe(frame);

    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        if (inView && !userPaused) play();
        else if (!inView && !video.paused) video.pause();
      });
    }, { threshold: 0.25 }).observe(frame);

    // If the preference changes while the page is open, follow it.
    reduceMotion.addEventListener('change', (e) => {
      if (e.matches) {
        userPaused = true;
        video.pause();
      }
    });
  });

  /*---------------------
    Floating buttons: step aside while a CTA sits under them
    Each button (WhatsApp, back to top) watches only its own band of the
    viewport (rootMargin trims everything above it, and below it for the
    back-to-top button, which sits above WhatsApp). Any CTA inside that
    band that also reaches the button's column hides it (.is-tucked) —
    it comes back as soon as the CTA scrolls out of the band. Mostly
    matters on phones, where full-width buttons always reach the right
    edge.
  --------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    const floatBtn = document.querySelector('.whatsapp-float');
    const backBtn = document.getElementById('backToTopBtn');
    const buttons = [floatBtn, backBtn].filter(Boolean);

    if (!buttons.length || !('IntersectionObserver' in window)) return;

    // CTAs, plus the trust strip's benefits (its right column sits
    // exactly under the button on phones).
    const ctas = Array.from(document.querySelectorAll(
      '.gn-btn, .gn-seg-link, .ready-btn, .cta-demo, .gn-sol-alt, a[href*="wa.me/"], a[href*="api.whatsapp.com/send"], button[type="submit"], #verificador button, .gn-trust-list li'
    )).filter((el) => !buttons.includes(el) && !el.closest('nav, .menubar'));

    let observers = [];

    const watchButton = (btn) => {
      const covering = new Set();
      btn.classList.remove('is-tucked');

      // From the fixed bottom/right offsets, not getBoundingClientRect(),
      // so a mid-transition transform can't skew the band. Band = from
      // 16px above the button down to the viewport bottom (WhatsApp) or
      // to 16px below the button (back to top).
      const cs = getComputedStyle(btn);
      const bottom = parseFloat(cs.bottom);
      const bandTop = Math.max(0, window.innerHeight - bottom - btn.offsetHeight - 16);
      const bandBottom = btn === floatBtn ? 0 : Math.max(0, bottom - 16);
      const columnLeft = document.documentElement.clientWidth - parseFloat(cs.right) - btn.offsetWidth - 16;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const reachesColumn = entry.boundingClientRect.right > columnLeft;
          if (entry.isIntersecting && reachesColumn) {
            covering.add(entry.target);
          } else {
            covering.delete(entry.target);
          }
        });
        btn.classList.toggle('is-tucked', covering.size > 0);
      }, { rootMargin: `-${Math.round(bandTop)}px 0px -${Math.round(bandBottom)}px 0px` });

      ctas.forEach((el) => observer.observe(el));
      return observer;
    };

    const watch = () => {
      observers.forEach((o) => o.disconnect());
      observers = buttons.map(watchButton);
    };

    watch();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(watch, 200);
    });
  });

})(jQuery);
