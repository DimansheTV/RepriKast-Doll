export function createAppStore(initialState: Record<string, unknown> = {}) {
  let state = initialState;
  const subscribers = new Set<(nextState: Record<string, unknown>) => void>();

  function notify() {
    subscribers.forEach((listener) => listener(state));
  }

  return {
    getState() {
      return state;
    },
    replace(nextState: Record<string, unknown>) {
      state = nextState;
      notify();
    },
    mutate(mutator: (draft: Record<string, unknown>) => void) {
      mutator(state);
      notify();
      return state;
    },
    subscribe(listener: (nextState: Record<string, unknown>) => void) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
  };
}
