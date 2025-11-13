// ULTIMATE SCROLLBAR DESTROYER - JavaScript Approach
export const destroyAllScrollbars = () => {
  // Method 1: CSS Injection
  const style = document.createElement('style');
  style.textContent = `
    /* FORCE HIDE ALL SCROLLBARS WITH MAXIMUM PRIORITY */
    html, body, *, *::before, *::after {
      overflow: hidden !important;
      overflow-x: hidden !important;
      overflow-y: hidden !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    
    html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
      display: none !important;
      width: 0px !important;
      height: 0px !important;
      background: transparent !important;
    }
    
    /* BROWSER SPECIFIC OVERRIDES */
    ::-webkit-scrollbar { display: none !important; width: 0 !important; }
    ::-webkit-scrollbar-track { display: none !important; }
    ::-webkit-scrollbar-thumb { display: none !important; }
    ::-webkit-scrollbar-corner { display: none !important; }
  `;
  style.setAttribute('data-scrollbar-destroyer', 'true');
  document.head.appendChild(style);

  // Method 2: Direct DOM Manipulation
  const hideScrollbars = () => {
    // Hide body scrollbars
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'hidden';

    // Hide all element scrollbars
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.style.overflow = 'hidden';
      element.style.overflowX = 'hidden';
      element.style.overflowY = 'hidden';
      element.style.scrollbarWidth = 'none';
      element.style.msOverflowStyle = 'none';
    });
  };

  // Method 3: MutationObserver to catch dynamic elements
  const observer = new MutationObserver(() => {
    hideScrollbars();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Method 4: Interval-based enforcement
  const enforceNoScrollbars = () => {
    hideScrollbars();
    
    // Remove any scrollbar-related classes
    document.querySelectorAll('*').forEach(element => {
      if (element.style.overflow !== 'hidden') {
        element.style.overflow = 'hidden';
      }
    });
  };

  // Run immediately and every 100ms
  hideScrollbars();
  setInterval(enforceNoScrollbars, 100);

  // Method 5: Event listeners for scroll prevention
  const preventScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Disable all scroll events
  window.addEventListener('scroll', preventScroll, { passive: false });
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  document.addEventListener('scroll', preventScroll, { passive: false });

  console.log('🚀 ULTIMATE SCROLLBAR DESTROYER ACTIVATED!');
};

// Auto-execute when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', destroyAllScrollbars);
} else {
  destroyAllScrollbars();
}
