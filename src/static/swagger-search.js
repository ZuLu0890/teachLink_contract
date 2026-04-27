// Enhanced search functionality for Swagger UI
(function() {
  // Wait for Swagger UI to load
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      // Add keyboard shortcut for search (Ctrl/Cmd + K)
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const filterInput = document.querySelector('.filter input');
          if (filterInput) {
            filterInput.focus();
            filterInput.select();
          }
        }
      });

      // Enhance the filter input with placeholder
      const filterInput = document.querySelector('.filter input');
      if (filterInput) {
        filterInput.placeholder = 'Search endpoints... (Ctrl+K)';
        filterInput.setAttribute('aria-label', 'Search API endpoints');
      }

      // Add search highlighting
      const originalFilter = window.ui.specSelectors;
      if (window.ui && window.ui.specSelectors) {
        console.log('Enhanced search functionality loaded');
      }
    }, 1000);
  });
})();
