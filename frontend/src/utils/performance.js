/**
 * Performance Utilities
 * - Performance monitoring
 * - Performance optimization helpers
 */

// Performance observer for monitoring
export const observePerformance = () => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    // Observe long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration, 'ms');
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Observe paint timing
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`${entry.name}:`, entry.startTime, 'ms');
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    return () => {
      longTaskObserver.disconnect();
      paintObserver.disconnect();
    };
  } catch (e) {
    console.warn('Performance observer not supported:', e);
  }
};

// Measure function execution time
export const measurePerformance = (fn, label = 'Function') => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (end - start > 16) { // Log if > 16ms (one frame)
      console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Lazy load images
export const lazyLoadImage = (imgElement, src) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          imgElement.src = src;
          observer.unobserve(imgElement);
        }
      });
    });
    observer.observe(imgElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = src;
  }
};

