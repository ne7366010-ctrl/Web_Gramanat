(function () {
  "use strict";

  var DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.querySelector(".webinar-search-input");
    var productSelect = document.querySelector(".webinar-product-select");
    var cards = document.querySelectorAll(".webinar-videos .ab-video-card");
    var noResults = document.querySelector(".webinar-no-results");

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
    }

    searchInput.addEventListener("input", applyFilters);
    productSelect.addEventListener("change", applyFilters);
  });
})();
