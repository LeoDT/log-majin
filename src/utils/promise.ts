export async function maybePromise<V>(p: V | Promise<V>) {
  return p instanceof Promise ? await p : p;
}
