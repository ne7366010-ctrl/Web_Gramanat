/*---------------------
  Conversion tracking: whatsapp_click
  One delegated listener covers every wa.me link on the page, including
  the ones whose href is filled in later by main.js (verificador, FAQ,
  contact quick replies). cta_location comes from the link's data-cta
  attribute when it has one, otherwise from the nearest ancestor id.

  Ready for GA4: the event is pushed to dataLayer (picked up by Google
  Tag Manager with a Custom Event trigger on "whatsapp_click") and, if
  the gtag.js snippet is installed in <head>, also sent with gtag().
  Use one of the two, not both, or each click is counted twice.
--------------------- */

(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  function ctaLocation(link) {
    if (link.dataset.cta) return link.dataset.cta;
    const section = link.closest('[id]');
    return section ? section.id : 'sin-seccion';
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me/"]');
    if (!link) return;

    const params = {
      cta_location: ctaLocation(link),
      cta_text: link.textContent.replace(/\s+/g, ' ').trim().slice(0, 100),
      page_path: window.location.pathname,
    };
    // Diagnóstico CTA: which orientation (a code, not personal data) led here.
    if (link.dataset.orientacion) params.orientacion = link.dataset.orientacion;

    window.dataLayer.push(Object.assign({ event: 'whatsapp_click' }, params));

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', params);
    }
  }, true);
})();
