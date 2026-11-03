(function () {
  "use strict";

  var DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.querySelector(".webinar-search-input");
    var productSelect = document.querySelector(".webinar-product-select");
    var cards = document.querySelectorAll(".webinar-videos .ab-video-card");
    var noResults = document.querySelector(".webinar-no-results");
    // Screen readers: say how many videos the filters leave (WCAG 4.1.3).
    var status = document.getElementById("webinar-estado");

    if (!searchInput || !productSelect || !cards.length) {
      return;
    }

    function normalize(text) {
      return text.toLowerCase().normalize("NFD").replace(DIACRITICS_RE, "");
    }

    function applyFilters() {
      var query = normalize(searchInput.value.trim());
      var product = productSelect.value;
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matchesProduct = !product || card.dataset.producto === product;
        var matchesQuery = !query || normalize(card.textContent).indexOf(query) !== -1;
        var isVisible = matchesProduct && matchesQuery;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? "block" : "none";
      }

      if (status) {
        status.textContent = visibleCount === 0
          ? "No hay videos con esos filtros."
          : visibleCount === 1 ? "Se muestra 1 video." : "Se muestran " + visibleCount + " videos.";
      }
    }

    searchInput.addEventListener("input", applyFilters);
    productSelect.addEventListener("change", applyFilters);
  });
})();
