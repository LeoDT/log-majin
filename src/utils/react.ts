import { Context, createContext, useContext as reactUseContext } from 'react';

export function createContextNoNullCheck<T>(
  defaults?: T,
): [() => T, Context<T | void>] {
  const context = createContext<T | void>(defaults);

  function useContext(): T {
    const c = reactUseContext(context);

    if (!c)
      throw new Error('useContext must be inside a Provider with a value');
    return c;
  }

  return [useContext, context];
}
