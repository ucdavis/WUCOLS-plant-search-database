// Minimal polyfill for xlsx library
if (typeof globalThis !== 'undefined') {
  // @ts-ignore
  if (!globalThis.cptable) {
    // @ts-ignore
    globalThis.cptable = {};
  }
}

export {};
