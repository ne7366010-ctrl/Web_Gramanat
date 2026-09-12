(function($) {
  "use strict";

  /*---------------------
   Preloader
  --------------------- */
  $(window).on('load', function() {
    var pre_loader = $('#preloader');
    pre_loader.fadeOut('slow', function() {
      $(this).remove();
    });
    
    // Inicializar sliders después de que la página esté cargada
    initPropertySliders();
  });

  /*---------------------
   Nivo slider
  --------------------- */
  $('#ensign-nivoslider').nivoSlider({
    effect: 'random',
    slices: 15,
    boxCols: 12,
    boxRows: 8,
    animSpeed: 500,
    pauseTime: 5000,
    startSlide: 0,
    directionNav: true,
    controlNavThumbs: false,
    pauseOnHover: true,
    manualAdvance: false,
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
    $('html, body').stop().animate({
      scrollTop: $($anchor.attr('href')).offset().top - 55
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
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

      if (scrollTop > 200) {
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

})(jQuery);