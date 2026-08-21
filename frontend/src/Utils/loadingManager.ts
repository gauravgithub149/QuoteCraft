type LoadingListener = (loading: boolean) => void;

let activeRequests = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<LoadingListener>();

export const subscribeToLoading = (listener: LoadingListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const notify = (loading: boolean) => {
  listeners.forEach((listener) => listener(loading));
};

export const startGlobalLoading = () => {
  activeRequests++;

  // Don't immediately show the loader for very fast APIs.
  if (activeRequests === 1) {
    showTimer = setTimeout(() => {
      if (activeRequests > 0) {
        notify(true);
      }
    }, 200);
  }
};

export const stopGlobalLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);

  if (activeRequests === 0) {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }

    notify(false);
  }
};