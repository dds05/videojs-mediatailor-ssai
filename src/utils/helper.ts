function throttle(fn, delay) {
  let timeout = null;
  let lastUpdated = null;
  return function (...args) {
    if (!lastUpdated) {
      fn.apply(this, args);
      lastUpdated = Date.now();
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (Date.now() - lastUpdated >= delay) {
          fn.apply(this, args);
          lastUpdated = Date.now();
        }
      }, delay - (Date.now() - lastUpdated))
    }
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export { throttle, formatTime }