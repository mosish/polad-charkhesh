type UnloadHost = Pick<Window, 'onbeforeunload'>;
const guards = new WeakMap<UnloadHost, { count: number; previous: Window['onbeforeunload']; guard: (event: BeforeUnloadEvent) => string }>();
/** Property-handler return value retains legacy browser support without Event.returnValue. */
export function installUnloadGuard(host: UnloadHost): () => void {
  let entry = guards.get(host);
  if (!entry) {
    entry = { count: 0, previous: host.onbeforeunload, guard: event => {
      event.preventDefault();
      return 'Unsaved changes';
    } };
    guards.set(host, entry);
    host.onbeforeunload = entry.guard;
  }
  entry.count++;
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    if (--entry.count === 0) {
      if (host.onbeforeunload === entry.guard) host.onbeforeunload = entry.previous;
      guards.delete(host);
    }
  };
}
