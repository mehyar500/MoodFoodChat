// utils.js
export function stringifySafely(value) {
    const cache = new Set();
  
    return JSON.stringify(value, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          // Remove circular reference
          return;
        }
        cache.add(value);
      }
      return value;
    });
};