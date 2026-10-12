export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abortError = () => new DOMException('Aborted', 'AbortError');

    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(abortError());
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
