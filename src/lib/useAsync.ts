import { useCallback, useEffect, useState, type DependencyList } from 'react';

export type AsyncState<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: unknown };

/**
 * Run an async load when `deps` change and track its state. Results from a
 * superseded load are discarded. Call `reload` to run it again.
 */
export function useAsync<T>(
  load: () => Promise<T>,
  deps: DependencyList,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let current = true;
    load().then(
      (data) => current && setState({ status: 'ready', data }),
      (error: unknown) => current && setState({ status: 'error', error }),
    );
    return () => {
      current = false;
    };
    // `load` is expected to be an inline closure; the caller's deps say when it changes.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [...deps, generation]);

  const reload = useCallback(() => setGeneration((n) => n + 1), []);
  return { ...state, reload };
}
